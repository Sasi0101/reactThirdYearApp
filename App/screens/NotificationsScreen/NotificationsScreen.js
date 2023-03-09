import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { auth, firestore } from "../../firebase";
import OneNotification from "./OneNotification";
import notifee from "@notifee/react-native";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);

  useLayoutEffect(() => {
    const unsubscribe = firestore
      .collection("users")
      .doc(auth.currentUser?.email)
      .onSnapshot((doc) => {
        const data = doc.data();
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {}, [notifications]);

  return (
    <View>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <OneNotification data={item} allNotifications={notifications} />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
