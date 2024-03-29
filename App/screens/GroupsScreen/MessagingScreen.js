import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
} from "react-native";
import React, { useLayoutEffect } from "react";
import { CheckBox } from "@rneui/themed";
import { COLORS } from "../../constants/COLORS";
//import { Checkbox } from "@react-native-community/checkbox";
import { useState, useEffect } from "react";
import { auth, firestore } from "../../firebase";
import OneGroup from "./OneGroup";
import { Overlay } from "@rneui/themed";
import { Button } from "react-native";

export default function MessagingScreen(props) {
  const [groupNames, setGroupNames] = useState([]);
  const [showAddOverlay, setShowAddOverlay] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupPassword, setGroupPassword] = useState("");
  const [checked, setChecked] = useState(false);
  const [updateFlatlist, setUpdateFlatlist] = useState(false);
  //const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(true);
  useLayoutEffect(() => {
    props.navigation.setOptions({ title: "Groups" });
    const groupNamesRef = firestore.collection("groups");
    //sort by if the user is joined or not and than by last message

    const unsubscribe = groupNamesRef
      .orderBy("lastMessageSent.createdAt", "desc")
      .onSnapshot((element) => {
        let groupsWithoutUser = [];
        let groupsWithUser = [];
        element.forEach((doc) => {
          const tempData = doc.data();
          const dataToPush = {
            data: tempData,
            id: doc.id,
          };

          tempData.members.includes(auth.currentUser?.email)
            ? groupsWithUser.push(dataToPush)
            : groupsWithoutUser.push(dataToPush);
        });

        setGroupNames([...groupsWithUser, ...groupsWithoutUser]);
        setUpdateFlatlist(!updateFlatlist);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setUpdateFlatlist(!updateFlatlist);
  }, [groupNames]);

  const returnToOriginal = () => {
    setGroupDescription("");
    setGroupName("");
    setGroupPassword("");
    setChecked(false);
  };

  const handleGroupCreate = () => {
    const newData = {
      description: groupDescription,
      members: [auth.currentUser?.email],
      name: groupName,
      numberlimit: 5,
      owner: auth.currentUser?.email,
      password: groupPassword,
      lastMessageSent: {
        user: { _id: auth.currentUser?.email },
        text: "No previous message",
        createdAt: new Date(),
      },
    };

    firestore
      .collection("groups")
      .add(newData)
      .catch((error) =>
        console.error("Error at uploading a created group: ", error)
      );

    returnToOriginal();
    setShowAddOverlay(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: "90%" }}>
        {shouldLoad && (
          <FlatList
            key={updateFlatlist ? "forceUpdate" : "forceUpdate"}
            data={groupNames}
            renderItem={({ item }) => <OneGroup data={item} />}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>

      <View style={{ height: "10%" }}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.primary }]}
          onPress={() => {
            returnToOriginal();
            setShowAddOverlay(true);
          }}
        >
          <Text style={{ fontSize: 30 }}> + </Text>
        </TouchableOpacity>
      </View>

      <Overlay
        isVisible={showAddOverlay}
        onBackdropPress={() => {
          returnToOriginal();
          setShowAddOverlay(false);
        }}
      >
        <View
          style={{
            height: Dimensions.get("window").height * 0.5,
            width: Dimensions.get("window").width * 0.9,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 20, width: "20%", fontWeight: "bold" }}>
              Name:
            </Text>
            <TextInput
              style={{
                paddingHorizontal: 5,
                fontSize: 19,
                borderWidth: 1,
                borderRadius: 5,
                width: "80%",
              }}
              placeholder="Group name"
              value={groupName}
              onChangeText={(text) => setGroupName(text)}
              maxLength={50}
            />
          </View>

          <View style={{ paddingTop: 15 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Description:
            </Text>
            <ScrollView
              style={{
                borderWidth: 1,
                borderRadius: 5,
                maxHeight: Dimensions.get("window").height * 0.2,
              }}
            >
              <TextInput
                textAlignVertical="top"
                multiline={true}
                placeholder="Description"
                value={groupDescription}
                onChangeText={(text) => setGroupDescription(text)}
                style={{
                  fontSize: 18,
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                }}
                maxLength={512}
              />
            </ScrollView>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignContent: "center",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>Password </Text>
            <CheckBox checked={checked} onPress={() => setChecked(!checked)} />
          </View>

          {checked && (
            <View>
              <TextInput
                placeholder="Password"
                value={groupPassword}
                onChangeText={(text) => setGroupPassword(text)}
                style={{
                  paddingHorizontal: 5,
                  fontSize: 19,
                  borderWidth: 1,
                  borderRadius: 5,
                }}
                maxLength={32}
              />
            </View>
          )}

          <View
            style={{
              position: "absolute",
              flexDirection: "row",
              width: "100%",
              bottom: 0,
              paddingBottom: 10,
            }}
          >
            <TouchableOpacity
              style={{
                left: 10,
                backgroundColor: COLORS.primary,
                borderWidth: 1,
                borderRadius: 5,
                elevation: 4,
                alignItems: "center",
              }}
              onPress={() => {
                returnToOriginal();
                setShowAddOverlay(false);
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
                position: "absolute",
                right: 10,
                backgroundColor: COLORS.primary,
                borderWidth: 1,
                borderRadius: 5,
                elevation: 4,
                alignItems: "center",
              }}
              onPress={() => handleGroupCreate()}
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
                Create group
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Overlay>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0080ff",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    right: 10,
    elevation: 5,
  },
});
