import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '@/components/report-analysis/DashboardScreen';
import FieldWorkerTripForm from '@/components/fsm/form/FieldWorkerTripForm';

import Schedule from '@/components/fsm/view/Schedule';
import ServiceReportForm from '@/components/fsm/form/ServiceReportForm';
import TripLogForm from '@/components/fsm/form/TripLogForm';

const Stack = createNativeStackNavigator();

const DashboardStackNavigator = () => {
  return (
    <Stack.Navigator
      id="DashboardStack"
      screenOptions={{ headerShown: false }}
      initialRouteName="DashboardScreen"   // 🔥 IMPORTANT
    >
      <Stack.Screen
        name="DashboardScreen"
        component={DashboardScreen}
      />

      <Stack.Screen
        name="FieldWorkerTripForm"
        component={FieldWorkerTripForm}
      />

      <Stack.Screen
        name="TripLogForm"
        component={TripLogForm}
      />

      <Stack.Screen
        name="Schedule"
        component={Schedule}
      />

      <Stack.Screen
        name="ServiceReportForm"
        component={ServiceReportForm}
      />
      
    </Stack.Navigator>
  );
};

export default DashboardStackNavigator;
