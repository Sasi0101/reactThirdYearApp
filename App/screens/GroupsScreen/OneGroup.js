import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { auth, firestore } from "../../firebase";
import { Overlay } from "@rneui/themed";
import { COLORS } from "../../constants/COLORS";

export default function OneGroup(props) {
  const navigation = useNavigation();
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isThereSpaceLeft, setIsThereSpaceLeft] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [data, setData] = useState(null);
  const [showPasswordOverLay, setShowPasswordOverlay] = useState(false);
  const [password, setPassword] = useState("");
  const [lastMessage, setLastMessage] = useState({});
  const [showGroupMessagesGiftedChat, setShowGroupMessagesGfitedChat] =
    useState(false);

  //useLayoutEffect if it needs to

  useLayoutEffect(() => {
    setLastMessage(props.data.data.lastMessageSent);
    if (props.data.data) {
      setData(props.data.data);

      //checking if user is joined or not
      props.data.data.members.includes(auth.currentUser?.email)
        ? setIsJoined(true)
        : setIsJoined(false);

      //checking if user is banned or not
      if (
        props.data.data.bannedUsers &&
        props.data.data.bannedUsers.includes(auth.currentUser?.email)
      ) {
        setIsBanned(true);
      } else {
        setIsBanned(false);
      }

      //checking if there is space in the group
    }
  }, [props.data]);

  useEffect(() => {
    if (data) {
      data.members.length >= data.numberlimit
        ? setIsThereSpaceLeft(false)
        : setIsThereSpaceLeft(true);

      data.members.includes(auth.currentUser?.email)
        ? setIsJoined(true)
        : setIsJoined(false);
    }
  }, [data]);

  useEffect(() => {}, [isJoined, isThereSpaceLeft]);

  function handleJoin() {
    if (data.password.length !== 0 && password.length === 0) {
      setShowPasswordOverlay(true);
      return;
    }

    if (data.password.length !== 0 && password.length !== 0) {
      if (password !== data.password) {
        Alert.alert("Error", "Password is not correct");
        return;
      }
    }

    setIsJoined(true);
    setShowPasswordOverlay(false);
    let prevMembers = [];
    prevMembers = data.members;
    let newMembers = [...prevMembers, auth.currentUser?.email];

    firestore
      .collection("groups")
      .doc(props.data.id)
      .update({
        members: newMembers,
      })
      .then(() => {
        navigation.navigate("GroupMessageScreen", {
          id: props.data.id,
          data: data,
        });
      })
      .catch((error) => {
        console.error("Error when updating join: ", error);
      });
  }

  async function handleExit() {
    const updatedMembers = data.members.filter(
      (item) => item !== auth.currentUser?.email
    );

    firestore
      .collection("groups")
      .doc(props.data.id)
      .update({
        members: updatedMembers,
      })
      .catch((error) => {
        console.error("Error when exiting from group: ", error);
      });
  }

  const handleRequestForAccess = async () => {
    // Get the previous notifications data
    const userRef = firestore.collection("users").doc(data.owner);
    const userSnapshot = await userRef.get();

    let previousNotifications = [];
    if (userSnapshot.exists) {
      const userData = userSnapshot.data();
      if (userData.notifications) {
        previousNotifications = userData.notifications;
      }
    }

    // Add the new notification
    const tempData = {
      id: Math.random(),
      type: "groupAddition",
      email: auth.currentUser?.email,
      note: "test note",
      groupID: props.data.id,
      groupName: data.name,
    };

    await userRef.set(
      {
        notifications: [...previousNotifications, tempData],
      },
      { merge: true }
    );
  };

  const handleDelete = async () => {
    firestore
      .collection("groups")
      .doc(props.data.id)
      .delete()
      .catch((error) => console.warn("Error while deleting group: ", error));
  };

  return (
    <>
      {!isJoined && isThereSpaceLeft && data && !isBanned && (
        <View style={styles.item}>
          <Text style={styles.title}>{data.name}</Text>
          {data.description.length > 0 && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {data.description}
            </Text>
          )}

          <Text style={[styles.countMembers, { paddingBottom: 5 }]}>
            {data.members.length}
            {data.members.length === 1 ? " member" : " members"}
          </Text>
          <View style={{ flex: 1, flexDirection: "row", top: 5 }}>
            <TouchableOpacity
              style={{ width: "50%" }}
              onPress={() => {
                setShowInfoOverlay(true);
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  left: 5,
                  bottom: 10,
                }}
              >
                Info
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ width: "50%" }}
              onPress={() => {
                Alert.alert(
                  "Joining",
                  "Are you sure you want to join this groups?",
                  [
                    { text: "No", onPress: () => {} },
                    { text: "Yes", onPress: () => handleJoin() },
                  ]
                );
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  right: 5,
                  bottom: 10,
                  alignSelf: "flex-end",
                }}
              >
                Join
              </Text>
            </TouchableOpacity>
          </View>

          <Overlay
            isVisible={showInfoOverlay}
            onBackdropPress={() => setShowInfoOverlay(false)}
          >
            <View
              style={{
                width: Dimensions.get("window").width * 0.8,
              }}
            >
              <Text
                style={{
                  width: Dimensions.get("window").width * 0.8,
                  fontSize: 23,
                }}
              >
                Description:
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  borderRadius: 5,
                  paddingHorizontal: 2,
                  borderWidth: 1,
                }}
              >
                {data.description}
              </Text>
              <View
                style={{
                  flexDirection: "column",
                  paddingTop: 10,
                  width: Dimensions.get("window").width * 0.8,
                }}
              >
                <Text style={{ fontSize: 20 }}>Members: </Text>
                <Text
                  style={{
                    fontSize: 20,
                    borderWidth: 1,
                    paddingHorizontal: 2,
                  }}
                >
                  {data.members.join(", ")}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 20,
                  paddingTop: 10,
                  maxWidth: Dimensions.get("window").width * 0.8,
                }}
              >
                Number of people: {data.members.length}/{data.numberlimit}
              </Text>

              <Text style={{ fontSize: 20, paddingTop: 10 }}>
                Owner: {data.owner}
              </Text>
            </View>
          </Overlay>
        </View>
      )}

      {!isThereSpaceLeft && !isJoined && data && !isBanned && (
        <TouchableOpacity onPress={() => setShowInfoOverlay(true)}>
          <View style={styles.item}>
            <Text style={styles.title}>{data.name}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {data.description}
            </Text>

            <View style={{ flex: 1, flexDirection: "row", top: 5 }}>
              <Text
                style={{
                  fontSize: 22,
                  left: 5,
                  bottom: 10,
                }}
              >
                This group is at capacity!
              </Text>
            </View>

            <Overlay
              isVisible={showInfoOverlay}
              onBackdropPress={() => setShowInfoOverlay(false)}
            >
              <Text
                style={{
                  maxWidth: Dimensions.get("window").width * 0.8,
                  fontSize: 23,
                }}
              >
                Description:
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  backgroundColor: "#E7DECC",
                  borderRadius: 5,
                  paddingHorizontal: 5,
                }}
              >
                {data.description}
              </Text>
              <View style={{ flexDirection: "row", paddingTop: 10 }}>
                <Text style={{ fontSize: 20 }}>Members: </Text>
                <Text style={{ fontSize: 20 }}>{data.members.join(", ")}</Text>
              </View>

              <Text style={{ fontSize: 20, paddingTop: 10 }}>
                Number of people: {data.members.length}/{data.numberlimit}
              </Text>

              <Text style={{ fontSize: 20, paddingTop: 10 }}>
                Owner: {data.owner}
              </Text>
            </Overlay>
          </View>
        </TouchableOpacity>
      )}

      {isJoined && data && !isBanned && (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("GroupMessageScreen", {
              data: data,
              id: props.data.id,
            });
            //setShowGroupMessagesGfitedChat(true);
          }}
          onLongPress={() => {
            if (props.data.data.owner === auth.currentUser?.email) {
              Alert.alert(
                "Deleting group",
                "Are you sure you want to delete this group?",
                [
                  { text: "No", onPress: () => {} },
                  { text: "Yes", onPress: () => handleDelete() },
                ]
              );
            } else {
              Alert.alert(
                "Exitting",
                "Are you sure you want to exit from this group?",
                [
                  { text: "No", onPress: () => {} },
                  { text: "Yes", onPress: () => handleExit() },
                ]
              );
            }
          }}
        >
          <View style={styles.item}>
            <Text style={styles.groupName}>{data.name}</Text>
            <Text style={styles.countMembers}>
              {data.members.length}
              {data.members.length === 1 ? " member" : " members"}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {lastMessage.text}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <Overlay
        isVisible={showPasswordOverLay}
        onBackdropPress={() => {
          setShowPasswordOverlay(!showPasswordOverLay);
          setPassword("");
        }}
      >
        <View
          style={{
            width: Dimensions.get("window").width * 0.8,
          }}
        >
          <TextInput
            placeholder="Password"
            placeholderTextColor={"gray"}
            value={password}
            onChangeText={(text) => setPassword(text)}
            maxLength={32}
            style={{ borderWidth: 1, paddingHorizontal: 5, borderRadius: 5 }}
          />

          <View
            style={{
              flexDirection: "row",
              paddingVertical: 10,
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setShowPasswordOverlay(!showPasswordOverLay);
                setPassword("");
              }}
              style={{
                backgroundColor: COLORS.primary,
                borderWidth: 1,
                borderRadius: 5,
                elevation: 4,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary,
                borderWidth: 1,
                borderRadius: 5,
                elevation: 4,
                alignItems: "center",
              }}
              onPress={() => {
                setShowPasswordOverlay(!showPasswordOverLay);
                setPassword("");
                handleRequestForAccess();
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                }}
              >
                Ask owner to join
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleJoin()}
              style={{
                backgroundColor: COLORS.primary,
                borderWidth: 1,
                borderRadius: 5,
                elevation: 4,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                }}
              >
                Ok
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Overlay>
    </>
  );
}

const styles = StyleSheet.create({
  item: {
    marginHorizontal: 10,
    marginVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    color: "#000000",
    fontSize: 30,
    margin: 5,
  },
  subtitle: {
    color: "#999999",
    fontSize: 20,
    margin: 5,
  },
  countMembers: {
    color: "#1E90FF",
    marginLeft: 5,
    fontSize: 18,
  },
  groupName: {
    fontSize: 28,
    color: "black",
    marginLeft: 5,
  },
});
