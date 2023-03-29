import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Image,
  SafeAreaView,
} from "react-native";
import React, { useLayoutEffect, useState } from "react";
import * as ImagePickerExpo from "expo-image-picker";
import "firebase/storage";
import firebase from "firebase/app";
import { auth, firestore } from "../../firebase";
import { Avatar } from "react-native-paper";
import * as FileSystem from "expo-file-system";

export default function ProfileScreen() {
  const [image, setImage] = useState(null);
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");

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
          let temp = doc.data();
          if (temp.username) setUsername(temp.username);
          if (temp.description) setDescription(temp.description);
          if (temp.email) setEmail(temp.email);
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
      quality: 0.8,
      base64: true,
      selectionLimit: 1,
    });

    //handle error messages and cancel

    if (!result.canceled) {
      const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
      const fileSizeInMB = fileInfo.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        Alert.alert(
          "Image too big",
          "Image is too big please select a lower resolution image."
        );
      } else {
        setImage(result.assets[0].uri);
      }
    }
  };
  /*
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
        <Avatar.Image
          source={
            image
              ? {
                  uri: image,
                }
              : require("../../assets/anonymous-user.png")
          }
          size={Dimensions.get("window").height * 0.15}
        />

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
  ); */

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.coverImage, { backgroundColor: "#20B2AA" }]} />

      <View style={styles.avatarContainer}>
        <Image
          source={
            image
              ? {
                  uri: image,
                }
              : require("../../assets/anonymous-user.png")
          }
          style={styles.avatar}
        />
        {isEdit ? (
          <TouchableOpacity onPress={chooseImage}>
            <Text style={{ fontSize: 20 }}>Change profile picture</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.name, styles.textWithShadow]}>{username}</Text>
        )}
      </View>

      {isEdit ? (
        <View style={{ flex: 8 }}>
          <View style={[styles.content, { flex: 7 }]}>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Username:</Text>
              <TextInput
                style={styles.infoValue}
                value={editUsername}
                placeholder="Username"
                onChangeText={(text) => setEditUsername(text)}
                maxLength={24}
              />
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>

            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior="position"
              keyboardVerticalOffset={10}
            >
              <Text style={styles.infoLabel}>Bio:</Text>
              <TextInput
                style={styles.infoValue}
                numberOfLines={5}
                multiline={true}
                textAlignVertical="top"
                value={editDescription}
                placeholder="Write something about yourself."
                onChangeText={(text) => setEditDescription(text)}
                maxLength={512}
              />
            </KeyboardAvoidingView>
          </View>

          <View
            style={{
              flex: 1,
              paddingTop: 10,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
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
      ) : (
        <View style={{ flex: 8 }}>
          <View style={[styles.content, { flex: 7 }]}>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Bio:</Text>
              {description.length > 0 ? (
                <ScrollView
                  style={{ maxHeight: Dimensions.get("window").height * 0.3 }}
                >
                  <Text style={styles.infoValue} numberOfLines={null}>
                    {description}
                  </Text>
                </ScrollView>
              ) : (
                <Text style={styles.infoValue}>You do not have a bio yet!</Text>
              )}
            </View>
          </View>
          <View style={{ flex: 1 }}>
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
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  coverImage: {
    height: 200,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: "white",
  },
  content: {
    marginTop: 20,
  },
  infoContainer: {
    marginTop: 20,
  },
  infoLabel: {
    fontWeight: "bold",
  },
  infoValue: {
    marginTop: 5,
  },
});
