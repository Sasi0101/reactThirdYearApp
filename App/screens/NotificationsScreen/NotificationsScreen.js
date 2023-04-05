import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { auth, firestore } from "../../firebase";
import OneNotification from "./OneNotification";
import * as Notifications from "expo-notifications";
import { COLORS } from "../../constants/COLORS";

export default function NotificationsScreen(props) {
  const [notifications, setNotifications] = useState([]);
  const [updateFlatlist, setUpdateFlatlist] = useState(false);

  useLayoutEffect(() => {
    props.navigation.setOptions({ title: "Notifications" });
    const unsubscribe = firestore
      .collection("users")
      .doc(auth.currentUser?.email)
      .onSnapshot((doc) => {
        const data = doc.data();
        if (data.notifications) {
          setNotifications(data.notifications);
        }
        setUpdateFlatlist(!updateFlatlist);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {}, [notifications]);

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
