import { Button, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { firestore, firebase } from "../../firebase";
//import { getUsername } from "../Helpers/UserInfo";

export default function ChatApp() {
  const [messages, setMessages] = useState("");
  const [newMessage, setNewMessage] = useState("");

  /*useEffect(() => {
    firebase
      .database()
      .ref("users")
      .on("value", (snapshot) => {
        const messagesData = snapshot.val();
      });
  }, []);
  */
  const onLog = () => {};

  return (
    <View>
      <Text>ChatApp</Text>
      <Button title="Test" onPress={onLog} />
    </View>
  );
}

const styles = StyleSheet.create({});
