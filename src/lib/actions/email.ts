'use server';

import { createClient } from '@/lib/supabase/server';
import { postmarkClient } from '@/lib/postmark';
import { checkUsageLimit, incrementUsage, logActivity } from './subscription';
import { recordClientActivity } from './activities';

export async function sendInvoiceEmail(
  invoiceId: string,
  pdfBase64: string,
  emailData: { to: string; subject: string; message: string; copyMe: boolean }
) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Check usage limit
  const usageCheck = await checkUsageLimit('emails_sent');
  if (!usageCheck.allowed) {
    throw new Error(`Email limit reached: ${usageCheck.reason}`);
  }

  // 1. Fetch Invoice with Client details
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select(`
      invoice_number, 
      slug, 
      total_amount, 
      currency, 
      due_date, 
      type,
      business_id,
      client:clients(id, company_name, contact_person)
    `)
    .eq('id', invoiceId)
    .single();

  if (invoiceError || !invoice) {
    throw new Error('Invoice not found');
  }

  // 2. Fetch Business Profile
  const { data: business, error: businessError } = await supabase
    .from('business_profiles')
    .select('name, logo_url, owner_id')
    .eq('id', invoice.business_id)
    .single();

  if (businessError || !business) {
    throw new Error('Business profile not found');
  }
  
  // Use current user's email for Reply-To
  const replyToEmail = user.email || 'no-reply@dovepeakdigital.com'; 

  // 3. Prepare Professional Email Content
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const invoiceLink = `${baseUrl}/invoice/view/${invoice.slug || invoiceId}`;
  const clientName = (invoice.client as any)?.company_name || (invoice.client as any)?.contact_person || 'Valued Client';
  const formatCurrency = (amount: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Remove data URI prefix for Postmark
  const pdfContent = pdfBase64.split(',')[1];

  // Infer effective document type
  let documentType = (invoice.type || 'invoice') as string;
  if (documentType === 'invoice' && invoice.invoice_number) {
    if (invoice.invoice_number.toUpperCase().startsWith('QTN-')) documentType = 'quotation';
    else if (invoice.invoice_number.toUpperCase().startsWith('RCT-')) documentType = 'receipt';
  }

  const displayType = documentType.charAt(0).toUpperCase() + documentType.slice(1);
  const dueDateLabel = documentType === 'quotation' ? 'Valid Until' : documentType === 'receipt' ? 'Payment Date' : 'Due Date';
  const actionText = documentType === 'quotation' ? 'View Quotation' : documentType === 'receipt' ? 'View Receipt' : 'View & Pay Invoice';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .button:hover { background-color: #2563eb !important; }
      </style>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px; background-color: #ffffff; text-align: center; border-bottom: 1px solid #f1f5f9;">
                  ${business.logo_url ? `<img src="${business.logo_url}" alt="${business.name}" style="height: 60px; margin-bottom: 20px; border-radius: 8px;">` : ''}
                  <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em;">${business.name}</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px;">Dear ${clientName},</p>
                  
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; white-space: pre-wrap;">${emailData.message}</p>

                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px;">This ${documentType} is for your recent transaction at <strong>${business.name}</strong>.</p>
                  
                  <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #f1f5f9;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 14px; color: #64748b;">${displayType} Number</td>
                        <td align="right" style="padding-bottom: 8px; font-size: 14px; font-weight: 700; color: #0f172a;">#${invoice.invoice_number}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 14px; color: #64748b;">Total Amount</td>
                        <td align="right" style="padding-bottom: 8px; font-size: 14px; font-weight: 700; color: #0f172a;">${formatCurrency(invoice.total_amount, invoice.currency)}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #64748b;">${dueDateLabel}</td>
                        <td align="right" style="font-size: 14px; font-weight: 700; color: #f43f5e;">${formatDate(invoice.due_date)}</td>
                      </tr>
                    </table>
                  </div>

                  <div align="center">
                    <a href="${invoiceLink}" class="button" style="display: inline-block; padding: 16px 32px; background-color: #3b82f6; color: #ffffff; font-weight: 700; text-decoration: none; border-radius: 12px; font-size: 16px; transition: background-color 0.2s;">${actionText}</a>
                  </div>
                  
                  <p style="margin: 32px 0 0; font-size: 16px; line-height: 24px; text-align: center; color: #0f172a; font-weight: 600;">
                    Thank you for choosing ${business.name}!
                  </p>

                  <p style="margin: 24px 0 0; font-size: 14px; color: #64748b; text-align: center;">
                    Or copy this link into your browser:<br>
                    <a href="${invoiceLink}" style="color: #3b82f6; word-break: break-all;">${invoiceLink}</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 32px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #f1f5f9;">
                  <p style="margin: 0; font-size: 14px; color: #64748b;">Sent via <strong>InvoiceFlow</strong></p>
                  <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">Secure invoicing for modern businesses</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // 4. Send via Postmark
  try {
    const result = await postmarkClient.sendEmail({
      // From InvoiceFlow but ReplyTo the business
      From: `InvoiceFlow <contact@dovepeakdigital.com>`,
      To: emailData.to,
      ReplyTo: replyToEmail,
      Subject: emailData.subject,
      HtmlBody: htmlBody,
      TextBody: `${emailData.message}\n\nThis ${documentType} is for your recent transaction at ${business.name}.\n\n${displayType} Details:\nNumber: #${invoice.invoice_number}\nAmount: ${formatCurrency(invoice.total_amount, invoice.currency)}\n${dueDateLabel}: ${formatDate(invoice.due_date)}\n\nThank you for choosing ${business.name}!\n\nView ${displayType}: ${invoiceLink}`,
      Attachments: [
        {
          Name: `${displayType}_${invoice.invoice_number}.pdf`,
          Content: pdfContent,
          ContentType: 'application/pdf',
          ContentID: `cid:${displayType}_${invoice.invoice_number}.pdf`,
        },
      ],
    });

    if (emailData.copyMe && user.email) {
       // Send copy to sender
       await postmarkClient.sendEmail({
        From: `InvoiceFlow <contact@dovepeakdigital.com>`,
        To: user.email,
        ReplyTo: replyToEmail,
        Subject: `[COPY] ${emailData.subject}`,
        HtmlBody: `<p style="padding: 20px; background-color: #f0fdf4; color: #166534; font-size: 14px; margin: 0; border-bottom: 1px solid #dcfce7;">This is a copy of the ${documentType} you sent to ${emailData.to}.</p>` + htmlBody,
        TextBody: `This is a copy of the ${documentType} you sent to ${emailData.to}.\n\n` + `${emailData.message}\n\nView ${displayType}: ${invoiceLink}`,
        Attachments: [
          {
            Name: `${displayType}_${invoice.invoice_number}.pdf`,
            Content: pdfContent,
            ContentType: 'application/pdf',
            ContentID: `cid:${displayType}_${invoice.invoice_number}.pdf`,
          },
        ],
      });
    }

    // Increment usage
    await incrementUsage('emails_sent');
    
    // Record client activity for dashboard/client history
    await recordClientActivity({
      clientId: (invoice as any).client?.id || '', 
      activity: `${displayType} #${invoice.invoice_number} sent to ${emailData.to}`,
      type: 'communication',
      metadata: { invoiceId, to: emailData.to }
    });

    return { success: true, messageId: result.MessageID };
  } catch (error) {
    console.error('Error sending email via Postmark:', error);
    throw new Error(`Failed to send email: ${(error as Error).message}`);
  }
}
