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

export default function OneGroup(props) {
  const navigation = useNavigation();
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isThereSpaceLeft, setIsThereSpaceLeft] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [data, setData] = useState(null);
  const [showPasswordOverLay, setShowPasswordOverlay] = useState(false);
  const [password, setPassword] = useState("");
  const [lastMessage, setLastMessage] = useState("");

  //useLayoutEffect if it needs to

  useLayoutEffect(() => {
    const unsubscribe = firestore
      .collection("groups")
      .doc(props.data.id)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .limit(1)
      .onSnapshot((snapshot) => {
        if (snapshot.empty) {
          const tempMessage = {
            user: { _id: auth.currentUser?.email },
            text: "No previous message",
          };
          setLastMessage(tempMessage);
        } else {
          setLastMessage(snapshot.docs[0].data());
        }
      });

    return () => {
      unsubscribe();
    };
  }, []);

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

  useEffect(() => {
    const tempData = props.data.data;
    if (tempData) {
      setData(tempData);
      tempData.members.includes(auth.currentUser?.email)
        ? setIsJoined(true)
        : setIsJoined(false);
      if (
        tempData.bannedUsers &&
        tempData.bannedUsers.includes(auth.currentUser?.email)
      ) {
        setIsBanned(true);
      } else {
        setIsBanned(false);
      }
    }
  }, [props.data]);

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

  return (
    <>
      {!isJoined && isThereSpaceLeft && data && !isBanned && (
        <View style={styles.item}>
          <Text style={styles.title}>{data.name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {data.description}
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
                maxWidth: Dimensions.get("window").width * 0.8,
              }}
            >
              <Text
                style={{
                  width: Dimensions.get("window").width * 0.9,
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
          }}
          onLongPress={() => {
            Alert.alert(
              "Exitting",
              "Are you sure you want to exit from this group?",
              [
                { text: "No", onPress: () => {} },
                { text: "Yes", onPress: () => handleExit() },
              ]
            );
          }}
        >
          <View style={styles.item}>
            <Text style={styles.title}>{data.name}</Text>
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
            maxWidth: Dimensions.get("window").width * 0.8,
          }}
        >
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            maxLength={32}
          />

          <View style={{ flexDirection: "row", paddingVertical: 10 }}>
            <TouchableOpacity
              onPress={() => {
                setShowPasswordOverlay(!showPasswordOverLay);
                setPassword("");
              }}
              style={{ left: 5 }}
            >
              <Text> Cancel </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingLeft: 70 }}
              onPress={() => {
                setShowPasswordOverlay(!showPasswordOverLay);
                setPassword("");
                handleRequestForAccess();
              }}
            >
              <Text>Ask owner to join</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleJoin()}
              style={{ position: "absolute", right: 5, paddingTop: 10 }}
            >
              <Text> Ok </Text>
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
});
