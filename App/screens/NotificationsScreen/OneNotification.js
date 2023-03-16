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
  const [groupID, setGroupID] = useState();
  const [typeAddition, setTypeAddition] = useState(null);
  const [groupName, setGroupName] = useState("");

  const [allNotifications, setAllNotifications] = useState([]);

  useEffect(() => {
    if (props.data.note) setNote(props.data.note);
    if (props.allNotifications) setAllNotifications(props.allNotifications);

    switch (props.data.type) {
      case "groupAddition":
        setTypeAddition(
          <Text>
            <Text style={{ fontWeight: "bold" }}>{props.data.email}</Text>
            {" would like to join your "}
            <Text style={{ fontWeight: "bold" }}>{props.data.groupName}</Text>
            {" group."}
          </Text>
        );
    }
  }, [props]);

  useEffect(() => {
    setAllNotifications(props.allNotifications);
  }, [allNotifications]);

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
    let tempData = [];
    let doesDocumentExist;
    await firestore
      .collection("groups")
      .doc(props.data.groupID)
      .get()
      .then((data) => {
        if (data.exists) {
          doesDocumentExist = true;
          if (data.data().members) tempData = data.data().members;
        } else {
          doesDocumentExist = false;
        }
      })
      .catch((error) =>
        console.error(
          "Error when asking for group info in oneNotification: ",
          error
        )
      );

    const toUpload = tempData.filter((item) => item !== props.data.email);

    if (doesDocumentExist) {
      await firestore
        .collection("groups")
        .doc(props.data.groupID)
        .update({
          members: [...toUpload, props.data.email],
        })
        .catch((error) =>
          console.error(
            "Error when updating members in oneNotification: ",
            error
          )
        );
    } else {
      console.log("group no longer exists");
    }

    handleOnIgnore();
  };

  return (
    <View>
      <View style={styles.item}>
        <Text style={{ paddingTop: 5 }}>{typeAddition}</Text>
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
