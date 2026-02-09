# Invoice Engine Refactoring Documentation

## Overview
Refactored the invoicing engine to ensure data integrity, atomic transactions, and proper integration with Business Profiles.

## Database Schema Changes
### New Columns
- `invoices.business_id` (FK to `business_profiles`)
- `clients.business_id` (FK to `business_profiles`)
- `invoices.currency` default changed to 'KES'

### RPC Functions
Added atomic operations to `supabase/migrations/20240210_invoice_schema_update.sql`:
1.  `create_invoice_full(p_invoice_data, p_items_data)`: Creates invoice and items in a single transaction.
2.  `update_invoice_full(p_invoice_id, p_invoice_data, p_items_data)`: Updates invoice and optionally replaces items in a single transaction.

## Backend Changes
### API Endpoints
- `POST /api/invoices`: Updated to accept `items` array and `business_id`. Uses `create_invoice_full`.
- `GET /api/invoices`: Added `business_id` filter support.

### Server Actions (`src/lib/actions/invoices.ts`)
- `createInvoiceAction`: Now accepts `items`. Uses `create_invoice_full`. Returning explicit `Invoice` object.
- `updateInvoiceAction`: Now accepts optional `items`. Uses `update_invoice_full`.

## Frontend Changes
### Create Invoice Flow
- **Business Profile Selection**: Added dropdown to select active business profile.
- **Atomic Submission**: Invoice and items are sent together.
- **Currency**: Defaults to `KES`.
- **Preview**: Removes hardcoded "From" address; displays selected Business Profile details.

## Migration Instructions
Run the SQL in `supabase/migrations/20240210_invoice_schema_update.sql` in your Supabase SQL Editor.

## Verification
1.  Run the migration.
2.  Go to Create Invoice.
3.  Select a Business Profile (ensure one exists).
4.  Create an Invoice with items.
5.  Check Database: Invoice and Items should exist and be linked.
