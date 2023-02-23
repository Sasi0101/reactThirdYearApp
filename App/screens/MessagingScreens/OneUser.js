import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { auth, firestore } from "../../firebase";

export default function OneUser(props) {
  const navigation = useNavigation();
  const [lastMessage, setLastMessage] = useState("");

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

    return () => {
      unsubscribe();
    };
  }, [props.email]);

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
        {lastMessage.text === "No previous message" && (
          <Text style={styles.textContainer}>No previous conversation</Text>
        )}

        {lastMessage.text !== "No previous message" && (
          <Text
            style={
              !lastMessage || lastMessage.user._id !== auth.currentUser?.email
                ? styles.blackTextContainer
                : styles.textContainer
            }
          >
            Last message is: {lastMessage.text}
          </Text>
        )}
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
