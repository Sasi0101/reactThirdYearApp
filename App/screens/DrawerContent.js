import React, { useEffect } from "react";
import { useState } from "react";
import { auth, firestore } from "../firebase";
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Avatar, Title, Caption, Drawer, Text } from "react-native-paper";
import "firebase/storage";
import firebase from "firebase/app";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Tooltip } from "@rneui/themed";
import { COLORS } from "../constants/COLORS";

export function DrawerContent(props) {
  const [isDarkTheme, setIsDarkTheme] = useState("");
  const navigation = useNavigation();
  const [userName, setUsername] = useState("");
  const [imageURL, setImageURL] = useState(null);
  const [doesUserHaveAvatar, setDoesUserHaveAvatar] = useState(false);
  const [isGroupToolTipVisible, setIsGroupTooltipVisible] = useState(false);
  const [isUserTooltipVisible, setIsUserTooltipVisible] = useState(false);
  const [isQuestionsTooltipVisible, setIsQuestionTooltipVisible] =
    useState(false);
  const [isCalendarTooltipVisible, setIsCalendarTooltipVisible] =
    useState(false);
  const [isFlashcardTooltipVisible, setIsFlashcardTooltipVisible] =
    useState(false);
  const [isTodoTooltipVisible, setIsTodoTooltipVisible] = useState(false);
  const [isProfileTooltipVisible, setIsProfileTooltipVisible] = useState(false);
  const [isNotificationTooltipVisible, setIsNotificationTooltipVisible] =
    useState(false);

  const [userHasNotifications, setUserHasNotifications] = useState(false);

  useEffect(() => {
    setUsername(props.data.username);

    const url = "images/" + auth.currentUser?.email + ".png";
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(url);

    imageRef
      .getMetadata()
      .then((metadata) => {
        //console.log("Image metadata:", metadata);
        imageRef.getDownloadURL().then((url) => {
          setDoesUserHaveAvatar(true);
          setImageURL(url);
        });
      })
      .catch((error) => {
        if (error.code === "storage/object-not-found") {
          console.log("Image does not exist");
        } else {
          console.error("Error getting image metadata:", error);
        }
      });

    const unsubscribe = firestore
      .collection("users")
      .doc(auth.currentUser?.email)
      .onSnapshot((doc) => {
        const data = doc.data();
        if (data.notifications.length) {
          data.notifications.length < 1
            ? setUserHasNotifications(false)
            : setUserHasNotifications(true);
        } else {
          setUserHasNotifications(false);
        }
        //setUpdateFlatlist(!updateFlatlist);
      });

    return () => {
      unsubscribe();
    };
  }, [props.data]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const CustomDrawerItem = ({ iconName, label, onPress, onLongPress }) => (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
      <View style={{ flexDirection: "row", paddingLeft: 20 }}>
        <Icon name={iconName} size={25} />
        <Text
          style={{
            paddingLeft: 30,
            alignSelf: "center",
            fontSize: 16,
            fontWeight: "600",
            color: "#000",
          }}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View
            style={[
              styles.userInfoSection,
              { backgroundColor: COLORS.primary, borderRadius: 5, flex: 4 },
            ]}
          >
            <View style={{ flexDirection: "row", marginTop: 15, flex: 4 }}>
              <View style={{ flex: 1, paddingBottom: 10 }}>
                {doesUserHaveAvatar && (
                  <Avatar.Image
                    source={{
                      uri: imageURL,
                    }}
                    size={70}
                  />
                )}

                {!doesUserHaveAvatar && (
                  <Avatar.Image
                    source={require("../assets/anonymous-user.png")}
                    size={70}
                  />
                )}
              </View>
              <View
                style={{
                  marginLeft: 15,
                  flexDirection: "column",
                  flex: 3,
                  marginRight: 5,
                }}
              >
                <Title style={[styles.title]}>{userName}</Title>
                <Caption style={styles.caption}>
                  {auth.currentUser?.email}
                </Caption>
              </View>
            </View>
          </View>

          <Drawer.Section style={styles.drawerSection}>
            <Tooltip
              width={Dimensions.get("window").width * 0.9}
              height={100}
              popover={
                <Text>
                  You can join or create group and ask for help or help others
                  with their questions. Please behave according to the rules.
                </Text>
              }
              visible={isGroupToolTipVisible}
              containerStyle={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CustomDrawerItem
                iconName="account-group"
                label="Groups"
                onPress={() => {
                  props.navigation.navigate("MessagingScreen");
                }}
                onLongPress={() => {
                  setIsGroupTooltipVisible(true);
                  setTimeout(() => {
                    setIsGroupTooltipVisible(false);
                  }, 3000);
                }}
              />
            </Tooltip>
            <View style={{ paddingTop: 25 }} />
            <Tooltip
              visible={isUserTooltipVisible}
              width={Dimensions.get("window").width * 0.9}
              height={100}
              popover={
                <Text>
                  You can talk with others and view their profiles by clicking
                  on their profile pictures.
                </Text>
              }
              containerStyle={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CustomDrawerItem
                iconName="chat"
                label="Users"
                onPress={() => {
                  props.navigation.navigate("UsersScreen");
                }}
                onLongPress={() => {
                  setIsUserTooltipVisible(true);
                  setTimeout(() => {
                    setIsUserTooltipVisible(false);
                  }, 3000);
                }}
              />
            </Tooltip>
            <View style={{ paddingTop: 25 }} />
            <Tooltip
              visible={isQuestionsTooltipVisible}
              width={Dimensions.get("window").width * 0.9}
              height={100}
              popover={
                <Text>
                  You can ask a question or answer an already existing question.
                </Text>
              }
              containerStyle={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CustomDrawerItem
                iconName="comment"
                label="Questions"
                onPress={() => {
                  props.navigation.navigate("QuestionsScreen");
                }}
                onLongPress={() => {
                  setIsQuestionTooltipVisible(true);
                  setTimeout(() => {
                    setIsQuestionTooltipVisible(false);
                  }, 3000);
                }}
              />
            </Tooltip>
            <View style={{ paddingTop: 25 }} />
            <Tooltip
              visible={isCalendarTooltipVisible}
              width={Dimensions.get("window").width * 0.9}
              height={100}
              popover={
                <Text>View your events and add new ones to your day.</Text>
              }
              containerStyle={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CustomDrawerItem
                iconName="calendar-month"
                label="Calendar"
                onPress={() => {
                  props.navigation.navigate("CalendarScreen");
                }}
                onLongPress={() => {
                  setIsCalendarTooltipVisible(true);
                  setTimeout(() => {
                    setIsCalendarTooltipVisible(false);
                  }, 3000);
                }}
              />
            </Tooltip>
            <View style={{ paddingTop: 25 }} />
            <Tooltip
              visible={isFlashcardTooltipVisible}
              width={Dimensions.get("window").width * 0.9}
              height={100}
              popover={
                <Text>
                  Create decks and add cards to those decks to study. You can
                  view already uploaded decks and download them.
                </Text>
              }
              containerStyle={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CustomDrawerItem
                iconName="school"
                label="Flashcards"
                onPress={() => {
                  props.navigation.navigate("FlashcardsScreen");
                }}
                onLongPress={() => {
                  setIsFlashcardTooltipVisible(true);
                  setTimeout(() => {
                    setIsFlashcardTooltipVisible(false);
                  }, 3000);
                }}
              />
            </Tooltip>
            <View style={{ paddingTop: 25 }} />
            <Tooltip
              visible={isTodoTooltipVisible}
              width={Dimensions.get("window").width * 0.9}
              height={100}
              popover={
                <Text>
                  Add tasks that you plan to do that day. You can change a tasks
                  state by clicking on it.
                </Text>
              }
              containerStyle={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CustomDrawerItem
                iconName="calendar-check"
                label="To-do list"
                onPress={() => {
                  props.navigation.navigate("TodoScreen");
                }}
                onLongPress={() => {
                  setIsTodoTooltipVisible(true);
                  setTimeout(() => {
                    setIsTodoTooltipVisible(false);
                  }, 3000);
                }}
              />
            </Tooltip>

            <View style={{ paddingTop: 25 }} />
            <Tooltip
              visible={isProfileTooltipVisible}
              width={Dimensions.get("window").width * 0.9}
              height={100}
              popover={
                <Text>
                  View and update your profile. Others can see your profile as
                  well.
                </Text>
              }
              containerStyle={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CustomDrawerItem
                iconName="account-outline"
                label="Profile"
                onPress={() => {
                  props.navigation.navigate("ProfileScreen");
                }}
                onLongPress={() => {
                  setIsProfileTooltipVisible(true);
                  setTimeout(() => {
                    setIsProfileTooltipVisible(false);
                  }, 3000);
                }}
              />
            </Tooltip>

            <View style={{ paddingTop: 25 }} />
            <Tooltip
              visible={isNotificationTooltipVisible}
              width={Dimensions.get("window").width * 0.9}
              height={100}
              popover={
                <Text>
                  You can view if someone asks you for permission to join a
                  group created by you.
                </Text>
              }
              containerStyle={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CustomDrawerItem
                iconName={userHasNotifications ? "bell-badge" : "bell"}
                label="Notifications"
                onPress={() => {
                  props.navigation.navigate("NotificationScreen");
                }}
                onLongPress={() => {
                  setIsNotificationTooltipVisible(true);
                  setTimeout(() => {
                    setIsNotificationTooltipVisible(false);
                  }, 3000);
                }}
              />
            </Tooltip>
            <View style={{ paddingBottom: 5 }} />
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>

      <DrawerItem
        style={styles.bottomDrawerSection}
        icon={(color, size) => (
          <Icon name="exit-to-app" color={color} size={25} />
        )}
        label="Sign out"
        onPress={() => {
          auth
            .signOut()
            .then(() => {
              navigation.navigate("Login");
            })
            .catch((error) => console.error("Error at signing out: ", error));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 15,
    marginTop: 3,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  parahgraph: {
    fontWeight: "bold",
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 25,
    flexDirection: "column",
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: "#f4f4f4",
    borderTopWidth: 2,
  },
  preference: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

/* 
          <Drawer.Section title="Preferences">
            <TouchableRipple
              onPress={() => {
                toggleTheme();
              }}
            >
              <View style={styles.preference}>
                <Text> Dark theme</Text>
                <View pointerEvents="none">
                  <Switch value={isDarkTheme} />
                </View>
              </View>
            </TouchableRipple>
          </Drawer.Section>

*/
