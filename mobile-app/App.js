import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import SendMoneyScreen from './src/screens/SendMoneyScreen';
import VPAManagementScreen from './src/screens/VPAManagementScreen';
import UPIPinScreen from './src/screens/UPIPinScreen';
import TransactionHistoryScreen from './src/screens/TransactionHistoryScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Signup" 
              component={SignupScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SendMoney" 
              component={SendMoneyScreen}
              options={{ title: 'Send Money' }}
            />
            <Stack.Screen 
              name="VPAManagement" 
              component={VPAManagementScreen}
              options={{ title: 'My VPAs' }}
            />
            <Stack.Screen 
              name="UPIPin" 
              component={UPIPinScreen}
              options={{ title: 'UPI PIN' }}
            />
            <Stack.Screen 
              name="TransactionHistory" 
              component={TransactionHistoryScreen}
              options={{ title: 'Transaction History' }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{ title: 'Notifications' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
