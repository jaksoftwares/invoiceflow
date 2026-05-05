'use client';

import { useCallback, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Invoice, InvoiceItem, Client, BusinessProfile } from '@/types/database';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { trackActionAction } from '@/lib/actions/subscription';
import React from 'react';
import { createRoot } from 'react-dom/client';
import InvoicePreview from '@/app/create-invoice/components/InvoicePreview';

interface GeneratePDFOptions {
  invoice?: Invoice;
  items?: InvoiceItem[];
  client?: Client;
  businessProfile?: BusinessProfile;
  fileName?: string;
  template?: string;
  watermarkEnabled?: boolean;
}

export const useInvoicePDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const generatePDF = useCallback(async (options: GeneratePDFOptions = {}) => {
    const { fileName, invoice, items, client, businessProfile, template, watermarkEnabled = false } = options;
    
    setIsGenerating(true);
    const toastId = toast.loading('Generating PDF...');

    try {
      let element: HTMLElement | null = null;
      let cleanup: (() => void) | null = null;

      // Case 1: Data-driven approach (Render EXACT SAME component for 1:1 consistency)
      if (invoice) {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-10000px';
        container.style.top = '0';
        container.style.width = '210mm';
        container.style.background = 'white';
        document.body.appendChild(container);

        const root = createRoot(container);
        
        const invoiceDetails = {
          invoiceNumber: invoice.invoice_number,
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          paymentTerms: invoice.payment_terms || 'net_30',
        };

        const templateToUse = template || invoice.template || 'default';

        root.render(
          React.createElement('div', { className: 'bg-white p-0' },
            React.createElement(InvoicePreview, {
              businessProfile: businessProfile || null,
              client: client || null,
              details: invoiceDetails,
              items: items || [],
              taxRate: invoice.tax_rate || 0,
              discount: invoice.discount || 0,
              currency: invoice.currency || 'USD',
              notes: invoice.notes || '',
              terms: invoice.terms || '',
              selectedTemplate: templateToUse,
              fullSize: true,
              watermarkEnabled: watermarkEnabled,
              documentType: invoice.type,
            })
          )
        );

        // Wait for React and images
        await new Promise(resolve => setTimeout(resolve, 1000));
        element = container;
        cleanup = () => {
          root.unmount();
          document.body.removeChild(container);
        };
      } else {
        // Case 2: Capture from existing DOM (fastest for current view)
        element = document.getElementById('invoice-pdf-container') || document.getElementById('invoice-preview-container');
        if (!element) throw new Error('Invoice preview not found.');
      }

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      if (cleanup) cleanup();

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = canvas.width / 2 / 3.78;
      const pdfHeight = canvas.height / 2 / 3.78;
      
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'l' : 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      let docType = (invoice?.type || 'invoice') as string;
      if (docType === 'invoice' && invoice?.invoice_number) {
        if (invoice.invoice_number.toUpperCase().startsWith('QTN-')) docType = 'quotation';
        else if (invoice.invoice_number.toUpperCase().startsWith('RCT-')) docType = 'receipt';
      }
      const docTypeLabel = docType.charAt(0).toUpperCase() + docType.slice(1);
      const finalFileName = fileName || `${docTypeLabel}-${invoice?.invoice_number || 'draft'}-${Date.now()}.pdf`;
      pdf.save(finalFileName);
      
      if (invoice?.id) {
        await trackActionAction('pdf_downloads', invoice.id, { fileName: finalFileName });
      }

      toast.success('PDF downloaded successfully', { id: toastId });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadInvoice = useCallback(async (invoiceId: string) => {
    setIsGenerating(true);
    const toastId = toast.loading('Preparing download...');
    try {
      const { data: invoiceRes, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, client:clients(*), business:business_profiles(*)')
        .eq('id', invoiceId)
        .single();

      const { data: itemsRes, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (invoiceError || itemsError) throw new Error('Failed to fetch invoice data');

      await generatePDF({
        invoice: invoiceRes,
        items: itemsRes || [],
        client: (invoiceRes as any).client,
        businessProfile: (invoiceRes as any).business,
        template: invoiceRes.template,
      });
    } catch (error) {
      toast.error('Download failed', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  }, [generatePDF]);

  const generatePDFBase64 = useCallback(async (invoiceId: string): Promise<string> => {
    setIsGenerating(true);
    const toastId = toast.loading('Preparing email attachment...');

    try {
      const { data: invoiceRes, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, client:clients(*), business:business_profiles(*)')
        .eq('id', invoiceId)
        .single();

      const { data: itemsRes, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (invoiceError || itemsError) throw new Error('Data fetch failed');

      const invoice = invoiceRes;
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-10000px';
      container.style.width = '210mm';
      container.style.background = 'white';
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(
        React.createElement('div', { className: 'bg-white p-0' },
          React.createElement(InvoicePreview, {
            businessProfile: (invoice as any).business || null,
            client: (invoice as any).client || null,
            details: {
              invoiceNumber: invoice.invoice_number,
              issueDate: invoice.issue_date,
              dueDate: invoice.due_date,
              paymentTerms: invoice.payment_terms || 'net_30'
            },
            items: itemsRes || [],
            taxRate: invoice.tax_rate || 0,
            discount: invoice.discount || 0,
            currency: invoice.currency || 'USD',
            notes: invoice.notes || '',
            terms: invoice.terms || '',
            selectedTemplate: invoice.template || 'default',
            fullSize: true,
            watermarkEnabled: true,
            documentType: invoice.type,
          })
        )
      );

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const canvas = await html2canvas(container, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      root.unmount();
      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      toast.success('Attached!', { id: toastId });
      return pdf.output('datauristring');
    } catch (error) {
      toast.error('Failed to prepare attachment', { id: toastId });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadFromDOM = useCallback(async (fileName: string, data?: any) => {
    if (data?.invoice) {
        return generatePDF({
            fileName,
            invoice: data.invoice,
            items: data.items,
            client: data.client,
            businessProfile: data.business,
            template: data.invoice.template
        });
    }
    return generatePDF({ fileName });
  }, [generatePDF]);

  const previewInNewTab = useCallback(async () => {
     toast.info('Feature coming soon');
  }, []);

  return {
    isGenerating,
    generatePDF,
    downloadInvoice,
    generatePDFBase64,
    downloadFromDOM,
    previewInNewTab,
    previewRef
  };
};
