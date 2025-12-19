import { FilterFieldType } from './filterOperators';

export interface FilterField {
  key: string;
  label: string;
  type: FilterFieldType;
}

export type FilterModule =
  | 'contacts'
  | 'workforce'
  | 'assets'
  | 'inventory'
  | 'vehicle'
  | 'service_contract'
  | 'work_orders'
  | 'field_worker_trips'
  | 'trip_logs'
  | 'service_reports'
  | 'work_completion'
  | 'invoices'
  | 'quotes'
  | 'customer_feedback'
  | 'payments'
  |'accounts';   //  ADD THIS




export const FILTER_CONFIG: Record<FilterModule, FilterField[]> = {
  contacts: [
    { key: 'first_name', label: 'First Name', type: 'text' },
    { key: 'last_name', label: 'Last Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'type', label: 'Contact Type', type: 'text' },
    { key: 'last_service_date', label: 'Last Service Date', type: 'date' },
  ],

  workforce: [
    { key: 'full_name', label: 'Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'mobile', label: 'Phone', type: 'text' },
    { key: 'gender', label: 'Gender', type: 'text' },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'skills', label: 'Skills', type: 'text' },
    { key: 'availability', label: 'Availability', type: 'text' },
  ],
  assets: [
    { key: 'asset_name', label: 'Asset Name', type: 'text' },
    { key: 'asset_number', label: 'Asset Number', type: 'text' },
    { key: 'asset_type', label: 'Type', type: 'text' },
    { key: 'product', label: 'Product', type: 'text' },
    { key: 'company', label: 'Company', type: 'text' },
    { key: 'contact_name', label: 'Contact', type: 'text' },
  ],
  inventory: [
    { key: 'item_name', label: 'Item Name', type: 'text' },
    { key: 'item_number', label: 'Item Number', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },

    // ✅ Stock Quantity
    { key: 'stock_quantity', label: 'Stock Quantity', type: 'number' },
  ],
  vehicle: [
    { key: 'plate_number', label: 'Plate Number', type: 'text' },
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'type', label: 'Vehicle Type', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
  ],
  service_contract: [
    { key: 'contract_number', label: 'Contract Number', type: 'text' },
    { key: 'contract_name', label: 'Contract Name', type: 'text' },
    { key: 'account_name', label: 'Account', type: 'text' },
    { key: 'grand_total', label: 'Grand Total', type: 'number' },
    { key: 'start_date', label: 'Start Date', type: 'date' },
    { key: 'end_date', label: 'End Date', type: 'date' },
  ],
  work_orders: [
    { key: 'work_order_number', label: 'Work Order Number', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'service_type', label: 'Type', type: 'text' },
    { key: 'status_name', label: 'Status', type: 'text' },
    { key: 'priority_name', label: 'Priority', type: 'text' },
  ],
  field_worker_trips: [
    { key: 'user_name', label: 'User', type: 'text' },
    { key: 'work_order_name', label: 'Work Order', type: 'text' },
    { key: 'vehicle_name', label: 'Vehicle', type: 'text' },
    { key: 'started_at', label: 'Started At', type: 'date' },
    { key: 'ended_at', label: 'Ended At', type: 'date' },
  ],
  trip_logs: [
    { key: 'trip_id', label: 'Trip ID', type: 'text' },
    { key: 'timestamp', label: 'Date', type: 'date' },
    { key: 'work_order_number', label: 'Work Order', type: 'text' },
    { key: 'site_name', label: 'Site', type: 'text' },
    { key: 'job_status_id', label: 'Status', type: 'text' },
  ],

  service_reports: [

    { key: 'submitted_by', label: 'Submitted By', type: 'text' },
    { key: 'submitted_at', label: 'Submitted At', type: 'date' },
    { key: 'report_text', label: 'Report Text', type: 'text' },
    { key: 'report_file_url', label: 'Has File', type: 'text' }, // optional, can be "Yes"/"No"
  ],
  work_completion: [
    { key: 'work_order_id', label: 'Work Order ID', type: 'text' },
    { key: 'work_order_title', label: 'Work Order Title', type: 'text' },
    { key: 'verifier_first_name', label: 'Verified By', type: 'text' },
    { key: 'status', label: 'Work Completion Status', type: 'text' }, // ✅ This is what you need
    { key: 'verified_at', label: 'Verified At', type: 'date' },
  ],

  invoices: [
    { key: 'invoice_number', label: 'Invoice Number', type: 'text' },
    { key: 'customer_name', label: 'Customer', type: 'text' },
    { key: 'status_name', label: 'Status', type: 'text' },
    { key: 'currency', label: 'Currency', type: 'text' },
    { key: 'total', label: 'Total', type: 'number' },
    { key: 'updated_At', label: 'Updated At', type: 'date' },
  ],
  quotes: [
    { key: 'quote_number', label: 'Quote Number', type: 'text' },
    { key: 'customer_name', label: 'Customer', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'total_amount', label: 'Total Amount', type: 'number' },
    { key: 'valid_until', label: 'Valid Until', type: 'date' },
  ],
  customer_feedback: [
    { key: 'organization_name', label: 'Organization', type: 'text' },
    { key: 'work_order_number', label: 'Work Order', type: 'text' },
    { key: 'rating', label: 'Rating', type: 'number' },
    { key: 'created_by_name', label: 'Created By', type: 'text' },
    { key: 'submitted_at', label: 'Submitted At', type: 'date' },
    { key: 'updated_by_name', label: 'Updated By', type: 'text' },
  ],
payments: [
  { key: 'invoice_number', label: 'Invoice Number', type: 'text' },
  { key: 'customer_name', label: 'Customer', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },          // Paid / Pending
  { key: 'method', label: 'Payment Method', type: 'text' },  // Cash / Card / UPI
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'payment_date', label: 'Payment Date', type: 'date' },
  { key: 'reference', label: 'Reference', type: 'text' },
  { key: 'created_at', label: 'Created At', type: 'date' },
],

accounts: [
  { key: 'name', label: 'Account Name', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'type', label: 'Type', type: 'text' },
  { key: 'industry', label: 'Industry', type: 'text' },
  { key: 'credit_limit', label: 'Credit Limit', type: 'number' },
  { key: 'total_revenue', label: 'Total Revenue', type: 'number' },
  { key: 'customer_rating', label: 'Customer Rating', type: 'text' },
],

};
