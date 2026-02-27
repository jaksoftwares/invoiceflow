SUBSCRIPTION & USAGE MODULE DOCUMENTATION

For Your Invoicing Management Application

1️⃣ OVERALL ARCHITECTURE OVERVIEW

Your monetization system consists of:

Tiered Subscriptions

Free

Starter

Business

Lifetime

Pay-As-You-Go (PAYG) for:

Freelancers

Users without subscription

Users who exhaust plan limits

Usage Tracking Engine

Payment Tracking

Server-Side Enforcement Layer

Event & Audit Logging

M-Pesa Payment Integration

2 CORE PARAMETERS TO TRACK (CRITICAL)

These are the parameters that determine access, billing, and enforcement.

A) Subscription-Level Parameters

Track per subscription:

Parameter	Description
plan_id	FK to plans table
user_id	Account owner
status	active / expired / cancelled / suspended
billing_cycle	monthly / yearly / lifetime
start_date	Subscription start
end_date	Expiry date
auto_renew	true/false
renewal_attempts	Retry attempts
grace_period_end	For failed payments
mpesa_reference	Payment reference
payment_status	paid / pending / failed
B) Usage Parameters (Per Billing Cycle)

These are the resources that determine plan access:

invoices_created

invoices_sent_email

pdf_downloads

templates_used

clients_created

products_created

report_exports

branding_customizations

priority_email_used

These must reset per billing cycle (except lifetime).

C) Plan Limit Parameters

Each plan defines:

max_invoices_per_month

max_clients

max_products

max_templates_access

max_email_sends

watermark_enabled (boolean)

allow_csv_export

allow_branding

allow_priority_email

allow_payg_after_limit (boolean)

D) Pay-As-You-Go Parameters

Track per action:

cost_per_premium_template

cost_per_email_send

cost_per_pdf_download

cost_per_extra_invoice

cost_per_report_export

E) Abuse & Security Parameters

ip_address

device_fingerprint

request_frequency

failed_attempts

excessive_pdf_generation_count

automation_detection_flag

3️⃣ DATABASE SCHEMA DESIGN

This is structured properly for production-grade SaaS.

🔹 1. plans
id (uuid)
name (free, starter, business, lifetime)
description
price_monthly
price_yearly
price_lifetime
max_invoices
max_clients
max_products
max_templates
max_email_sends
watermark_enabled
allow_csv_export
allow_branding
allow_priority_email
allow_payg_after_limit
created_at
updated_at
🔹 2. subscriptions
id (uuid)
user_id (fk users)
plan_id (fk plans)
status (active, expired, cancelled, suspended)
billing_cycle (monthly, yearly, lifetime)
start_date
end_date
auto_renew
grace_period_end
created_at
updated_at
🔹 3. subscription_payments

Tracks subscription payments only.

id (uuid)
subscription_id
user_id
amount
currency
mpesa_receipt_number
phone_number
status (pending, completed, failed)
payment_type (subscription, upgrade, renewal)
paid_at
created_at
🔹 4. usage_tracking

This resets monthly.

id (uuid)
user_id
subscription_id
billing_period_start
billing_period_end

invoices_created
emails_sent
pdf_downloads
templates_used
clients_created
products_created
report_exports

created_at
updated_at
🔹 5. payg_transactions

For pay-as-you-go purchases.

id (uuid)
user_id
action_type (premium_template, email_send, pdf_download, extra_invoice)
related_invoice_id (nullable)
amount
mpesa_receipt_number
status (pending, completed, failed)
created_at
🔹 6. activity_logs (Event Logging)

Track every action.

id (uuid)
user_id
action_type
resource_id
ip_address
device_info
metadata (jsonb)
created_at

Action types:

invoice_created

invoice_sent

pdf_generated

template_selected

plan_upgraded

payment_completed

🔹 7. audit_logs (Security Monitoring)
id (uuid)
user_id
event
risk_level
description
ip_address
created_at

Used for:

Abuse detection

Repeated PDF generation

Automation attempts

4️⃣ SUBSCRIPTION STATE MACHINE

States:

active
expired
cancelled
grace_period
suspended

Transitions:

Payment success → active

Payment failure → grace_period

Grace expired → suspended

Manual cancel → cancelled

Upgrade → new active plan

5️⃣ USAGE ENFORCEMENT FLOW (VERY IMPORTANT)

Every protected action must go through middleware.

Example: Creating Invoice

1. Fetch active subscription
2. If none:
      → PAYG 
3. Check usage_tracking.invoices_created
4. Compare against plan.max_invoices
5. If exceeded:
      → Offer upgrade
      → Offer PAYG
6. If allowed:
      → Increment usage_tracking
      → Log activity
      → Proceed

ALL CHECKS MUST BE SERVER-SIDE.

6️⃣ PAY-AS-YOU-GO FLOW

When limit reached:

User clicks “Download Premium Template”

1. Check subscription
2. If not allowed:
      → Show modal:
            - Upgrade Plan
            - Pay KES 10
3. If Pay selected:
      → Initiate M-Pesa STK push
4. On callback:
      → Record payg_transaction
      → Allow action
      → Log event
7️⃣ BILLING CYCLE RESET LOGIC

Cron Job Monthly:

For each active subscription:
    If current_date > billing_period_end:
        → Reset usage_tracking counters
        → Update billing_period_start
        → Update billing_period_end

For Lifetime:

No reset expiry

But usage resets monthly

8️⃣ M-PESA INTEGRATION ARCHITECTURE

Use:

STK Push

Callback URL

Validation endpoint

Store:

checkout_request_id

mpesa_receipt_number

transaction_status

Never grant access before confirmed callback.

9️⃣ PREVENTING ABUSE & ENSURING INTEGRITY
1. Rate Limiting

Limit:

PDF generation frequency

Email sending frequency

2. Soft Limits Monitoring

If:

50 PDFs in 2 minutes
→ Flag in audit_logs

3. Idempotency Keys

Prevent duplicate payment processing.


🔟 UPGRADE LOGIC

When upgrading:

Close old subscription

Calculate pro-rated credit

Create new subscription

Reset usage limits

Log event

 LIFETIME PLAN RULES

No expiry

Still monthly usage reset

Cannot downgrade to free

No auto renew

1️⃣2️⃣ BUSINESS vs FREELANCER SUPPORT
User Type	Monetization
SME Business	Subscription (Starter/Business), PAYG or Free, Lifetime
Enterprise	Custom

System auto-detects behavior based on usage volume.

1️⃣3️⃣ UI PROMPTING STRATEGY

When limit reached:

Show modal:

“You’ve reached your monthly invoice limit---.
Upgrade to Business for unlimited invoices
OR
Pay KES 10 to download this invoice.”

Conversion optimization matters.

 PERFORMANCE CONSIDERATIONS

Use indexed counters

Cache plan limits

Precompute usage checks

Use DB transactions for increment




The subscription model is very important for this application and it is the key determinant of the items the user is able to access and use.


1) Tiered Subscription (Most Standard )

This is the SaaS model used by:

a) Free plan

5 invoices/month

3 clients max

5 products/services -  that can be added.

Watermarked PDF

Only 3 templates

No email sending (or limited 3/month)

b) Starter – KES 499/month

50 invoices/month

20  clients

10 templates

Email sending included

No watermark

Basic reports

c) Business – KES 999/month

Unlimited invoices
Unlimited clients
Unlimited templates

Advanced reports

Branding customization

Priority email sending

Export reports (CSV/Excel)

d) Lifetime – KES 4999 (One-time)

Unlimited invoices
Unlimited clients
Unlimited templates

Advanced reports

Branding customization

Priority email sending

Export reports (CSV/Excel)  etc 



Some freelancers hate subscriptions

2️⃣ Pay-As-You-Go (Usage-Based)

Very powerful


KES 10 per premium template download ( when they have no subsctiption they can pay as they go, here also there should me a proper flawless modal for this in that they pay , but will also have an option to chose to chose a subscription plan - if they pay for this they can also be allowed to send the invoice via email) 

Freelancers who invoice occasionally, Small traders etc. or after someone has exhausted their plan, so that we have a way to be able to let the users know that they have exhausted their plan and they can upgrade to a higher plan or pay as they go.



There should bee a usage tracking  architecture - 
 Subscriptions
 Usage Tracking
 Pay-As-You-Go
 reseting of usage - when the period ends
 plan limits - when the user has exhausted their plan, they should be able to upgrade to a higher plan or pay as they go. or be prompted
 payments connnection/linked  to their activity and what they pay for.

 Payment integration is mpesa integration,  that we will have to implement.



 Now in the dashboard we should have a dedicated module for the subscriptions well presented complete and organized for the user.  This module should have the following:

- Current plan
- Current usage
- Upgrade options
- Payment history
- Usage history
- Pay-as-you-go options
- Settings  etc .

