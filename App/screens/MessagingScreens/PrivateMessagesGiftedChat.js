import { StyleSheet, View } from "react-native";
import React from "react";
import { useState, useLayoutEffect, useCallback, useEffect } from "react";
import { GiftedChat, Actions, ActionsProps } from "react-native-gifted-chat";
import { auth, firestore } from "../../firebase";
import "firebase/storage";
import firebase from "firebase/app";
import BadWordsFilter from "bad-words";
import { COLORS } from "../../constants/COLORS";

export default function PrivateMessagesGiftedChat(props) {
  const filter = new BadWordsFilter();
  const [messages, setMessages] = useState([]);
  const [user_id, setUserId] = useState();
  const [downloadURL, setDownloadURl] = useState();
  const [username, setUsername] = useState();

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
    getImageUrl(auth.currentUser?.email);
    let temp_id =
      auth.currentUser?.email.localeCompare(props.route.params.email) > 0
        ? auth.currentUser?.email + props.route.params.email
        : props.route.params.email + auth.currentUser?.email;

    setMessages([]);
    setUserId(temp_id);

    firestore
      .collection("users")
      .doc(auth.currentUser?.email)
      .get()
      .then((doc) => {
        setUsername(doc.data().username);
      });

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
      const dataToUpload = {
        _id: messages[0]._id,
        createdAt: messages[0].createdAt,
        text: filter.clean(messages[0].text),
        user: messages[0].user,
      };

      firestore
        .collection("privateMessages")
        .doc(user_id)
        .collection("messages")
        .add(dataToUpload)
        .catch((error) => {
          console.error(
            "Error adding an element when the user hit send: ",
            error
          );
        });
    },
    [user_id]
  );

  const getImageUrl = async (filename) => {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child("images/" + filename + ".png");

    imageRef
      .getDownloadURL()
      .then((url) => {
        setDownloadURl(url);
      })
      .catch(() => {
        setDownloadURl(
          "https://firebasestorage.googleapis.com/v0/b/third-year-project-4e8dd.appspot.com/o/images%2Fanonymous-user.png?alt=media&token=cde172df-d191-47b3-af3d-92b7c05f8b8b"
        );
      });
  };

  //choose image here and then when sent save it
  const handlePickImage = () => {
    console.log("should pick image");
  };

  const handleAttachFile = () => {
    console.log("should handle attach of a file");
  };

  function renderActions(props) {
    return (
      <>
        <Actions
          {...props}
          options={{
            ["Send Image"]: handlePickImage,
          }}
          onSend={(args) => console.log(args)}
        />

        <Actions
          {...props}
          options={{
            ["Attach File"]: handleAttachFile,
          }}
          onSend={(args) => console.log(args)}
        />
      </>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: auth.currentUser?.email,
          avatar: downloadURL,
          //name: username, not need this for private messages but for group messages yes
        }}
        showAvatarForEveryMessage={true}
        //renderUsernameOnMessage={true} need for the usernames
        onPressAvatar={(user) =>
          console.log(`Avatar pressed for user ${user._id}`)
        }
        onPress={() => console.log("message was pressed")}
        //renderActions={renderActions}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
