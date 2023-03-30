import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import React, { useLayoutEffect } from "react";
import { CheckBox } from "@rneui/themed";
//import { Checkbox } from "@react-native-community/checkbox";
import { useState, useEffect } from "react";
import { auth, firestore } from "../../firebase";
import OneGroup from "./OneGroup";
import { Overlay } from "@rneui/themed";

export default function MessagingScreen(props) {
  const [groupNames, setGroupNames] = useState([]);
  const [showAddOverlay, setShowAddOverlay] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupPassword, setGroupPassword] = useState("");
  const [checked, setChecked] = useState(false);
  const [updateFlatlist, setUpdateFlatlist] = useState(false);

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
      numberlimit: 8,
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
          style={styles.button}
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
            <Text style={{ fontSize: 20 }}>Name: </Text>
            <TextInput
              style={{ paddingLeft: 15, fontSize: 19 }}
              placeholder="Group name"
              value={groupName}
              onChangeText={(text) => setGroupName(text)}
              maxLength={50}
            />
          </View>

          <View style={{ paddingTop: 15 }}>
            <Text style={{ fontSize: 20 }}>Description: </Text>
            <TextInput
              textAlignVertical="top"
              multiline
              numberOfLines={4}
              placeholder="Description"
              value={groupDescription}
              onChangeText={(text) => setGroupDescription(text)}
              style={{ backgroundColor: "#E8E4C9", fontSize: 19 }}
              maxLength={500}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignContent: "center",
            }}
          >
            <Text style={{ fontSize: 20 }}>Password </Text>
            <CheckBox checked={checked} onPress={() => setChecked(!checked)} />
          </View>

          {checked && (
            <View>
              <TextInput
                placeholder="Password"
                value={groupPassword}
                onChangeText={(text) => setGroupPassword(text)}
                style={{ backgroundColor: "#E8E4C9", fontSize: 19 }}
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
              style={{ left: 10, borderWidth: 1, borderRadius: 5 }}
              onPress={() => {
                returnToOriginal();
                setShowAddOverlay(false);
              }}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                position: "absolute",
                right: 10,
                borderWidth: 1,
                borderRadius: 5,
              }}
              onPress={() => handleGroupCreate()}
            >
              <Text>Create group</Text>
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
