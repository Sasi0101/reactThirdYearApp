import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import React, { useLayoutEffect, useState } from "react";
import * as ImagePickerExpo from "expo-image-picker";
import "firebase/storage";
import firebase from "firebase/app";
import { auth, firestore } from "../../firebase";
import { Avatar } from "react-native-paper";

export default function ProfileScreen() {
  const [image, setImage] = useState(null);
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const [editUsername, setEditUsername] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useLayoutEffect(() => {
    async function fetchData() {
      await firestore
        .collection("users")
        .doc(auth.currentUser?.email)
        .get()
        .then((doc) => {
          if (doc.data().username) setUsername(doc.data().username);
          if (doc.data().description) setDescription(doc.data().description);
        })
        .catch((error) => {
          console.error(
            "Error in calling for the data for the profile screen: ",
            error
          );
        });
    }

    const url = "images/" + auth.currentUser?.email + ".png";
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(url);

    imageRef
      .getDownloadURL()
      .then((url) => {
        setImage(url);
      })
      .catch(() => {
        console.log("no profile picture yet");
      });

    fetchData();
  }, []);

  async function UploadPicture(uri) {
    const storage = firebase.storage();
    const imageName = auth.currentUser?.email + ".png";
    const imageRef = storage.ref().child(`images/${imageName}`);

    const response = await fetch(uri);
    const blob = await response.blob();
    const snapshot = await imageRef.put(blob);
    console.log("Image added");
  }

  const saveChanges = async () => {
    await firestore
      .collection("users")
      .doc(auth.currentUser?.email)
      .update({
        username: editUsername,
        description: editDescription,
      })
      .then(() => {
        setUsername(editUsername);
        setDescription(editDescription);
        setIsEdit(false);
      })
      .catch((error) =>
        console.error("Error when updating after edit in profile: ", error)
      );

    if (image) UploadPicture(image);
  };

  const chooseImage = async () => {
    let result = await ImagePickerExpo.launchImageLibraryAsync({
      mediaTypes: ImagePickerExpo.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
      selectionLimit: 1,
    });

    //handle error messages and cancel

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 6, alignItems: "center", justifyContent: "center" }}
    >
      <View
        style={{
          width: Dimensions.get("window").width,
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 10,
        }}
      >
        {image && (
          <Avatar.Image
            source={{
              uri: image,
            }}
            size={Dimensions.get("window").height * 0.15}
          />
        )}

        {!image && (
          <Avatar.Image
            source={require("../../assets/anonymous-user.png")}
            size={Dimensions.get("window").height * 0.15}
          />
        )}
        {isEdit && (
          <TouchableOpacity
            onPress={chooseImage}
            style={{ paddingLeft: 15, alignSelf: "flex-end" }}
          >
            <Text style={{ fontSize: 20 }}>Change profile picture</Text>
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          flex: 4,
          width: Dimensions.get("window").width,
          flexDirection: "column",
        }}
      >
        {!isEdit && (
          <View style={{ paddingHorizontal: 10, paddingTop: 20 }}>
            {username && (
              <View style={{ flexDirection: "row" }}>
                <Text style={{ fontSize: 20 }}>Username: </Text>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                  {username}
                </Text>
              </View>
            )}

            {description && (
              <View style={{}}>
                <Text style={{ fontSize: 20 }}>Description: </Text>
                <ScrollView
                  style={{
                    maxHeight: Dimensions.get("window").height * 0.4,
                    backgroundColor: "#FFFDD0",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      //backgroundColor: "#FFFDD0",
                      //flexGrow: 1, // Allow the Text component to fill the available space
                      //paddingHorizontal: 10,
                      //paddingVertical: 5,
                    }}
                    numberOfLines={null}
                  >
                    {description}
                  </Text>
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {isEdit && (
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingTop: 10,
              }}
            >
              <Text style={{ paddingLeft: 10, fontSize: 20 }}>Username: </Text>
              <TextInput
                style={{
                  fontSize: 20,
                  borderBottomWidth: 1,
                  paddingHorizontal: 10,
                  paddingVertical: 0,
                }}
                value={editUsername}
                placeholder="Username"
                onChangeText={(text) => setEditUsername(text)}
                maxLength={24}
              />
            </View>

            <View
              style={{
                paddingTop: 10,
              }}
            >
              <Text
                style={{ fontSize: 20, paddingBottom: 10, paddingLeft: 10 }}
              >
                Description:
              </Text>
              <View
                style={{
                  paddingHorizontal: Dimensions.get("window").width * 0.03,
                }}
              >
                <TextInput
                  style={{
                    paddingLeft: 10,
                    fontSize: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 0,
                    backgroundColor: "#FFFDD0",
                    maxHeight: Dimensions.get("window").height * 0.2,
                  }}
                  numberOfLines={5}
                  multiline={true}
                  textAlignVertical="top"
                  value={editDescription}
                  placeholder="Write a description about yourself"
                  onChangeText={(text) => setEditDescription(text)}
                  maxLength={512}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        {!isEdit && (
          <View style={{ paddingTop: 10 }}>
            <TouchableOpacity
              onPress={() => {
                if (username) setEditUsername(username);
                if (description) setEditDescription(description);
                setIsEdit(true);
              }}
              style={{
                borderWidth: 1,
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 5,
              }}
            >
              <Text
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: 5,
                }}
              >
                Edit profile
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isEdit && (
          <View style={{ paddingTop: 10, flexDirection: "row" }}>
            <View>
              <TouchableOpacity
                onPress={() => setIsEdit(false)}
                style={{
                  borderWidth: 1,
                  alignContent: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 5,
                }}
              >
                <Text
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 5,
                  }}
                >
                  Cancel edit
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ paddingLeft: 50 }}>
              <TouchableOpacity
                onPress={() => saveChanges()}
                style={{
                  borderWidth: 1,
                  alignContent: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 5,
                }}
              >
                <Text
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 5,
                  }}
                >
                  Save changes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({});
