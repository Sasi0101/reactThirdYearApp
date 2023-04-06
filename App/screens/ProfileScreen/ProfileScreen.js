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
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 10,
          flexDirection: "row",
          backgroundColor: `${COLORS.primary}80`,
          justifyContent: "space-between",
        }}
      >
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

        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingRight: 5,
          }}
        >
          {isEdit && (
            <TouchableOpacity
              onPress={chooseImage}
              style={[styles.touchableButton]}
            >
              <Text style={[styles.touchableText]}>Change profile picture</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {!isEdit && (
          <View style={{ paddingHorizontal: 5, flexDirection: "column" }}>
            <Text style={styles.textTitle}>Username:</Text>
            <Text style={styles.textCover}>{username}</Text>
            <Text style={styles.textTitle}>Email:</Text>
            <Text style={styles.textCover}>{email}</Text>
            <Text style={styles.textTitle}>Bio:</Text>
            {description.length > 0 ? (
              <ScrollView
                style={[
                  styles.textCover,
                  {
                    maxHeight: Dimensions.get("window").height * 0.2,
                  },
                ]}
              >
                <Text style={{ paddingBottom: 7 }}>{description}</Text>
              </ScrollView>
            ) : (
              <Text style={[styles.textCover]}>
                You have not written anything about yourself.
              </Text>
            )}

            <TouchableOpacity
              onPress={() => {
                if (username) setEditUsername(username);
                if (description) setEditDescription(description);
                setIsEdit(true);
              }}
              style={[styles.touchableButton, { marginTop: 10 }]}
            >
              <Text style={[styles.touchableText]}>Edit profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {isEdit && (
          <View
            style={{ flex: 1, flexDirection: "column", paddingHorizontal: 5 }}
          >
            <Text style={styles.textTitle}>Username:</Text>
            <TextInput
              style={styles.textCover}
              value={editUsername}
              placeholder="Username"
              placeholderTextColor={"gray"}
              onChangeText={(text) => setEditUsername(text)}
              maxLength={24}
            />

            <Text style={styles.textTitle}>Bio:</Text>
            <ScrollView
              style={[
                { maxHeight: Dimensions.get("window").height * 0.2 },
                styles.textCover,
              ]}
            >
              <TextInput
                style={{ paddingBottom: 7 }}
                value={editDescription}
                autoFocus={true}
                multiline={true}
                placeholder="Write something about yourself."
                placeholderTextColor={"gray"}
                onChangeText={(text) => setEditDescription(text)}
                maxLength={512}
              />
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: 20,
                paddingHorizontal: 5,
              }}
            >
              <TouchableOpacity
                style={styles.touchableButton}
                onPress={() => setIsEdit(false)}
              >
                <Text style={styles.touchableText}>Cancel edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.touchableButton}
                onPress={() => saveChanges()}
              >
                <Text style={styles.touchableText}>Save changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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
  textCover: {
    marginTop: 2,
    paddingVertical: 5,
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    elevation: 4,
    paddingHorizontal: 5,
  },
  touchableButton: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 5,
    elevation: 4,
    alignItems: "center",
  },
  touchableText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  textTitle: { fontWeight: "bold", fontSize: 18, marginTop: 7 },
});
