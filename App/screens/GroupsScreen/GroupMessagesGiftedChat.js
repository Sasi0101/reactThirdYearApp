import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { auth, firestore } from "../../firebase";
import { useState, useLayoutEffect, useCallback, useEffect } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { Overlay } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import BadWordsFilter from "bad-words";
import "firebase/storage";
import firebase from "firebase/app";
import { DeviceEventEmitter } from "react-native";

export default function GroupMessagesGiftedChat(props) {
  const filter = new BadWordsFilter();
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const [isOwnerOverlayOn, setIsOwnerOverLayOn] = useState(false);
  const [isNotOwnerOverlayOn, setIsNotOwnerOverlayOn] = useState(false);
  const [reportData, setreportData] = useState();
  const [downloadURL, setDownloadURl] = useState();
  const [userID, setUserID] = useState();
  const [isTyping, setIsTyping] = useState(false);

  useLayoutEffect(() => {
    getImageUrl(auth.currentUser?.email);
  }, []);

  useEffect(() => {
    props.navigation.setOptions({ title: props.route.params.data.name });
    const unsubscribe = firestore
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

    const unsubscribe2 = firestore
      .collection("groups")
      .doc(props.route.params.id)
      .onSnapshot((doc) => {
        const tempData = doc.data();
        if (
          tempData.bannedUsers &&
          tempData.bannedUsers.includes(auth.currentUser?.email)
        ) {
          navigation.navigate("MessagingScreen");
        }
      });

    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, [props]);

  useEffect(() => {
    if (
      props.route.params.data.bannedUsers &&
      props.route.params.data.bannedUsers.includes(auth.currentUser?.email)
    ) {
      console.log("Should leave the screen");
    }
  }, [props.route.params.data]);

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

  function handleLongPress(tempMessage) {
    setreportData(tempMessage);
    if (tempMessage.user._id == auth.currentUser?.email) return;
    auth.currentUser?.email !== props.route.params.data.owner
      ? setIsOwnerOverLayOn(true)
      : setIsNotOwnerOverlayOn(true);
  }

  async function reportUser() {
    const newData = {
      userReported: reportData.user._id,
      text: reportData.text,
      userWhoReported: auth.currentUser?.email,
    };

    await firestore
      .collection("reports")
      .add(newData)
      .catch((error) =>
        console.error("Error while reporting someone: ", error)
      );
    setIsNotOwnerOverlayOn(false);
    setIsOwnerOverLayOn(false);
  }

  async function kickUser() {
    const filteredMembers = props.route.params.data.members.filter(
      (item) => item !== reportData.user._id
    );

    await firestore
      .collection("groups")
      .doc(props.route.params.id)
      .update({
        members: filteredMembers,
      })
      .catch((error) =>
        console.error("Error when trying to kick a user: ", error)
      );
    setIsOwnerOverLayOn(false);
  }

  async function banUser() {
    kickUser();
    let tempBannedUsers = [];
    await firestore
      .collection("groups")
      .doc(props.route.params.id)
      .get()
      .then(async (data) => {
        if (data.data().bannedUsers) {
          tempBannedUsers = data.data().bannedUsers;
          tempBannedUsers.push(reportData.user._id);
          await firestore
            .collection("groups")
            .doc(props.route.params.id)
            .update({
              bannedUsers: tempBannedUsers,
            })
            .catch((error) =>
              console.error("Error while updating bannedUsers: ", error)
            );
        } else {
          tempBannedUsers.push(reportData.user._id);

          await firestore
            .collection("groups")
            .doc(props.route.params.id)
            .set(
              {
                bannedUsers: tempBannedUsers,
              },
              { merge: true }
            )
            .catch((error) =>
              console.error("Error while updating bannedUsers: ", error)
            );
        }
      })
      .catch((error) =>
        console.error(
          "Error while getting banned users in groupMessagesGiftedChat: ",
          error
        )
      );

    setIsOwnerOverLayOn(false);
  }

  let onSend = useCallback(
    (messages = []) => {
      //adding the element to the database

      const dataToUpload = {
        _id: messages[0]._id,
        createdAt: messages[0].createdAt,
        text: filter.clean(messages[0].text),
        user: messages[0].user,
      };

      firestore
        .collection("groups")
        .doc(props.route.params.id)
        .collection("messages")
        .add(dataToUpload)
        .catch((error) => {
          console.error(
            "Error adding an element when the user hit send: ",
            error
          );
        });

      firestore
        .collection("groups")
        .doc(props.route.params.id)
        .update(
          {
            lastMessageSent: messages[0],
          },
          { merge: true }
        )
        .catch((error) =>
          console.error(
            "Error while updating lastMessageSent in groupMessagesGiftedChat: ",
            error
          )
        );
    },
    [props]
  );

  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => {
          onSend(messages);
        }}
        user={{
          _id: auth.currentUser?.email,
          avatar: downloadURL,
          name: auth.currentUser?.email,
        }}
        onLongPress={(context, message) => handleLongPress(message)}
        //onPressAvatar={(test) => console.log(test)}
        //onPress={(context, message) => showUserId(message)}
        showAvatarForEveryMessage={true}
        renderUsernameOnMessage={true}
      />

      <Overlay
        isVisible={isNotOwnerOverlayOn}
        onBackdropPress={() => setIsNotOwnerOverlayOn(false)}
      >
        <View style={{ width: Dimensions.get("window").width * 0.9 }}>
          <TouchableOpacity onPress={() => reportUser()}>
            <Text>Report user</Text>
          </TouchableOpacity>
        </View>
      </Overlay>

      <Overlay
        isVisible={isOwnerOverlayOn}
        onBackdropPress={() => setIsOwnerOverLayOn(false)}
      >
        <View style={{ width: Dimensions.get("window").width * 0.9 }}>
          <TouchableOpacity onPress={() => reportUser()}>
            <Text>Report user</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => kickUser()}>
            <Text>Kick user</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => banUser()}>
            <Text>Ban user</Text>
          </TouchableOpacity>
        </View>
      </Overlay>
    </View>
  );
}

const styles = StyleSheet.create({});
