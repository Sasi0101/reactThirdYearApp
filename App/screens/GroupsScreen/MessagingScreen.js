import { StyleSheet, Text, View, FlatList } from "react-native";
import React from "react";
import { useState, useEffect } from "react";
import { auth, firestore } from "../../firebase";
import OneGroup from "./OneGroup";

export default function MessagingScreen() {
  const [groupNames, setGroupNames] = useState(null);

  useEffect(() => {
    const groupNamesRef = firestore.collection("groups");

    groupNamesRef.onSnapshot((element) => {
      let groups = [];
      element.forEach((doc) => {
        const dataToPush = {
          data: doc.data(),
          id: doc.id,
        };
        groups.push(dataToPush);
      });
      setGroupNames(groups);
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: "90%" }}>
        <FlatList
          data={groupNames}
          renderItem={({ item }) => <OneGroup data={item} />}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>

      <View style={{ height: "10%" }}>
        <Text> Hello </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
