import { StyleSheet, Text, View } from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { auth, firestore } from "../../firebase";

export default function OneUser(props) {
  const navigation = useNavigation();
  const [lastMessage, setLastMessage] = useState("");

  useLayoutEffect(() => {
    //the id where the last message is
    let temp_id =
      auth.currentUser?.email.localeCompare(props.email) > 0
        ? auth.currentUser?.email + props.email
        : props.email + auth.currentUser?.email;

    firestore
      .collection("privateMessages")
      .doc(temp_id)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          const tempMessage = {
            user: auth.currentUser?.email,
            text: "No previous message",
          };
          setLastMessage(tempMessage);
        } else {
          setLastMessage(snapshot.docs[0].data());
        }
      })
      .catch((error) =>
        console.error("Error when printing out last message: ", error)
      );
  }, []);
  //console.log("hello");

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("PrivateMessageScreen", {
          username: props.username,
          email: props.email,
        });
      }}
    >
      <View style={styles.boxContainer}>
        <Text style={styles.textContainer}>{props.username}</Text>
        <Text style={styles.textContainer}>{props.email}</Text>
        <Text
          style={
            lastMessage.user._id === auth.currentUser?.email
              ? styles.textContainer
              : styles.blackTextContainer
          }
        >
          {lastMessage.text}
        </Text>
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
