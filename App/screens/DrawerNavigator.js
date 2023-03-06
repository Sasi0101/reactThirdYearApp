import { StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import FlashcardsScreen from "./FlashcardsScreen/FlashcardsScreen";
import ProfileScreen from "./ProfileScreen/ProfileScreen";
import MessagingScreen from "./GroupsScreen/MessagingScreen";
import { auth, firestore } from "../firebase";
import { DrawerContent } from "./DrawerContent";
import TodoScreen from "./TaskScreen/TodoScreen";
import LoginScreen from "./LoginRegister/LoginScreen";
import UsersScreen from "./MessagingScreens/UsersScreen";
import PrivateMessageGiftedChat from "./MessagingScreens/PrivateMessagesGiftedChat";
import StudyPageScreen from "./FlashcardsScreen/StudyPageScreen";
import CalendarScreen from "./CalendarScreen/CalendarScreen";
import GroupMessagesGiftedChat from "./GroupsScreen/GroupMessagesGiftedChat";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  let [previousData, setPreviousData] = useState({});

  //handle if there was a change in the users data
  useEffect(() => {
    let unsubscribe;
    const fetchData = async () => {
      const prevData = await AsyncStorage.getItem("previousData");

      if (prevData) {
        const parsedPrevData = JSON.parse(prevData);
        setPreviousData(parsedPrevData);

        unsubscribe = firestore
          .collection("users")
          .doc(auth.currentUser?.email)
          .onSnapshot((doc) => {
            const data = doc.data();
            if (data.username !== previousData.username) {
              setPreviousData(data);
              AsyncStorage.setItem("previousData", JSON.stringify(data));
            }
          });
      } else {
        unsubscribe = firestore
          .collection("users")
          .doc(auth.currentUser?.email)
          .onSnapshot((doc) => {
            const data = doc.data();
            if (data.username !== previousData.username) {
              setPreviousData(data);
              AsyncStorage.setItem("previousData", JSON.stringify(data));
            }
          });
      }
    };

    fetchData();

    return () => unsubscribe;
  }, []);

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <DrawerContent {...props} data={previousData} />
      )}
    >
      <Drawer.Screen name="MessagingScreen" component={MessagingScreen} />
      <Drawer.Screen name="TodoScreen" component={TodoScreen} />
      <Drawer.Screen name="FlashcardsScreen" component={FlashcardsScreen} />
      <Drawer.Screen name="ProfileScreen" component={ProfileScreen} />

      <Drawer.Screen name="CalendarScreen" component={CalendarScreen} />
      <Drawer.Screen name="Login" component={LoginScreen} />
      <Drawer.Screen name="UsersScreen" component={UsersScreen} />
      <Drawer.Screen
        name="PrivateMessageScreen"
        component={PrivateMessageGiftedChat}
      />
      <Drawer.Screen name="StudyPageScreen" component={StudyPageScreen} />
      <Drawer.Screen
        name="GroupMessageScreen"
        component={GroupMessagesGiftedChat}
      />
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
