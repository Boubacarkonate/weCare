import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './screens/auth/Login';
import Register from './screens/auth/Register';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from './screens/Home';
import Chat from './screens/Chat';
import Profile from './screens/profile/Profile';
import DeleteProfile from './screens/profile/DeleteProfile';
import UpdateProfile from './screens/profile/UpdateProfile';

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
          <Stack.Screen
          name='Login'
          component={ Login }
          />
          <Stack.Screen
          name='Register'
          component={ Register }
          />
          <Stack.Screen
          name='Home'
          component={ Home }
          options={{headerBackVisible: false, title: 'Active users', headerTitleAlign: 'center', headerTitleStyle: { fontWeight: 900 }}}
          />
           <Stack.Screen
          name='Chat'
          component={ Chat }
          options={({ route }) => ({
            headerBackVisible: false,
            title: route.params.name,
            headerTitleStyle: {fontWeight: 'bold'},
            headerTitleAlign:'center',
          })}   
          
          />
             <Stack.Screen
          name='Profile'
          component={Profile }
          />
             <Stack.Screen
          name='UpdateProfile'
          component={UpdateProfile }
          />
             <Stack.Screen
          name='DeleteProfile'
          component={DeleteProfile }
          />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
