import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Button,
  Dimensions,
  Alert,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { auth, firestore } from "../../firebase";
import { Overlay } from "@rneui/themed";
import GroupMessagesGiftedChat from "./GroupMessagesGiftedChat";

export default function OneGroup(props) {
  const navigation = useNavigation();
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isThereSpaceLeft, setIsThereSpaceLeft] = useState(true);

  useLayoutEffect(() => {
    props.data.data.members.length >= props.data.data.numberlimit
      ? setIsThereSpaceLeft(false)
      : setIsThereSpaceLeft(true);

    props.data.data.members.includes(auth.currentUser?.email)
      ? setIsJoined(true)
      : setIsJoined(false);

    console.log(isJoined, " ", isThereSpaceLeft);
  }, [props]);

  useEffect(() => {}, [isJoined, isThereSpaceLeft]);

  const handleJoin = () => {
    let prevMembers = [];
    prevMembers = props.data.data.members;
    let newMembers = [...prevMembers, auth.currentUser?.email];

    firestore
      .collection("groups")
      .doc(props.data.id)
      .update({
        members: newMembers,
      })
      .then(() => {
        navigation.navigate("GroupMessagesGiftedChat");
      })
      .catch((error) => {
        console.error("Error when updating join: ", error);
      });

    navigation.navigate("GroupMessageScreen");
  };

  return (
    <>
      {!isJoined && isThereSpaceLeft && (
        <View style={styles.item}>
          <Text style={styles.title}>{props.data.data.name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {props.data.data.description}
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
              {props.data.data.description}
            </Text>
            <View style={{ flexDirection: "row", paddingTop: 10 }}>
              <Text style={{ fontSize: 20 }}>Members: </Text>
              <Text style={{ fontSize: 20 }}>
                {props.data.data.members.join(", ")}
              </Text>
            </View>

            <Text style={{ fontSize: 20, paddingTop: 10 }}>
              Number of people: {props.data.data.members.length}/
              {props.data.data.numberlimit}
            </Text>

            <Text style={{ fontSize: 20, paddingTop: 10 }}>
              Owner: {props.data.data.owner}
            </Text>
          </Overlay>
        </View>
      )}

      {!isThereSpaceLeft && !isJoined && (
        <TouchableOpacity onPress={() => setShowInfoOverlay(true)}>
          <View style={styles.item}>
            <Text style={styles.title}>{props.data.data.name}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {props.data.data.description}
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
                {props.data.data.description}
              </Text>
              <View style={{ flexDirection: "row", paddingTop: 10 }}>
                <Text style={{ fontSize: 20 }}>Members: </Text>
                <Text style={{ fontSize: 20 }}>
                  {props.data.data.members.join(", ")}
                </Text>
              </View>

              <Text style={{ fontSize: 20, paddingTop: 10 }}>
                Number of people: {props.data.data.members.length}/
                {props.data.data.numberlimit}
              </Text>

              <Text style={{ fontSize: 20, paddingTop: 10 }}>
                Owner: {props.data.data.owner}
              </Text>
            </Overlay>
          </View>
        </TouchableOpacity>
      )}

      {isJoined && (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("GroupMessageScreen");
          }}
        >
          <View style={styles.item}>
            <Text style={styles.title}>{props.data.data.name}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              last message comes here
            </Text>
          </View>
        </TouchableOpacity>
      )}
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
