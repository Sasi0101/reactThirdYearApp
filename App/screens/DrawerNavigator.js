import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import FlashcardsScreen from "./OtherScreens/FlashcardsScreen";
import ProfileScreen from "./OtherScreens/ProfileScreen";
import MessagingScreen from "./OtherScreens/MessagingScreen";
import { auth } from "../firebase";
import { DrawerContent } from "./DrawerContent";
import TodoScreen from "./OtherScreens/TodoScreen";
import CalendarScreen from "./OtherScreens/CalendarScreen";
import LoginScreen from "./LoginRegister/LoginScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />}>
      <Drawer.Screen name="MessagingScreen" component={MessagingScreen} />
      <Drawer.Screen name="FlashcardsScreen" component={FlashcardsScreen} />
      <Drawer.Screen name="ProfileScreen" component={ProfileScreen} />
      <Drawer.Screen name="TodoScreen" component={TodoScreen} />
      <Drawer.Screen name="CalendarScreen" component={CalendarScreen} />
      <Drawer.Screen name="Login" component={LoginScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    backgroundColor: "red",
  },
  messagingScreen: {
    backgroundColor: "orange",
    fontSize: 15,
  },
});
