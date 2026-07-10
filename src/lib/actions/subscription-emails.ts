import { postmarkClient } from '@/lib/postmark';
import { createClient } from '@supabase/supabase-js';

interface SubscriptionEmailParams {
 userId: string;
 planName: string;
 amount: number;
 mpesaReceipt: string;
 expiryDate: string;
}

export async function sendSubscriptionConfirmationEmail({
 userId,
 planName,
 amount,
 mpesaReceipt,
 expiryDate
}: SubscriptionEmailParams) {
 // Use service role to bypass RLS and fetch user email
 const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!
 );
 
 // Fetch user email from profiles
 const { data: profile } = await supabase
 .from('profiles')
 .select('email, first_name')
 .eq('id', userId)
 .single();

 const targetEmail = profile?.email;
 const firstName = profile?.first_name || 'Customer';

 if (!targetEmail) {
 console.error('No email found for user', userId);
 return;
 }

 const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(amount);
 const formattedExpiry = new Date(expiryDate).toLocaleDateString();

 const htmlBody = `
 <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
 <div style="text-align: center; margin-bottom: 32px;">
 <div style="background: #f0f9ff; width: 64px; height: 64px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
 <span style="font-size: 32px;">⚡</span>
 </div>
 <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: -0.025em;">Subscription Upgraded!</h1>
 <p style="color: #64748b; font-size: 16px; margin: 8px 0 0;">Welcome to the ${planName} experience.</p>
 </div>

 <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid #f1f5f9;">
 <table style="width: 100%; border-collapse: collapse;">
 <tr>
 <td style="color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 8px;">Plan</td>
 <td style="color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 8px; text-align: right;">Amount Paid</td>
 </tr>
 <tr>
 <td style="color: #0f172a; font-size: 18px; font-weight: 700;">${planName}</td>
 <td style="color: #0f172a; font-size: 18px; font-weight: 700; text-align: right;">${formattedAmount}</td>
 </tr>
 </table>
 <div style="height: 1px; background: #e2e8f0; margin: 16px 0;"></div>
 <table style="width: 100%; border-collapse: collapse;">
 <tr>
 <td style="color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 4px;">M-Pesa Receipt</td>
 <td style="color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${mpesaReceipt}</td>
 </tr>
 <tr>
 <td style="color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding-top: 12px; padding-bottom: 4px;">Valid Until</td>
 <td style="color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; padding-top: 12px;">${formattedExpiry}</td>
 </tr>
 </table>
 </div>

 <div style="margin-bottom: 32px;">
 <h4 style="color: #0f172a; font-size: 14px; font-weight: 700; margin: 0 0 12px;">What's next?</h4>
 <ul style="color: #475569; font-size: 14px; padding-left: 20px; margin: 0; line-height: 1.6;">
 <li>Your new limits are now active across the app.</li>
 <li>You can now use premium templates and features.</li>
 <li>Monitor your usage in the Subscription tab.</li>
 </ul>
 </div>

 <div style="text-align: center;">
 <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://invoiceflow.dovepeakdigital.com'}/dashboard" style="background: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">Go to Dashboard</a>
 </div>

 <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
 <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 InvoiceFlow. All rights reserved.</p>
 </div>
 </div>
 `;

 try {
 const result = await postmarkClient.sendEmail({
 From: "InvoiceFlow <contact@dovepeakdigital.com>",
 To: targetEmail,
 Subject: `Your InvoiceFlow ${planName} Subscription is Active!`,
 HtmlBody: htmlBody,
 TextBody: `Your ${planName} subscription is active! Amount: ${formattedAmount}. Receipt: ${mpesaReceipt}. Valid until: ${formattedExpiry}.`,
 MessageStream: "outbound"
 });
 console.log('Subscription email sent:', result);
 return { success: true };
 } catch (error) {
 console.error('Error sending subscription email:', error);
 return { success: false, error };
 }
}

interface InvoiceEmailParams {
 userId: string;
 planName: string;
 amount: number;
 invoiceNumber: string;
}

export async function sendSubscriptionInvoiceEmail({
 userId,
 planName,
 amount,
 invoiceNumber
}: InvoiceEmailParams) {
 const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!
 );
 
 const { data: profile } = await supabase
 .from('profiles')
 .select('email, first_name')
 .eq('id', userId)
 .single();

 const targetEmail = profile?.email;
 const firstName = profile?.first_name || 'Customer';

 if (!targetEmail) return;

 const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(amount);

 const htmlBody = `
 <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
 <div style="text-align: center; margin-bottom: 32px;">
 <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: -0.025em;">Billing Invoice</h1>
 <p style="color: #64748b; font-size: 16px; margin: 8px 0 0;">Transaction #INV-${invoiceNumber.slice(0, 8).toUpperCase()}</p>
 </div>

 <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid #f1f5f9;">
 <p style="margin: 0 0 16px; color: #475569; font-size: 14px; font-weight: 600;">Hello ${firstName},</p>
 <p style="margin: 0 0 24px; color: #64748b; font-size: 14px; line-height: 1.5;">This is a billing notice for your request to upgrade to the <strong>${planName}</strong> plan. A payment request has been sent to your M-Pesa phone number.</p>
 
 <table style="width: 100%; border-collapse: collapse;">
 <tr>
 <td style="color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 8px;">Plan Description</td>
 <td style="color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 8px; text-align: right;">Total Amount</td>
 </tr>
 <tr>
 <td style="color: #0f172a; font-size: 16px; font-weight: 700;">InvoiceFlow ${planName} Subscription</td>
 <td style="color: #0f172a; font-size: 16px; font-weight: 700; text-align: right;">${formattedAmount}</td>
 </tr>
 </table>
 </div>

 <div style="margin-bottom: 32px; padding: 20px; border-radius: 16px; border: 2px dashed #e2e8f0; text-align: center;">
 <p style="color: #0f172a; font-size: 14px; font-weight: 800; margin: 0;">Status: PAYMENT PENDING</p>
 <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0;">Please authorize the STK Push on your phone to complete the upgrade.</p>
 </div>

 <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
 <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 InvoiceFlow. Proforma Invoice only. A formal receipt will be sent upon payment.</p>
 </div>
 </div>
 `;

 try {
 await postmarkClient.sendEmail({
 From: "InvoiceFlow <contact@dovepeakdigital.com>",
 To: targetEmail,
 Subject: `Confirm Your InvoiceFlow ${planName} Billing`,
 HtmlBody: htmlBody,
 MessageStream: "outbound"
 });
 } catch (error) {
 console.error('Error sending invoice email:', error);
 }
}
