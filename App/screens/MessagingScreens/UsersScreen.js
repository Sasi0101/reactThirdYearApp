import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Dimensions,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  DeviceEventEmitter,
  Image,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { React, useState, useLayoutEffect } from "react";
import OneUser from "./OneUser";
import "firebase/storage";
import firebase from "firebase/app";
import { auth, firestore } from "../../firebase";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function UsersScreen(props) {
  const [usersToPrint, setUsersToPrint] = useState([]);
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [filteredContacts, setFilteredContacts] = useState();

  const [isShowingUserProfile, setIsShowingUserProfile] = useState(false);

  const [image, setImage] = useState(null);
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");

  useLayoutEffect(() => {
    setIsShowingUserProfile(false);
    let unsubscribe;
    setSearchText("");

    async function fetchData() {
      unsubscribe = await firestore
        .collection("users")
        .onSnapshot((element) => {
          let userInfo;
          let allUsers = [];
          //find the current user and put the rest in the users
          element.forEach((doc) => {
            if (doc.data().email == auth.currentUser?.email) {
              userInfo = doc.data();
            } else {
              allUsers.push({
                email: doc.data().email,
                username: doc.data().username,
              });
            }
          });

          let finalData = [];
          if (userInfo.usersTalkedTo && userInfo.usersTalkedTo.length !== 0) {
            const idsToFilter = userInfo.usersTalkedTo;
            const filteredData = allUsers.filter((element) => {
              for (const obj of idsToFilter) {
                if (obj.email === element.email) {
                  return false;
                }
              }
              return true;
            });

            finalData = [...userInfo.usersTalkedTo, ...filteredData];
          } else {
            finalData = allUsers;
          }

          setUsersToPrint(finalData);
          setFilteredContacts(finalData);
        });
    }

    fetchData();

    props.navigation.setOptions({ title: "Private chat messages" });
    DeviceEventEmitter.addListener("userProfile", (userData) => {
      loadUser(userData);
    });

    props.navigation.setOptions({ headerShown: false });

    /*
    props.navigation.setOptions({
      header: () => (
        <View
          style={{
            width: Dimensions.get("window").width,
            paddingHorizontal: Dimensions.get("window").width * 0.05,
            flexDirection: "row",
            paddingTop: Dimensions.get("window").height * 0.05,
            alignItems: "center",
          }}
        >
          <View style={{ width: "10%" }}>
            <TouchableOpacity onPress={() => handleOpenDrawer()}>
              <Icon name="arrow-expand-right" size={25} color={"black"} />
            </TouchableOpacity>
          </View>
          <View style={{ width: "90%" }}>
            <TextInput
              placeholder="Search"
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
              //onChangeText={(text) => handleSearch(text)}
              style={styles.searchInput}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      ), 
    });*/

    return () => {
      DeviceEventEmitter.removeAllListeners("userProfile");
      unsubscribe();
    };
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = usersToPrint.filter((item) => {
      return (
        item.username.toLowerCase().includes(text.toLowerCase()) ||
        item.email.toLowerCase().includes(text.toLowerCase())
      );
    });

    setFilteredContacts(filtered);
  };

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const loadUser = async (userData) => {
    await firestore
      .collection("users")
      .doc(userData.email)
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

    const url = "images/" + userData.email + ".png";
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

    setIsShowingUserProfile(true);
  };

  return (
    <>
      <SafeAreaView
        style={{
          justifyContent: "center",
          backgroundColor: "white",
          width: Dimensions.get("window").width,
          paddingHorizontal: Dimensions.get("window").width * 0.05,
          flexDirection: "row",
          paddingTop: Dimensions.get("window").height * 0.05,
          alignItems: "center",
          paddingBottom: Dimensions.get("window").height * 0.02,
        }}
      >
        <View style={{ width: "10%" }}>
          <TouchableOpacity onPress={() => handleOpenDrawer()}>
            <Icon name="arrow-expand-right" size={25} color={"black"} />
          </TouchableOpacity>
        </View>
        <View style={{ width: "90%" }}>
          <TextInput
            placeholder="Search"
            value={searchText}
            onChangeText={(text) => handleSearch(text)}
            style={styles.searchInput}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </SafeAreaView>

      {isShowingUserProfile ? (
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

            <Text style={[styles.name, styles.textWithShadow]}>{username}</Text>
          </View>

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
                  <Text style={styles.infoValue}>
                    You do not have a bio yet!
                  </Text>
                )}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ paddingTop: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    setIsShowingUserProfile(false);
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
                    Close profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView style={{ flex: 11 }}>
          <View style={{ flex: 11 }}>
            {usersToPrint.length !== 0 && (
              <FlatList
                data={filteredContacts}
                renderItem={({ item }) => (
                  <OneUser username={item.username} email={item.email} />
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            )}
          </View>
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    backgroundColor: "#20B2AA",
    color: "black",
    height: 40,
    borderRadius: 10,
    paddingLeft: 10,
  },
  image: {
    width: 100,
    height: 100,
  },
  icon: {
    width: 20,
    height: 20,
    alignSelf: "center",
    marginRight: 10,
  },
  box: {
    padding: 20,
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: "white",
    flexDirection: "row",
  },
  boxContent: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    marginLeft: 10,
  },
  description: {
    fontSize: 15,
    color: "#646464",
  },
  title: {
    fontSize: 18,
    color: "#151515",
  },
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
