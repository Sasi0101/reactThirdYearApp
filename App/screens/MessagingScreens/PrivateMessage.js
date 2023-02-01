import { StyleSheet, View, FlatList } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import OneMessage from "./OneMessage";
import { auth, firestore } from "../../firebase";
import SendAndTextInput from "./SendAndTextInput";
import { GiftedChat } from "react-native-gifted-chat";

export default function PrivateMessage(props) {
  const [messages, setMessages] = useState([""]);
  const [user_id, setUsersId] = useState(null);

  //makes the id and checks if there is one document existing or no if not
  //it will make a new document with that
  async function checkIdExists() {
    let users_id = "";
    auth.currentUser?.email > props.route.params.email
      ? (users_id = auth.currentUser?.email + props.route.params.email)
      : (users_id = props.route.params.email + auth.currentUser?.email);

    const querySnapshot = await firestore
      .collection("privateMessages")
      .doc(users_id)
      .collection("messages")
      .get()
      .then((snapshot) => {
        if (!snapshot.empty) {
          const messagesArray = snapshot.docs.map((doc) => doc.data());
          setMessages(messagesArray);
        } else {
          console.log("Its empty");
        }
      })
      .catch((error) => {
        console.error("Error in private message: ", error);
      });

    return users_id;
  }

  useLayoutEffect(() => {
    //checkIdExists();
    setMessages(null);
    async function fetchData() {
      const id = await checkIdExists();
      setUsersId(id);
      const unsubscribe = firestore
        .collection("privateMessages")
        .doc(id)
        .collection("messages")
        .onSnapshot((snapshot) => {
          console.log(snapshot);
          //setMessages((prev) => [...prev, change.doc.data()]);
        });
      unsubscribe();
    }
    fetchData();

    props.navigation.setOptions({ title: props.route.params.username });
  }, [props.route.params.username]);

  useEffect(() => {}, [messages]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <OneMessage
            text={item.text}
            user={item.sentBy}
            time={item.createdAt}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <SendAndTextInput userId={user_id} />
    </View>
  );
}

const styles = StyleSheet.create({});
