'use client';

import { useCallback, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Invoice, InvoiceItem, Client, BusinessProfile } from '@/types/database';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface GeneratePDFOptions {
  invoice?: Invoice;
  items?: InvoiceItem[];
  client?: Client;
  businessProfile?: BusinessProfile;
  fileName?: string;
  template?: string;
}

export const useInvoicePDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const generatePDF = useCallback(async (options: GeneratePDFOptions = {}) => {
    const { fileName, invoice, items, client, businessProfile, template } = options;
    
    setIsGenerating(true);
    const toastId = toast.loading('Generating PDF...');

    try {
      // If we have invoice data passed directly, create the PDF from data
      if (invoice) {
        // Get the template to use (default to 'professional')
        const templateToUse = template || invoice.template || 'professional';
        
        // Calculate totals
        const subtotal = items?.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0) || 0;
        const discountAmount = (subtotal * (invoice.discount || 0)) / 100;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = (taxableAmount * (invoice.tax_rate || 0)) / 100;
        const total = taxableAmount + taxAmount;

        // Create a temporary container to render the invoice
        const container = document.createElement('div');
        container.style.width = '210mm';
        container.style.minHeight = '297mm';
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.background = 'white';
        container.style.padding = '0';
        
        // Build invoice HTML based on template
        let invoiceHTML = '';
        const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(amount);
        const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Professional Template
        if (templateToUse === 'professional') {
          invoiceHTML = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; min-height: 297mm; box-sizing: border-box;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
                <div>
                  <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #0f172a;">${businessProfile?.name || 'Company'}</h1>
                  <p style="color: #64748b; font-size: 12px; margin: 8px 0 4px;">${businessProfile?.address || ''}</p>
                  <p style="color: #64748b; font-size: 12px; margin: 4px 0;">${businessProfile?.city || ''}${businessProfile?.city && businessProfile?.country ? ', ' : ''}${businessProfile?.country || ''}</p>
                  ${businessProfile?.email ? `<p style="color: #64748b; font-size: 12px; margin: 4px 0;">${businessProfile.email}</p>` : ''}
                  ${businessProfile?.phone ? `<p style="color: #64748b; font-size: 12px; margin: 4px 0;">${businessProfile.phone}</p>` : ''}
                </div>
                <div style="text-align: right;">
                  <h2 style="font-size: 36px; font-weight: 700; color: #3b82f6; margin: 0; letter-spacing: 2px;">INVOICE</h2>
                  <p style="color: #64748b; font-size: 14px; margin: 12px 0 0;">#${invoice.invoice_number}</p>
                </div>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 40px; padding: 24px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px;">
                <div>
                  <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; margin: 0 0 12px; letter-spacing: 1px;">Bill To</p>
                  <p style="font-weight: 600; font-size: 16px; margin: 0; color: #0f172a;">${client?.company_name || 'Client'}</p>
                  ${client?.contact_person ? `<p style="color: #64748b; font-size: 14px; margin: 8px 0 0;">${client.contact_person}</p>` : ''}
                  ${client?.email ? `<p style="color: #3b82f6; font-size: 14px; margin: 4px 0;">${client.email}</p>` : ''}
                  ${client?.address ? `<p style="color: #64748b; font-size: 14px; margin: 4px 0;">${client.address}</p>` : ''}
                </div>
                <div style="text-align: right;">
                  <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; margin: 0 0 12px; letter-spacing: 1px;">Invoice Details</p>
                  <p style="margin: 6px 0; font-size: 14px;"><span style="color: #64748b;">Issue Date:</span> <span style="color: #0f172a; font-weight: 500;">${formatDate(invoice.issue_date)}</span></p>
                  <p style="margin: 6px 0; font-size: 14px;"><span style="color: #64748b;">Due Date:</span> <span style="color: #0f172a; font-weight: 500;">${formatDate(invoice.due_date)}</span></p>
                  <p style="margin: 6px 0; font-size: 14px;"><span style="color: #64748b;">Terms:</span> <span style="color: #0f172a; font-weight: 500; text-transform: capitalize;">${invoice.payment_terms?.replace('_', ' ') || 'Net 30'}</span></p>
                </div>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; table-layout: fixed;">
                <thead>
                  <tr style="background: #0f172a;">
                    <th style="padding: 14px 12px; text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Description</th>
                    <th style="padding: 14px 12px; text-align: right; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; width: 80px;">Qty</th>
                    <th style="padding: 14px 12px; text-align: right; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; width: 100px;">Rate</th>
                    <th style="padding: 14px 12px; text-align: right; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; width: 100px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${items?.map((item: any) => `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 16px 12px; font-size: 14px; color: #334155;">${item.description || ''}</td>
                      <td style="padding: 16px 12px; text-align: right; font-size: 14px; color: #64748b;">${item.quantity}</td>
                      <td style="padding: 16px 12px; text-align: right; font-size: 14px; color: #64748b;">${formatCurrency(item.rate)}</td>
                      <td style="padding: 16px 12px; text-align: right; font-size: 14px; font-weight: 600; color: #0f172a;">${formatCurrency(item.quantity * item.rate)}</td>
                    </tr>
                  `).join('') || ''}
                </tbody>
              </table>
              
              <div style="display: flex; justify-content: end;">
                <div style="width: 280px;">
                  <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">Subtotal</span>
                    <span style="font-size: 14px; font-weight: 500;">${formatCurrency(subtotal)}</span>
                  </div>
                  ${invoice.tax_rate > 0 ? `
                  <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">Tax (${invoice.tax_rate}%)</span>
                    <span style="font-size: 14px; font-weight: 500;">${formatCurrency(taxAmount)}</span>
                  </div>
                  ` : ''}
                  ${invoice.discount > 0 ? `
                  <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #10b981;">
                    <span style="font-size: 14px;">Discount</span>
                    <span style="font-size: 14px; font-weight: 500;">-${formatCurrency(discountAmount)}</span>
                  </div>
                  ` : ''}
                  <div style="display: flex; justify-content: space-between; padding: 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); margin-top: 8px; border-radius: 8px; padding: 16px;">
                    <span>Total</span>
                    <span style="color: #3b82f6;">${formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
              
              ${invoice.notes ? `
              <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; margin: 0 0 8px; letter-spacing: 1px;">Notes</p>
                <p style="font-size: 14px; color: #64748b; line-height: 1.6;">${invoice.notes}</p>
              </div>
              ` : ''}
              
              ${invoice.terms ? `
              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; margin: 0 0 8px; letter-spacing: 1px;">Terms & Conditions</p>
                <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">${invoice.terms}</p>
              </div>
              ` : ''}
            </div>
          `;
        } else {
          // Default/Simple template for other templates
          invoiceHTML = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; min-height: 297mm; box-sizing: border-box;">
              <div style="margin-bottom: 30px;">
                <h1 style="font-size: 24px; font-weight: bold; margin: 0;">${businessProfile?.name || 'Company'}</h1>
                <p style="color: #666; font-size: 12px; margin: 4px 0;">${businessProfile?.city || ''} ${businessProfile?.country || ''}</p>
              </div>
              
              <div style="text-align: right; margin-bottom: 30px;">
                <h2 style="font-size: 28px; font-weight: bold; color: #333; margin: 0;">INVOICE</h2>
                <p style="color: #666; font-size: 14px; margin: 8px 0 0;">#${invoice.invoice_number}</p>
              </div>
              
              <div style="margin-bottom: 30px; padding: 15px; background: #f9f9f9; border-radius: 4px;">
                <p style="font-size: 11px; color: #999; text-transform: uppercase; margin: 0 0 8px;">Bill To</p>
                <p style="font-weight: bold; font-size: 14px; margin: 0;">${client?.company_name || 'Client'}</p>
                <p style="color: #666; font-size: 12px; margin: 4px 0 0;">${client?.email || ''}</p>
                <p style="color: #666; font-size: 12px; margin: 4px 0;">${client?.address || ''}</p>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background: #333; color: white;">
                    <th style="padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase;">Description</th>
                    <th style="padding: 10px; text-align: right; font-size: 11px; text-transform: uppercase;">Qty</th>
                    <th style="padding: 10px; text-align: right; font-size: 11px; text-transform: uppercase;">Rate</th>
                    <th style="padding: 10px; text-align: right; font-size: 11px; text-transform: uppercase;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${items?.map((item: any) => `
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 12px; font-size: 13px;">${item.description || ''}</td>
                      <td style="padding: 12px; text-align: right; font-size: 13px;">${item.quantity}</td>
                      <td style="padding: 12px; text-align: right; font-size: 13px;">${formatCurrency(item.rate)}</td>
                      <td style="padding: 12px; text-align: right; font-size: 13px; font-weight: bold;">${formatCurrency(item.quantity * item.rate)}</td>
                    </tr>
                  `).join('') || ''}
                </tbody>
              </table>
              
              <div style="text-align: right;">
                <p style="margin: 6px 0; font-size: 14px;"><span style="color: #666;">Subtotal:</span> ${formatCurrency(subtotal)}</p>
                ${invoice.tax_rate > 0 ? `<p style="margin: 6px 0; font-size: 14px;"><span style="color: #666;">Tax (${invoice.tax_rate}%):</span> ${formatCurrency(taxAmount)}</p>` : ''}
                ${invoice.discount > 0 ? `<p style="margin: 6px 0; font-size: 14px; color: green;"><span style="color: #666;">Discount:</span> -${formatCurrency(discountAmount)}</p>` : ''}
                <p style="margin: 12px 0 0; font-size: 18px; font-weight: bold;">Total: ${formatCurrency(total)}</p>
              </div>
              
              ${invoice.notes ? `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;"><p style="font-size: 11px; color: #999; text-transform: uppercase; margin: 0 0 8px;">Notes</p><p style="font-size: 12px; color: #666;">${invoice.notes}</p></div>` : ''}
            </div>
          `;
        }
        
        container.innerHTML = invoiceHTML;
        document.body.appendChild(container);
        
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        
        document.body.removeChild(container);
        
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = canvas.width / 2 / 3.78;
        const pdfHeight = canvas.height / 2 / 3.78;
        
        const pdf = new jsPDF({
          orientation: pdfWidth > pdfHeight ? 'l' : 'p',
          unit: 'mm',
          format: [pdfWidth, pdfHeight],
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        const invoiceNum = (invoice.invoice_number || 'draft')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-');
        const clientName = client?.company_name 
          ? client.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
          : 'no-client';
        const finalFileName = fileName || `Invoice-${invoiceNum}-${clientName}.pdf`;
        pdf.save(finalFileName);
        
        toast.success('PDF downloaded successfully', { id: toastId });
        setIsGenerating(false);
        return;
      }
      
      // Otherwise try to find DOM elements (for create-invoice page)
      let element = document.getElementById('invoice-pdf-container');
      
      if (!element) {
        element = document.getElementById('invoice-preview-container');
      }
      
      if (!element) {
        throw new Error('Invoice preview not found. Please try again.');
      }

      // Get the actual content - try to find the invoice content div
      const content = element.querySelector('[style*="minHeight"]') || element;
      const scrollWidth = element.scrollWidth || 794; // A4 width in pixels at 96dpi
      const scrollHeight = element.scrollHeight || 1123; // A4 height in pixels

      // Configure html2canvas with proper settings for full capture
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: scrollWidth,
        width: scrollWidth,
        height: scrollHeight,
        x: 0,
        y: 0,
      });

      // 3. Configure jsPDF - use the image dimensions to set PDF size
      const imgData = canvas.toDataURL('image/png');
      const imgProps = canvas;
      
      // Convert canvas dimensions to mm (canvas is at 2x scale)
      const pdfWidth = canvas.width / 2 / 3.78;  // Convert pixels to mm
      const pdfHeight = canvas.height / 2 / 3.78;
      
      // Create PDF with custom size based on content
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'l' : 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      // Add the image - it will fill the entire PDF page
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // 4. Download PDF
      const finalFileName = fileName || `Invoice-draft-${Date.now()}.pdf`;
      pdf.save(finalFileName);

      toast.success('PDF downloaded successfully', { id: toastId });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF. Please try again.', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadInvoice = useCallback(async (invoiceId: string) => {
    setIsGenerating(true);
    const toastId = toast.loading('Preparing invoice for download...');

    try {
      // Fetch all necessary data for the PDF
      const [invoiceRes, itemsRes] = await Promise.all([
        supabase.from('invoices').select('*, client:clients(*), business:business_profiles(*)').eq('id', invoiceId).single(),
        supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId)
      ]);

      if (invoiceRes.error) throw invoiceRes.error;
      if (itemsRes.error) throw itemsRes.error;

      const invoiceData = invoiceRes.data;
      const itemsData = itemsRes.data;
      const clientData = invoiceRes.data.client;
      const businessData = invoiceRes.data.business;

      // Store data for potential use
      // Create descriptive filename: Invoice-INV-number-client-name.pdf
      const invoiceNum = (invoiceData.invoice_number || 'draft')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const clientName = clientData?.company_name 
        ? clientData.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
        : 'no-client';
      await generatePDF({
        invoice: invoiceData,
        items: itemsData,
        client: clientData,
        businessProfile: businessData,
        template: invoiceData.template,
        fileName: `Invoice-${invoiceNum}-${clientName}.pdf`
      });

    } catch (error) {
      console.error('Download Error:', error);
      toast.error('Failed to prepare download', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  }, [generatePDF]);

  const previewInNewTab = useCallback(async () => {
     const element = document.getElementById('invoice-preview-container');
     if (!element) {
       toast.error('Preview not found');
       return;
     }

     try {
       const canvas = await html2canvas(element, { scale: 2, useCORS: true });
       const imgData = canvas.toDataURL('image/png');
       const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
       
       const imgProps = pdf.getImageProperties(imgData);
       const pdfWidth = pdf.internal.pageSize.getWidth();
       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
       
       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
       window.open(pdf.output('bloburl'), '_blank');
     } catch (err) {
       console.error('Preview error:', err);
       toast.error('Failed to create preview');
     }
  }, []);

  // Download PDF from an existing DOM element (used by preview modal)
  const downloadFromDOM = useCallback(async (fileName: string) => {
    setIsGenerating(true);
    const toastId = toast.loading('Generating PDF...');

    try {
      // First try the PDF container (hidden full-size), then the preview container
      let element = document.getElementById('invoice-pdf-container');
      
      if (!element) {
        element = document.getElementById('invoice-preview-container');
      }
      
      if (!element) {
        throw new Error('Invoice preview not found. Please open the preview first.');
      }

      console.log('Found element for PDF:', element.id);
      
      // Get the actual content element that contains the invoice
      const invoiceContent = element.querySelector('[class*="min-w-"]') as HTMLElement || element;
      
      const canvas = await html2canvas(invoiceContent, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: true,
      });
      
      console.log('Canvas created, dimensions:', canvas.width, 'x', canvas.height);
      
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = canvas.width / 2 / 3.78;
      const pdfHeight = canvas.height / 2 / 3.78;
      
      console.log('PDF dimensions (mm):', pdfWidth, 'x', pdfHeight);
      
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'l' : 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(fileName);
      toast.success('PDF downloaded successfully', { id: toastId });
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to generate PDF: ' + (err as Error).message, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generatePDFBase64 = useCallback(async (invoiceId: string): Promise<string> => {
    setIsGenerating(true);
    const toastId = toast.loading('Generating PDF...');

    try {
      // Fetch all necessary data for the PDF
      const [invoiceRes, itemsRes] = await Promise.all([
        supabase.from('invoices').select('*, client:clients(*), business:business_profiles(*)').eq('id', invoiceId).single(),
        supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId)
      ]);

      if (invoiceRes.error) throw invoiceRes.error;
      if (itemsRes.error) throw itemsRes.error;

      const invoiceData = invoiceRes.data;
      const itemsData = itemsRes.data;

      // Get the element to convert
      const element = document.getElementById('invoice-preview-container');
      if (!element) {
        throw new Error('Invoice preview element not found');
      }

      // Configure html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Configure jsPDF (A4 size)
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Return base64 string
      const base64 = pdf.output('datauristring');
      toast.success('PDF generated successfully', { id: toastId });
      return base64;
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF', { id: toastId });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    generatePDF,
    downloadInvoice,
    previewInNewTab,
    downloadFromDOM,
    generatePDFBase64,
    previewRef
  };
};
