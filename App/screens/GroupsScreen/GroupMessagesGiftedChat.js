import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { auth, firestore } from "../../firebase";
import { useState, useLayoutEffect, useCallback, useEffect } from "react";
import { GiftedChat } from "react-native-gifted-chat";

export default function GroupMessagesGiftedChat(props) {
  const [messages, setMessages] = useState("");
  console.log(props.route.params);

  useLayoutEffect(() => {
    props.navigation.setOptions({ title: props.route.params.data.name });
  }, [props.route.params.data.name]);

  useEffect(() => {
    let unsubscribe = firestore
      .collection("groups")
      .doc(props.route.params.id)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            _id: doc.data()._id,
            createdAt: doc.data().createdAt.toDate(),
            text: doc.data().text,
            user: doc.data().user,
          }))
        );
      });

    return () => {
      unsubscribe();
    };
  }, []);

  let onSend = useCallback((messages = []) => {
    //handleSpokenTo2();
    //adding the element to the database
    firestore
      .collection("groups")
      .doc(props.route.params.id)
      .collection("messages")
      .add(messages[0])
      .catch((error) => {
        console.error(
          "Error adding an element when the user hit send: ",
          error
        );
      });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: auth.currentUser?.email,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
