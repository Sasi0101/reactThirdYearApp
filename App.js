import { StyleSheet, Platform, StatusBar } from "react-native";
import WelcomeScreen from "./App/screens/WelcomeScreen";
import LoginScreen from "./App/screens/LoginRegister/LoginScreen.js";
//import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

const Stack = createNativeStackNavigator();

export default function App() {
  //console.log("App executed");
  const handlePress = () => console.log("Text pressed");

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerShown: false }}
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
