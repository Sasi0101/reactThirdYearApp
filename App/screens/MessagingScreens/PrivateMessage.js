import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { GiftedChat } from "react-native-gifted-chat";
import { auth, firestore } from "../../firebase";

export default function PrivateMessage(props) {
  const [messages, setMessages] = useState([]);
  let users_id = "";
  //makes the id and checks if there is one document existing or no if not
  //it will make a new document with that
  async function checkIdExists() {
    if (auth.currentUser?.email > props.route.params.email) {
      users_id = auth.currentUser?.email + props.route.params.email;
    } else {
      users_id = props.route.params.email + auth.currentUser?.email;
    }

    try {
      const querySnapshot = await firestore
        .collection("privateMessages")
        .doc(users_id)
        .get();

      if (!querySnapshot.exists) {
        const newData = { id: users_id, lastMessage: "", messages: [] };
        firestore.collection("privateMessages").doc(users_id).set(newData);
      } else {
        setMessages(querySnapshot.messages);
      }
    } catch (error) {
      console.log("Error at private messages ", error);
    }
    return users_id;
  }

  useEffect(() => {
    checkIdExists();
    props.navigation.setOptions({ title: props.route.params.username });
  }, []);

  const onSend = (newMessages) => {
    setMessages(GiftedChat.append(messages, newMessages));
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{ _id: auth.currentUser?.email }}
    />
  );
}

const styles = StyleSheet.create({});
