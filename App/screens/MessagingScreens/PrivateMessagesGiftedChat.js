import { StyleSheet, View } from "react-native";
import React from "react";
import { useState, useLayoutEffect, useCallback, useEffect } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { auth, firestore } from "../../firebase";

export default function PrivateMessagesGiftedChat(props) {
  const [messages, setMessages] = useState([]);
  const [user_id, setUserId] = useState();

  async function handleSpokenTo2() {
    let currentUser;
    let otherUser;

    await firestore
      .collection("users")
      .doc(auth.currentUser?.email)
      .get()
      .then((doc) => {
        currentUser = doc.data();
      })
      .catch((error) =>
        console.error("Error at privateMessagesGiftedChat currentUser: ", error)
      );

    await firestore
      .collection("users")
      .doc(props.route.params.email)
      .get()
      .then((doc) => {
        otherUser = doc.data();
      })
      .catch((error) =>
        console.error("Error in privateMessagesGiftedChat otherUser: ", error)
      );

    let currentUserTalkedTo = currentUser.usersTalkedTo
      ? currentUser.usersTalkedTo
      : [];
    let otherUserTalkedTo = otherUser.usersTalkedTo
      ? otherUser.usersTalkedTo
      : [];

    let filteredCurrentArray = currentUserTalkedTo.filter(
      (item) => item.email != otherUser.email
    );
    let filteredOtherArray = otherUserTalkedTo.filter(
      (item) => item.email != currentUser.email
    );

    firestore
      .collection("users")
      .doc(auth.currentUser?.email)
      .update({
        usersTalkedTo: [
          { email: otherUser.email, username: otherUser.username },
          ...filteredCurrentArray,
        ],
      })
      .catch((error) =>
        console.error(
          "Error when updating first user in private gifted chat: ",
          error
        )
      );

    firestore
      .collection("users")
      .doc(otherUser.email)
      .update({
        usersTalkedTo: [
          { email: currentUser.email, username: currentUser.username },
          ...filteredOtherArray,
        ],
      })
      .catch((error) =>
        console.error(
          "Error when updating first user in private gifted chat: ",
          error
        )
      );
  }

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
      handleSpokenTo2();
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
