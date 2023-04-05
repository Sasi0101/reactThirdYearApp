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
  Platform,
} from "react-native";
import React, { useLayoutEffect, useState } from "react";
import * as ImagePickerExpo from "expo-image-picker";
import "firebase/storage";
import firebase from "firebase/app";
import { auth, firestore } from "../../firebase";
import * as FileSystem from "expo-file-system";
import { COLORS } from "../../constants/COLORS";

export default function ProfileScreen(props) {
  const [image, setImage] = useState(null);
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");

  const [isEdit, setIsEdit] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useLayoutEffect(() => {
    props.navigation.setOptions({ title: "Profile" });
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

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={[styles.coverImage, { backgroundColor: COLORS.primary }]} />

      <View style={[styles.avatarContainer]}>
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
          <TouchableOpacity
            onPress={chooseImage}
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
                fontSize: 20,
                paddingHorizontal: 8,
                paddingVertical: 5,
              }}
            >
              Change profile picture
            </Text>
          </TouchableOpacity>
        ) : (
          <Text>{username}</Text>
        )}
      </View>

      {isEdit ? (
        <View>
          <View>
            <View style={{ paddingTop: 10 }}>
              <Text style={{ fontWeight: "bold" }}>Username:</Text>
              <TextInput
                style={[
                  styles.infoValue,
                  {
                    paddingVertical: 5,
                    backgroundColor: "white",
                    borderWidth: 1,
                    borderRadius: 5,
                    elevation: 4,
                    paddingHorizontal: 5,
                  },
                ]}
                value={editUsername}
                placeholder="Username"
                onChangeText={(text) => setEditUsername(text)}
                maxLength={24}
              />
            </View>
            <View style={{ paddingTop: 10 }}>
              <Text style={{ fontWeight: "bold" }}>Email:</Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    paddingVertical: 5,
                    backgroundColor: "white",
                    borderWidth: 1,
                    borderRadius: 5,
                    elevation: 4,
                    paddingHorizontal: 5,
                  },
                ]}
              >
                {email}
              </Text>
            </View>
            <Text style={[{ fontWeight: "bold" }, { paddingTop: 10 }]}>
              Bio:
            </Text>
            <KeyboardAvoidingView behavior="height">
              <TextInput
                style={[
                  styles.infoValue,
                  {
                    paddingVertical: 5,
                    backgroundColor: "white",
                    borderWidth: 1,
                    borderRadius: 5,
                    elevation: 4,
                    paddingHorizontal: 5,
                  },
                ]}
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
              paddingTop: 10,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => setIsEdit(false)}
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
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                }}
              >
                Cancel edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => saveChanges()}
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
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                }}
              >
                Save changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <View>
            <View>
              <Text style={{ fontWeight: "bold" }}>Email:</Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    paddingVertical: 5,
                    backgroundColor: "white",
                    borderWidth: 1,
                    borderRadius: 5,
                    elevation: 4,
                    paddingHorizontal: 5,
                  },
                ]}
              >
                {email}
              </Text>
            </View>
            <View>
              <Text style={{ fontWeight: "bold" }}>Bio:</Text>
              {description.length > 0 ? (
                <ScrollView
                  style={{ maxHeight: Dimensions.get("window").height * 0.3 }}
                >
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        paddingVertical: 5,
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderRadius: 5,
                        elevation: 4,
                        paddingHorizontal: 5,
                      },
                    ]}
                    numberOfLines={null}
                  >
                    {description}
                  </Text>
                </ScrollView>
              ) : (
                <Text
                  style={[
                    styles.infoValue,
                    {
                      backgroundColor: "white",
                      borderWidth: 1,
                      borderRadius: 5,
                      elevation: 4,
                      paddingHorizontal: 5,
                    },
                  ]}
                >
                  You do not have a bio yet!
                </Text>
              )}
            </View>
          </View>
          <View>
            <View style={{ paddingTop: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  if (username) setEditUsername(username);
                  if (description) setEditDescription(description);
                  setIsEdit(true);
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
                    paddingHorizontal: 8,
                    paddingVertical: 5,
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
  infoValue: {
    marginTop: 5,
  },
});
