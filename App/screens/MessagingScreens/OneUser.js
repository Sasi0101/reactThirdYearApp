import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
  DeviceEventEmitter,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { auth, firestore } from "../../firebase";
import { Avatar } from "react-native-paper";
import "firebase/storage";
import { COLORS } from "../../constants/COLORS";
import firebase from "firebase/app";

export default function OneUser(props) {
  const navigation = useNavigation();
  const [lastMessage, setLastMessage] = useState("");
  const [doesUserHaveAvatar, setDoesUserHaveAvatar] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  useLayoutEffect(() => {
    let temp_id =
      auth.currentUser?.email.localeCompare(props.email) > 0
        ? auth.currentUser?.email + props.email
        : props.email + auth.currentUser?.email;

    const unsubscribe = firestore
      .collection("privateMessages")
      .doc(temp_id)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .limit(1)
      .onSnapshot((snapshot) => {
        if (snapshot.empty) {
          const tempMessage = {
            user: { _id: auth.currentUser?.email },
            text: "No previous message",
          };
          setLastMessage(tempMessage);
        } else {
          setLastMessage(snapshot.docs[0].data());
        }
      });

    const url = "images/" + props.email + ".png";
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(url);

    imageRef
      .getDownloadURL()
      .then((url) => {
        setDoesUserHaveAvatar(true);
        setImageURL(url);
      })
      .catch(() => {
        setDoesUserHaveAvatar(false);
      });

    return () => {
      unsubscribe();
    };
  }, [props.email]);

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("PrivateMessageScreen", {
            username: props.username,
            email: props.email,
          });
        }}
        onLongPress={() => {
          DeviceEventEmitter.emit("userProfile", { email: props.email });
        }}
      >
        <View style={[styles.box, { backgroundColor: "transparent" }]}>
          {doesUserHaveAvatar && (
            <Avatar.Image
              source={{
                uri: imageURL,
              }}
              size={50}
            />
          )}

          {!doesUserHaveAvatar && (
            <Avatar.Image
              source={require("../../assets/anonymous-user.png")}
              size={50}
            />
          )}

          <View style={styles.boxContent}>
            <Text style={styles.title}>{props.username}</Text>

            {lastMessage.text === "No previous message" && (
              <Text style={styles.description}>No previous conversation</Text>
            )}

            {lastMessage.text !== "No previous message" && (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={
                  !lastMessage ||
                  lastMessage.user._id !== auth.currentUser?.email
                    ? styles.blackDescription
                    : styles.description
                }
              >
                {lastMessage.text}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
  },
  icon: {
    width: 20,
    height: 20,
    alignSelf: "center",
    marginRight: 10,
  },
  box: {
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: "white",
    flexDirection: "row",
  },
  boxContent: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    marginLeft: 10,
  },
  description: {
    fontSize: 15,
    color: "#646464",
  },
  blackDescription: {
    fontSize: 15,
    color: "black",
  },
  title: {
    fontSize: 18,
    color: "#151515",
  },
});
