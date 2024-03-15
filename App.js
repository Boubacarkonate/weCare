import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import Login from "./screens/auth/Login";
import Register from "./screens/auth/Register";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./screens/Home";
import Chat from "./screens/Chat";
import Profile from "./screens/profile/Profile";
import DeleteProfile from "./screens/profile/DeleteProfile";
import UpdateProfile from "./screens/profile/UpdateProfile";
import { Ionicons } from '@expo/vector-icons';
import ForgotPassword from "./screens/auth/ForgotPassword";
import AudioCall from "./screens/AudioCall";
import VideoCall from "./screens/VideoCall";
import TakeVideo_Photo_Gallery from "./screens/media/TakeVideo_Photo_Gallery";



const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen
          name="Home"
          component={Home}
          // options={{
          //   headerBackVisible: false,
          //   title: "Active users",
          //   headerTitleAlign: "center",
          //   headerTitleStyle: { fontWeight: 900 },
          //   headerRight: () => (
          //     <TouchableOpacity onPress={() => alert('This is a button!')} style={styles.headerRightBtn}>
          //       <Ionicons name="search" size={30} color="black" style={{ paddingRight:20 }} />
          //       <Ionicons name="ellipsis-vertical" size={30} color="black"/>
          //     </TouchableOpacity>
          //   ),
          // }}
        />
        <Stack.Screen
          name="Chat"
          component={Chat}
          options={({ route }) => ({
            headerBackVisible: false,
            headerTitle: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={{ uri: route.params.avatar }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 10,
                  }}
                />
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {route.params.name}
                </Text>
              </View>
            ),
            headerTitleAlign: "left",
            headerTitleStyle: { fontWeight: "bold" },
          })}
        />
        <Stack.Screen name="TakeVideo_Photo_Gallery" component={TakeVideo_Photo_Gallery} />
        <Stack.Screen name="AudioCall" component={AudioCall} />
        <Stack.Screen name="VideoCall" component={VideoCall} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
        <Stack.Screen name="DeleteProfile" component={DeleteProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  headerRightBtn: {
    flexDirection: 'row',
}
});
