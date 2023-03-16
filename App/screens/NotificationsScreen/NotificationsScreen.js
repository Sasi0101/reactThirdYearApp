import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { auth, firestore } from "../../firebase";
import OneNotification from "./OneNotification";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const [updateFlatlist, setUpdateFlatlist] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useLayoutEffect(() => {
    const unsubscribe = firestore
      .collection("users")
      .doc(auth.currentUser?.email)
      .onSnapshot((doc) => {
        const data = doc.data();
        if (data.notifications) {
          setNotifications(data.notifications);
          console.log("Should update");
        }
        setUpdateFlatlist(!updateFlatlist);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {}, [notifications]);

  useEffect(() => {
    Notifications.getDevicePushTokenAsync().then((token) => {
      console.log(token);
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) =>
        setNotification(notification)
      );

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View>
      <FlatList
        key={updateFlatlist ? "forceUpdate" : "forceUpdate"}
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
