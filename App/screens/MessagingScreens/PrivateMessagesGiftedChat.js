import { StyleSheet, View } from "react-native";
import React from "react";
import { useState, useLayoutEffect, useCallback, useEffect } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { auth, firestore } from "../../firebase";

export default function PrivateMessagesGiftedChat(props) {
  const [messages, setMessages] = useState([]);
  const [user_id, setUserId] = useState();

  //happens when the email change
  useLayoutEffect(() => {
    let temp_id =
      auth.currentUser?.email.localeCompare(props.route.params.email) > 0
        ? auth.currentUser?.email + props.route.params.email
        : props.route.params.email + auth.currentUser?.email;

    setMessages([]);
    setUserId(temp_id);

    props.navigation.setOptions({ title: props.route.params.username });
  }, [props.route.params.email]);

  useEffect(() => {
    let unsubscribe = firestore
      .collection("privateMessages")
      .doc(user_id)
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
  }, [user_id]);

  let onSend = useCallback(
    (messages = []) => {
      console.log("id where submitting is ", user_id);

      //adding the element to the database
      firestore
        .collection("privateMessages")
        .doc(user_id)
        .collection("messages")
        .add(messages[0])
        .catch((error) => {
          console.error(
            "Error adding an element when the user hit send: ",
            error
          );
        });
    },
    [user_id]
  );

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
