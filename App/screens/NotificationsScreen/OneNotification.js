import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { auth, firestore } from "../../firebase";

export default function OneNotification(props) {
  const [type, setType] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const [allNotifications, setAllNotifications] = useState([]);

  useLayoutEffect(() => {
    setType(props.data.type);
    setEmail(props.data.email);
    setNote(props.data.note);
    setAllNotifications(props.allNotifications);
  }, []);

  useEffect(() => {}, [allNotifications]);

  const handleOnIgnore = async () => {
    const newNotifcations = allNotifications.filter(
      (item) => item.id !== props.data.id
    );

    await firestore
      .collection("users")
      .doc(auth.currentUser?.email)
      .update({
        notifications: newNotifcations,
      })
      .catch((error) =>
        console.warn("Error when igonring a notification: ", error)
      );
  };

  const handleAccept = async () => {
    //handleOnIgnore();
  };

  return (
    <View>
      <View style={styles.item}>
        <Text style={{ paddingTop: 5 }}>{type}</Text>
        <Text>Sender: {email}</Text>
        <Text>Note: {note}</Text>
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            justifyContent: "space-between",
            paddingHorizontal: 5,
            paddingVertical: 5,
          }}
        >
          <TouchableOpacity
            style={{ borderWidth: 1 }}
            onPress={() => handleOnIgnore()}
          >
            <Text style={{ paddingHorizontal: 2, paddingVertical: 2 }}>
              Ignore
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ borderWidth: 1 }}
            onPress={() => handleAccept()}
          >
            <Text style={{ paddingHorizontal: 2, paddingVertical: 2 }}>
              Accept
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    marginHorizontal: 10,
    marginVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    borderRadius: 10,
    elevation: 5,
  },
});
