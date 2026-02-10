'use server';

import { createClient } from '@/lib/supabase/server';
import { postmarkClient } from '@/lib/postmark';

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

  // 1. Fetch Invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('business_id, invoice_number, slug')
    .eq('id', invoiceId)
    .single();

  if (invoiceError || !invoice) {
    throw new Error('Invoice not found');
  }

  // 2. Fetch Business Profile to get Business Name (for Sender Name) and Owner Email (for Reply-To)
  const { data: business, error: businessError } = await supabase
    .from('business_profiles')
    .select('name, owner_id')
    .eq('id', invoice.business_id)
    .single();

  if (businessError || !business) {
    throw new Error('Business profile not found');
  }
  
  // Use current user's email for Reply-To as they are the ones sending it
  const replyToEmail = user.email || 'no-reply@dovepeakdigital.com'; 

  // 3. Prepare Email content
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const invoiceLink = `${baseUrl}/invoice/view/${invoice.slug || invoiceId}`;
  
  // Remove data URI prefix for Postmark
  const pdfContent = pdfBase64.split(',')[1];
  
  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Invoice from ${business.name}</h2>
      <p style="white-space: pre-wrap;">${emailData.message}</p>
      <div style="margin: 20px 0;">
        <a href="${invoiceLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Invoice Online</a>
      </div>
      <p style="color: #666; font-size: 14px;">Or paste this link into your browser: <br> ${invoiceLink}</p>
    </div>
  `;

  // 4. Send via Postmark
  try {
    const result = await postmarkClient.sendEmail({
      From: `${business.name} <contact@dovepeakdigital.com>`,
      To: emailData.to,
      ReplyTo: replyToEmail,
      Subject: emailData.subject,
      HtmlBody: htmlBody,
      TextBody: `${emailData.message}\n\nView Invoice: ${invoiceLink}`,
      Attachments: [
        {
          Name: `Invoice_${invoice.invoice_number}.pdf`,
          Content: pdfContent,
          ContentType: 'application/pdf',
          ContentID: `cid:Invoice_${invoice.invoice_number}.pdf`,
        },
      ],
    });

    console.log('Postmark sent:', result);

    if (emailData.copyMe && user.email) {
       // Send copy to sender
       await postmarkClient.sendEmail({
        From: `${business.name} <contact@dovepeakdigital.com>`,
        To: user.email,
        ReplyTo: replyToEmail,
        Subject: `[COPY] ${emailData.subject}`,
        HtmlBody: `<p style="color: #666;">This is a copy of the invoice sent to ${emailData.to}.</p><hr>` + htmlBody,
        TextBody: `This is a copy of the invoice sent to ${emailData.to}.\n\n` + `${emailData.message}\n\nView Invoice: ${invoiceLink}`,
        Attachments: [
          {
            Name: `Invoice_${invoice.invoice_number}.pdf`,
            Content: pdfContent,
            ContentType: 'application/pdf',
            ContentID: `cid:Invoice_${invoice.invoice_number}.pdf`,
          },
        ],
      });
    }

    return { success: true, messageId: result.MessageID };
  } catch (error) {
    console.error('Error sending email via Postmark:', error);
    throw new Error(`Failed to send email: ${(error as Error).message}`);
  }
}

