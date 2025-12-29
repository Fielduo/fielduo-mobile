import DashboardScreen from "@/components/report-analysis/DashboardScreen";
import SearchMenu from "@/components/report-analysis/search-menu";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import AccountForm from "@/components/fsm/form/AccountForm";
import AssetsForm from "@/components/fsm/form/AssetsForm";
import CreateFieldWorkerTrip from "@/components/fsm/form/FieldWorkerTripForm";
import TripLogForm from "@/components/fsm/form/TripLogForm";
import AssetCard from "@/components/fsm/view/AssetCard";
import FieldTrip from "@/components/fsm/view/FieldTrip";
import Triplog from "@/components/fsm/view/Triplog";
import MapRouteScreen from "@/src/screens/Map/MapRouteScreen";
import {
  Asset,
  FieldWorker,
  FieldWorkerTrip,
  JobSchedule,
} from "@/types/Worker";

import InvoicesForm from "@/components/Billing/Form/InvoiceForm";
import QuotesForm from "@/components/Billing/Form/QuotesForm";
import CustomerFeedback from "@/components/Billing/View/CustomerFeedback";
import CustomerFeedbackForm from "@/components/Billing/Form/CustomerFeedbackForm";
import Invoices from "@/components/Billing/View/Invoices";
import Payments from "@/components/Billing/View/Payments";
import Quotes from "@/components/Billing/View/Quotes";
import ContactForm from "@/components/CRM/Form/ContactForm";
import AccountsScreen from "@/components/CRM/View/Account";
import Contact from "@/components/CRM/View/Contact";
import InventoryForm from "@/components/fsm/form/InventoryForm";
import CreateScheduleScreen from "@/components/fsm/form/ScheduleForm";
import ServiceContractScreen from "@/components/fsm/form/ServiceContractScreen";
import ServiceReportForm from "@/components/fsm/form/ServiceReportForm";
import VehicleForm from "@/components/fsm/form/VehicleForm";
import WorkCompletionForm from "@/components/fsm/form/WorkCompletionForm";
import CreateWorkSpaceForm from "@/components/fsm/form/WorkForceForm";
import CreateWorkOrderForm from "@/components/fsm/form/WorkOrderForm";
import InventoryView from "@/components/fsm/view/InventoryView";
import ScheduleScreen from "@/components/fsm/view/Schedule";
import ScheduleWorkOrder from "@/components/fsm/view/ScheduleWorkOrder";
import ServiceContract from "@/components/fsm/view/ServiceContract";
import ServiceReport from "@/components/fsm/view/ServiceReport";
import Vehicles from "@/components/fsm/view/Vehicle";
import WorkCompletion from "@/components/fsm/view/WorkCompletion";
import WorkForce from "@/components/fsm/view/WorkForce";
import WorkOrder from "@/components/fsm/view/WorkOrder";
import { Inventory } from "@/types/Worker";

// ✅ Define type for all routes in this navigator
export type SearchMenuStackParamList = {
  SearchMenu: undefined;
  DashboardScreen: undefined;
  SearchScreen: undefined; // ✅ add
  //   //CRM
  Account: undefined;
  Contact: undefined;
  ContactForm: {
    mode: "create" | "view" | "edit";
    data?: any;
  };
  //   // FSM
  WorkForce: undefined;
  WorkForceForm: { mode: "create" | "view" | "edit"; worker?: FieldWorker };
  Accounts: undefined;
  CreateAccount: { mode: "create" | "edit" | "view"; account?: any };
  Assets: undefined;
  CreateAsset: { mode: "create" | "edit" | "view"; asset?: Asset };
  Inventory: undefined;
  Workorder: undefined;
  CreateWorkorder: { mode: "create" | "edit" | "view"; workorder?: any };
  CreateInventory: { mode: "create" | "edit" | "view"; inventory?: Inventory };
  Schedule: {
    employeeId: string;
    statusFilter?: string;
  };
  WorkOrders: undefined;
  CreateSchedule: { mode: "create" | "edit"; event?: JobSchedule };
  FieldWorkerTrip: undefined;
  CreateFieldWorkerTrip: {
    mode: "create" | "edit" | "view";
    trip?: FieldWorkerTrip;
  };
  Vehicles: undefined;
  ServiceContract: undefined;
  CreateServiceContract: {
    mode: "create" | "edit" | "view";
    servicecontract?: any;
  };
  VehicleForm: { mode: "create" | "edit" | "view"; vehicle?: any };
  WorkCompletion: undefined;
  WorkCompletionForm: {
    mode: "create" | "edit" | "view";
    workCompletion?: any;
  };
  ServiceReport: undefined;
  ServiceReportForm: { mode: "create" | "edit" | "view"; report?: any };
  TripLog: undefined;
  TripLogForm: { mode: "create" | "view" | "edit"; data?: any };

  //   // Billing
  Invoices: undefined;
  InvoicesForm: { mode: "create" | "view" | "edit"; data?: any };

  CustomerFeedback: undefined;
  CreateCustomerFeedback: { mode: "create" | "view" | "edit"; feedback?: any };
  
  Payments: { mode: "create" | "view" | "edit"; data?: any };
  MapRouteScreen: {
    jobs: JobSchedule[];
    assignedUserId: string;
    selectedDate: string;
  };

  Quotes: undefined;
  QuotesForm: {
    mode: "create" | "view" | "edit";
    quote?: any;
  };
};

// ✅ Create a typed stack navigator
const Stack = createNativeStackNavigator<SearchMenuStackParamList>();

export default function SearchmenuNavigator() {
  return (
    <Stack.Navigator
      id="SearchMenuStack"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SearchMenu" component={SearchMenu} />
      <Stack.Screen name="DashboardScreen" component={DashboardScreen} />

      <Stack.Screen name="Workorder" component={WorkOrder} />
      <Stack.Screen name="CreateWorkorder" component={CreateWorkOrderForm} />
      <Stack.Screen name="Assets" component={AssetCard} />
      <Stack.Screen name="CreateAsset" component={AssetsForm} />
      <Stack.Screen name="TripLog" component={Triplog} />
      <Stack.Screen name="TripLogForm" component={TripLogForm} />

      <Stack.Screen name="FieldWorkerTrip" component={FieldTrip} />
      <Stack.Screen
        name="CreateFieldWorkerTrip"
        component={CreateFieldWorkerTrip}
      />
      <Stack.Screen name="Inventory" component={InventoryView} />

      <Stack.Screen name="CreateInventory" component={InventoryForm} />
      <Stack.Screen name="ServiceContract" component={ServiceContract} />

      <Stack.Screen
        name="CreateServiceContract"
        component={ServiceContractScreen}
      />
      <Stack.Screen name="ServiceReport" component={ServiceReport} />
      <Stack.Screen name="ServiceReportForm" component={ServiceReportForm} />
      <Stack.Screen name="Vehicles" component={Vehicles} />
      <Stack.Screen name="VehicleForm" component={VehicleForm} />
      <Stack.Screen name="WorkCompletion" component={WorkCompletion} />
      <Stack.Screen name="WorkCompletionForm" component={WorkCompletionForm} />
      <Stack.Screen name="WorkForce" component={WorkForce} />
      <Stack.Screen name="WorkForceForm" component={CreateWorkSpaceForm} />

      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="WorkOrders" component={ScheduleWorkOrder} />
      <Stack.Screen name="CreateSchedule" component={CreateScheduleScreen} />
      <Stack.Screen name="Contact" component={Contact} />
      <Stack.Screen name="ContactForm" component={ContactForm} />
      <Stack.Screen name="Account" component={AccountsScreen} />
      <Stack.Screen name="CreateAccount" component={AccountForm} />

      <Stack.Screen name="MapRouteScreen" component={MapRouteScreen} />

      {/* billing */}

      <Stack.Screen name="Invoices" component={Invoices} />
      <Stack.Screen name="InvoicesForm" component={InvoicesForm} />

      <Stack.Screen name="CustomerFeedback" component={CustomerFeedback} />
      <Stack.Screen name="CreateCustomerFeedback" component={CustomerFeedbackForm} />
      <Stack.Screen name="Payments" component={Payments} />
      <Stack.Screen name="Quotes" component={Quotes} />
      <Stack.Screen name="QuotesForm" component={QuotesForm} />
    </Stack.Navigator>
  );
}
