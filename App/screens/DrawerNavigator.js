import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import FlashcardsScreen from "./OtherScreens/FlashcardsScreen";
import ProfileScreen from "./OtherScreens/ProfileScreen";
import SignOutScreen from "./OtherScreens/SignOutScreen";
import MessagingScreen from "./OtherScreens/MessagingScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      options={{ headerShown: false }}
      screenOptions={{
        drawerActiveBackgroundColor: "red",
      }}
    >
      <Drawer.Screen
        options={{ headerShown: true }}
        name="Messaging Screen"
        style={styles.messagingScreen}
        component={MessagingScreen}
      />
      <Drawer.Screen
        options={{ headerShown: false }}
        name="Flashcards"
        component={FlashcardsScreen}
      />
      <Drawer.Screen
        options={{ headerShown: false }}
        name="Profile"
        component={ProfileScreen}
      />
      <Drawer.Screen name="Sign out" component={SignOutScreen} />
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
