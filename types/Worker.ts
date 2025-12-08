
export interface WorkerAddress {
  street: string;
  city: string;
  state: string;
  country: string;
}
export type FieldWorker = {

  full_name: string;
  dob?: string;
  gender?: string;
  mobile?: string;
  alt_mobile?: string;
  email?: string;
  emergency_name?: string;
  emergency_phone?: string;
  current_address?: string;
  city?: string;   // <-- add this
  state?: string;  // <-- add this
  country?: string; // <-- add this
  permanent_address?: WorkerAddress;
  gov_id?: string;
  skills: string[];
certificate: string[];
 experience_years:number;
  availability?: string;
  work_location?: string;
  gps?: string;
  medical?: string;
  working_hours_start?: string;
  working_hours_end?: string;
  timezone?: string;
   
}


 export type FieldWorkerTrip = {
  id: string;
  user_id: string;
  user_name: string;
  work_order_id: string;
  work_order_name: string;
  vehicle_id: string;
  vehicle_name: string;
  started_at?: string | null;
  ended_at?: string | null;
}

// 🔹 Define the expected shape of a vehicle payload
export type VehiclePayload = {
  plate_number: string;
  model: string;
  type: string;
  gps_device_id?: string;
  status?: string;
}

export type Vehicle = {
  id: string;
  plate_number: string;
  gps_device_id?: string;
  model: string;
  type: string;
  status: "Active" | "Inactive";
};

export type Asset = {
  id: string;
  asset_name: string;
  asset_number: string;
  description?: string;
  parent_asset?: string;
  asset_type: string;
  status?: string;
  company: string;
  contact_name?: string;
  contact?: { id: string; name: string } | null;
  product: string;
  address?: string;
  giai?: string;
  ordered_date?: string;
  installation_date?: string;
  purchased_date?: string;
  warranty_expiration?: string;
   created_by_name?: string;
  updated_by_name?: string;
  created_at?: string;
  updated_at?: string;
};

 export type WorkOrder = {
  id: string;
  title?: string;
  type?: string;
  service_type?: string;
  status?: string;
  priority?: string;
  schedule?: string;
  description?: string;
  long_description?: string;
  assigned_to?: string;
  supervisor_id?: string;
  customer_id?: string;
  asset_id?: string;
  customer_contact_id?: string;
  estimated_duration?: string;
  actual_start_date?: string;
  completion_date?: string;
  labor_hours?: string;
  notes?: string;
  attachments?: string;
  scheduled_at?: string;
  organization_id?: string;
  work_order_number?: string;
  

  /** These must be included */
  status_id?: string;
  priority_id?: string;
  type_id?: string;

  status_name?: string;
  priority_name?: string;
  type_name?: string;   
  supervisor_name?: string;
  assigned_to_name?: string;
  customer_name?: string;
  asset_name?: string;
  customer_contact_name?: string;
  contact_name?: string;
   created_by_name?: string;
  updated_by_name?: string;
  created_at?: string;
  updated_at?: string;
  required_technicians?: number;
vehicle_requirements?: string; // or number if ID
vehicle_name?: string; // optional for display

};

export type Inventory = {
  item_id: number;
  org_id: string;
  item_number: string;
  item_name: string;
  item_description: string;
  category: string;
  subcategory: string;
  unit_of_measure: string;
  cost: number;
  price: number;
  supplier_id: number;
  stock_quantity: number;
  minimum_stock: number;
  maximum_stock: number;
  reorder_point: number;
  warehouse_location: string;
  bin_location: string;
  serial_tracked: boolean;
  lot_tracked: boolean;
  expiry_date: string;
  weight: number;
  dimensions: string;
  barcode: string;
  image_url: string;
  status: string;
  created_date: string;
  created_by: string;
  updated_date: string;
  updated_by: string;
  last_purchase_date: string;
  last_sale_date: string;
}
export type ServiceContract = {
  id: string;
  contractNumber: string;
  contractName: string;
  account: string;
  grandTotal: string;
  startDate: string;
  endDate: string;
  description: string;
};


export type SchedulePayload = {
  workOrder: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  assignedTo: string;
  tripId: string;
  status: string;
  dispatchMode: string;
  notes?: string;
}

 export type ServiceContractPayload = {
   id: string;
   contract_owner: string
  contract_number: string
  contract_name: string
  description?: string
  account_name: string
  contact_name: string
  start_date: string | null
  actual_start_date: string | null
  term_months: number
  special_terms?: string
  discount?: number
  tax?: number
  shipping_handling?: number
  grand_total?: number

  // billing
  billing_street: string
  billing_city: string
  billing_state: string
  billing_zip: string
  billing_country: string

  // shipping
  shipping_street: string
  shipping_city: string
  shipping_state: string
  shipping_zip: string
  shipping_country: string
};

 export type JobItem = {
  latitude: string;
  longitude: string;
  schedule_status: "Scheduled" | "Rescheduled" | "Completed" | "Missed" | string;
  route_order?: number;
};

 export type UserLocation = {
  latitude: number;
  longitude: number;
};

 export type RouteMapProps = {
  jobs: JobItem[];
  userLocation: UserLocation;
  onOptimizeRoute: () => void;
};

 export type JobSchedule = {
  id: string | null;
  assigned_to: string |{ id: string; name: string };

  assigned_to_id?: string;
  assigned_to_name?: string | null;
  work_order_title?: string;
  work_order_id?: string;
  schedule_status?: string;
  start_datetime?: string | null;
  end_datetime?: string | null;
  duration_minutes?: number;
  latitude?: number | string | null;
  longitude?: number | string | null;
  route_order?: number;
  is_optimized_route?: boolean;
  notes?: string;
  dispatch_mode?: string;

  trip_id?: string | null;
  trip_name?: string | null;

  date?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  color?: string;

  [key: string]: any;
};

 export type Job = {
  id: string;
  work_order_title: string;
  schedule_status: string;
  latitude: number;
  longitude: number;
  route_order?: number;
  assigned_to_name:string
};

 export type LineItem = {
  id: string;
  type: "service" | "product";
  name: string;
  description: string;
  qty: number;
  price: string;      // keep as string for input fields
  tax: number;
  discount: string;   // keep as string for input fields
};
