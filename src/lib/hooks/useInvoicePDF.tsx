import { useState } from 'react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// @ts-ignore
import { createRoot } from 'react-dom/client';
import { supabase } from '@/lib/supabase/client';
import InvoicePreview from '@/app/create-invoice/components/InvoicePreview';
import type { Invoice, Client, InvoiceItem, BusinessProfile } from '@/types/database';

export const useInvoicePDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const numberOrZero = (val: any) => Number(val) || 0;



  /* 
   * Helper to generate PDF object 
   */
  const _generatePDF = async (invoiceId: string, data?: any) => {
     let root: any = null;
     let container: HTMLElement | null = null;
     
     try {
      let previewProps: any = data;

      // If no data provided, fetch it
      if (!data) {
        const { data: invoice, error } = await supabase
          .from('invoices')
          .select(`
            *,
            items:invoice_items(*),
            client:clients(*),
            business_profile:business_profiles(*)
          `)
          .eq('id', invoiceId)
          .single();

        if (error) throw new Error('Failed to fetch invoice details');
        if (!invoice) throw new Error('Invoice not found');

        // Standardize items
        const items = (invoice.items || []).map((item: any) => ({
          ...item,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          amount: Number(item.amount),
        }));

        // Prepare details object
        const details = {
          invoiceNumber: invoice.invoice_number,
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          paymentTerms: invoice.payment_terms,
        };

        previewProps = {
          businessProfile: invoice.business_profile,
          client: invoice.client,
          details,
          items,
          taxRate: numberOrZero(invoice.tax_rate),
          discount: numberOrZero(invoice.discount),
          currency: invoice.currency || 'KES',
          notes: invoice.notes,
          terms: invoice.terms,
          selectedTemplate: invoice.template || 'professional',
        };
      }

      // Render InvoicePreview to a hidden container
      container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '1200px'; 
      document.body.appendChild(container);

      root = createRoot(container);
      
      await new Promise<void>((resolve) => {
         root.render(
          <div id="pdf-capture-target" className="p-8 bg-white text-black font-sans">
             <InvoicePreview {...previewProps} />
          </div>
         );
         setTimeout(() => resolve(), 1500); 
      });

      const element = container?.querySelector('#pdf-capture-target') as HTMLElement;
      if (!element) throw new Error('Capture target not found');

      const canvas = await html2canvas(element, {
        scale: 1.5, // Reduced from 2 to 1.5 for better size/quality balance
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Use JPEG with 0.75 quality instead of PNG for significant size reduction
      const imgData = canvas.toDataURL('image/jpeg', 0.75);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true, // Enable PDF compression
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = pdfWidth / imgWidth;
      const imgProps = pdf.getImageProperties(imgData);
      const componentHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, componentHeight);
      
      return { pdf, previewProps };

    } finally {
      if (root) {
        setTimeout(() => {
          root.unmount();
          if (container && document.body.contains(container)) {
            document.body.removeChild(container);
          }
        }, 500);
      }
    }
  };

  const downloadPDF = async (invoiceId: string, data?: any) => {
    setIsGenerating(true);
    const toastId = toast.loading('Preparing invoice PDF...');
    try {
      const { pdf, previewProps } = await _generatePDF(invoiceId, data);
      pdf.save(`Invoice_${previewProps.details.invoiceNumber}.pdf`);
      toast.success('Invoice downloaded successfully', { id: toastId });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF. Please try again.', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDFBase64 = async (invoiceId: string, data?: any) => {
     setIsGenerating(true);
     //const toastId = toast.loading('Preparing invoice for email...');
     try {
       const { pdf } = await _generatePDF(invoiceId, data);
       return pdf.output('datauristring');
     } catch (error) {
       console.error('PDF Generation Error:', error);
       //toast.error('Failed to generate PDF for email.', { id: toastId });
       throw error;
     } finally {
       setIsGenerating(false);
     }
  };

  return { downloadPDF, generatePDFBase64, isGenerating };
};
