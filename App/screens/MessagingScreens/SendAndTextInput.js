import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import React, { useState } from "react";
import { auth, firestore } from "../../firebase";

export default function SendAndTextInput({ userId }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const newMessage = {
      text: message,
      sentBy: auth.currentUser?.email,
      createdAt: new Date(),
    };
    firestore
      .collection("privateMessages")
      .doc(userId)
      .collection("messages")
      .add(newMessage)
      .catch((error) => {
        console.error("Error at sending message: ", error);
      });

    setMessage("");
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TextInput
        placeholder="Type your message here..."
        value={message}
        onChangeText={(text) => setMessage(text)}
        style={{ flex: 1, height: 40, borderWidth: 1 }}
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
}

const styles = StyleSheet.create({});
