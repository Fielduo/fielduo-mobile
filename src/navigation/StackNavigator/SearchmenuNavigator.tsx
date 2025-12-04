// import React from 'react';
// import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
// import WorkForce from '../../components/fsm/view/WorkForce';
// import SearchMenu from '../../components/report-analysis/search-menu';
// import AssetCard from '../../components/fsm/view/AssetCard';
// import CreateAssetForm from '../../components/fsm/form/AssetForm';
// import Inventory from '../../components/fsm/view/Inventory';
// import WorkOrder from '../../components/fsm/view/WorkOrder';
// import CreateWorkOrderForm from '../../components/fsm/form/WorkOrder';
// import CreateInventoryForm from '../../components/fsm/form/InventoryForm';
// import CreateWorkSpaceForm from '../../components/fsm/form/WorkForceForm';
// import ScheduleScreen from '../../components/fsm/view/Schedule';
// import ScheduleWorkOrdersScreen from '../../components/fsm/view/ScheduleWorkOrder';
// import CreateScheduleScreen from '../../components/fsm/form/ScheduleForm';
// import FieldWorkerTrip from '../../components/fsm/view/FieldWorkerTrip';
// import DashboardScreen from '../../components/report-analysis/DashboardScreen';
// import ServiceContract from '../../components/fsm/view/ServiceContract';
// import ServiceContractForm from '../../components/fsm/form/ServiceContract';
// import Vehicles from '../../components/fsm/view/Vehicle';
// import VehicleForm from '../../components/fsm/form/VehicleForm';
// import WorkCompletion from '../../components/fsm/view/WorkCompletion';
// import WorkCompletionForm from '../../components/fsm/form/WorkCompletionForm';
// import ServiceReport from '../../components/fsm/view/ServiceReport';
// import ServiceReportForm from '../../components/fsm/form/ServiceReportForm';
// import TripLogForm from '../../components/fsm/form/TripLogForm';
// import TripLog from '../../components/fsm/view/Triplog';

// import QuotesScreen from '../../components/Billing/view/Quotes';
// import Invoices from '../../components/Billing/view/Invoices';
// import CustomerFeedback from '../../components/Billing/view/CustomerFeedback';
// import Payments from '../../components/Billing/view/Payments';

// import CreateFieldWorkerTrip from '../../components/fsm/form/FieldWorkerTripForm';
// import CreateServiceContractScreen from '../../components/fsm/form/ServiceContract';
// import MapRouteScreen from '../../screens/Map/MapRouteScreen';
// import Quotes from '../../components/Billing/view/Quotes';
// import QuotesForm from '../../components/Billing/form/QuotesForm';
// import InvoicesForm from '../../components/Billing/form/InvoicesForm';
// import Contact from '../../components/CRM/View/Contact';
// import ContactForm from '../../components/CRM/Form/ContactForm';
// import AccountsScreen from '../../components/CRM/View/Account';





// // ✅ Define type for all routes in this navigator
// export type SearchMenuStackParamList = {
//   SearchMenu: undefined;
//   DashboardScreen: undefined;

//   //CRM
//   Account:undefined;
//   Contact: undefined;
//   ContactForm: {
//     mode: "create" | "view" | "edit";
//     data?: any;
//   };
//   // FSM
//   WorkForce: undefined;
//   WorkForceForm: { mode: 'create' | 'view' | 'edit'; worker?: FieldWorker };
//   Assets: undefined;
//   CreateAsset: { mode: 'create' | 'edit' | 'view'; asset?: Asset };
//   Inventory: undefined;
//   Workorder: undefined;
//   CreateWorkorder: { mode: 'create' | 'edit' | 'view'; workorder?: WorkOrder };
//   CreateInventory: { mode: 'create' | 'edit' | 'view'; inventory?: Inventory };
//   Schedule: {
//     employeeId: string;
//     statusFilter?: string;
//   };
//   WorkOrders: undefined;
//   CreateSchedule: { mode: "create" | "edit"; event?: JobSchedule };
//   FieldWorkerTrip: undefined;
//   CreateFieldWorkerTrip: { mode: 'create' | 'edit' | 'view'; trip?: FieldWorkerTrip };
//   Vehicles: undefined;
//   ServiceContract: undefined;
//   CreateServiceContract: { mode: "create" | "edit" | "view"; servicecontract?: any; };
//   VehicleForm: { mode: 'create' | 'edit' | 'view'; vehicle?: any };
//   WorkCompletion: undefined;
//   WorkCompletionForm: { mode: 'create' | 'edit' | 'view'; workCompletion?: any; };
//   ServiceReport: undefined;
//   ServiceReportForm: { mode: 'create' | 'edit' | 'view'; report?: any };
//   TripLog: undefined;
//   TripLogForm: { mode: 'create' | 'view' | 'edit'; data?: any };

//   // Billing
//   Invoices: undefined;
//   InvoicesForm: { mode: 'create' | 'view' | 'edit'; data?: any };
//   CustomerFeedback: { mode: 'create' | 'view' | 'edit'; data?: any };
//   Payments: { mode: 'create' | 'view' | 'edit'; data?: any };
//   MapRouteScreen: { jobs: JobSchedule[]; assignedUserId: string; selectedDate: string; };

//   Quotes: undefined;
//   QuotesForm: {
//     mode: "create" | "view" | "edit";
//     quote?: any;
//   };

// };

// // ✅ Create a typed stack navigator
// const Stack = createNativeStackNavigator<SearchMenuStackParamList>();

// export default function SearchmenuNavigator() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="SearchMenu" component={SearchMenu} />
//       <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
// {/* CRM */}
//       <Stack.Screen name="Contact" component={Contact} />
//  <Stack.Screen name="ContactForm" component={ContactForm} />
// <Stack.Screen name="Account" component={AccountsScreen} />
//       {/* FSM */}
//       <Stack.Screen name="WorkForce" component={WorkForce} />
//       <Stack.Screen name="ServiceContract" component={ServiceContract} />
//       <Stack.Screen name="CreateServiceContract" component={CreateServiceContractScreen} />
//       <Stack.Screen name="WorkForceForm" component={CreateWorkSpaceForm} />
//       <Stack.Screen name="Assets" component={AssetCard} />
//       <Stack.Screen name="CreateAsset" component={CreateAssetForm} />
//       <Stack.Screen name="Inventory" component={Inventory} />
//       <Stack.Screen name="CreateInventory" component={CreateInventoryForm} />
//       <Stack.Screen name="Workorder" component={WorkOrder} />
//       <Stack.Screen name="CreateWorkorder" component={CreateWorkOrderForm} />
//       <Stack.Screen name="Schedule" component={ScheduleScreen} />
//       <Stack.Screen name="MapRouteScreen" component={MapRouteScreen} />
//       <Stack.Screen name="WorkOrders" component={ScheduleWorkOrdersScreen} />
//       <Stack.Screen name="CreateSchedule" component={CreateScheduleScreen} />
//       <Stack.Screen name="FieldWorkerTrip" component={FieldWorkerTrip} />
//       <Stack.Screen name="CreateFieldWorkerTrip" component={CreateFieldWorkerTrip} />
//       <Stack.Screen name="Vehicles" component={Vehicles} />
//       <Stack.Screen name="VehicleForm" component={VehicleForm} />
//       <Stack.Screen name="WorkCompletion" component={WorkCompletion} />
//       <Stack.Screen name="WorkCompletionForm" component={WorkCompletionForm} />
//       <Stack.Screen name="ServiceReport" component={ServiceReport} />
//       <Stack.Screen name="ServiceReportForm" component={ServiceReportForm} />
//       <Stack.Screen name="TripLog" component={TripLog} />
//       <Stack.Screen name="TripLogForm" component={TripLogForm} />

//       {/* billing */}

//       <Stack.Screen name="Invoices" component={Invoices} />
//       <Stack.Screen
//         name="InvoicesForm"
//         component={InvoicesForm}
//       />

//       <Stack.Screen name="CustomerFeedback" component={CustomerFeedback} />
//       <Stack.Screen name="Payments" component={Payments} />
//       <Stack.Screen name="Quotes" component={Quotes} />
//       <Stack.Screen name="QuotesForm" component={QuotesForm} />




//     </Stack.Navigator>
//   );
// }
