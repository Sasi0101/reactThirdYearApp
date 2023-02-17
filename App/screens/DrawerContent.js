import React, { useEffect } from "react";
import { useState, useLayoutEffect, useCallback } from "react";
import { auth, firestore } from "../firebase";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import {
  Avatar,
  Title,
  Caption,
  Drawer,
  Text,
  TouchableRipple,
  Switch,
} from "react-native-paper";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export function DrawerContent(props) {
  const [isDarkTheme, setIsDarkTheme] = useState("");
  const navigation = useNavigation();
  const [userName, setUsername] = useState("");

  useEffect(() => {
    console.log("loaded username");
    setUsername(props.data.username);
  }, [props.data]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View
            style={[
              styles.userInfoSection,
              { backgroundColor: "white", borderRadius: 5 },
            ]}
          >
            <View style={{ flexDirection: "row", marginTop: 15 }}>
              <Avatar.Image
                source={{ uri: "https://picsum.photos/200" }}
                size={50}
              />
              <View style={{ marginLeft: 15, flexDirection: "column" }}>
                <Title style={styles.title}> {userName} </Title>
                <Caption style={styles.caption}>
                  {auth.currentUser?.email}
                </Caption>
              </View>
            </View>
          </View>

          <Drawer.Section style={styles.drawerSection}>
            <DrawerItem
              icon={(color, size) => (
                <Icon name="home-outline" color={color} size={size} />
              )}
              label="Messaging Screen"
              onPress={() => {
                props.navigation.navigate("MessagingScreen");
              }}
            />

            <DrawerItem
              icon={(color, size) => (
                <Icon name="home-outline" color={color} size={size} />
              )}
              label="Users screen"
              onPress={() => {
                props.navigation.navigate("UsersScreen");
              }}
            />

            <DrawerItem
              icon={(color, size) => (
                <Icon name="home-outline" color={color} size={size} />
              )}
              label="Calendar"
              onPress={() => {
                props.navigation.navigate("CalendarScreen");
              }}
            />

            <DrawerItem
              icon={(color, size) => (
                <Icon name="home-outline" color={color} size={size} />
              )}
              label="Flashcards"
              onPress={() => {
                props.navigation.navigate("FlashcardsScreen");
              }}
            />

            <DrawerItem
              icon={(color, size) => (
                <Icon name="home-outline" color={color} size={size} />
              )}
              label="Tasks"
              onPress={() => {
                props.navigation.navigate("TodoScreen");
              }}
            />

            <DrawerItem
              icon={(color, size) => (
                <Icon name="account-outline" color={color} size={size} />
              )}
              label="Profile"
              onPress={() => {
                props.navigation.navigate("ProfileScreen");
              }}
            />
          </Drawer.Section>

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
        </View>
      </DrawerContentScrollView>

      <DrawerItem
        style={styles.bottomDrawerSection}
        icon={(color, size) => (
          <Icon name="exit-to-app" color={color} size={size} />
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
