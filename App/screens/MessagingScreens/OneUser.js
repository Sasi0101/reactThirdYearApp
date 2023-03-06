import { StyleSheet, Text, View, Dimensions } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { auth, firestore } from "../../firebase";
import { Avatar } from "react-native-paper";
import "firebase/storage";
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
    <TouchableOpacity
      style={{ width: Dimensions.get("window").width * 1 }}
      onPress={() => {
        navigation.navigate("PrivateMessageScreen", {
          username: props.username,
          email: props.email,
        });
      }}
    >
      <View style={[{ flexDirection: "row", flex: 1 }, styles.boxContainer]}>
        <View style={{ paddingLeft: 5, flex: 1 }}>
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
        </View>
        <View style={{ paddingLeft: 5, flex: 5 }}>
          <Text style={styles.textContainer}>{props.username}</Text>

          {lastMessage.text === "No previous message" && (
            <Text style={styles.textContainer}>No previous conversation</Text>
          )}

          {lastMessage.text !== "No previous message" && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={
                !lastMessage || lastMessage.user._id !== auth.currentUser?.email
                  ? styles.blackTextContainer
                  : styles.textContainer
              }
            >
              {lastMessage.text}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boxContainer: {
    borderWidth: 1,
    borderColor: "black",
    padding: 10,
    margin: 10,

    alignItems: "center",
  },
  textContainer: {
    fontSize: 16,
    marginVertical: 5,
  },
  blackTextContainer: {
    fontSize: 16,
    marginVertical: 5,
    fontWeight: "bold",
  },
});
