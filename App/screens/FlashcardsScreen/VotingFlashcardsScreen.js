import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  DeviceEventEmitter,
} from "react-native";
import React, { useState, useLayoutEffect } from "react";
import { auth, firestore } from "../../firebase";
import OneFlashcard from "./OneFlashcard";

export default function VotingFlashcardsScreen() {
  const [data, setData] = useState(null);
  const [updateFlatlist, setUpdateFlatlist] = useState(false);

  useLayoutEffect(() => {
    const unsubscribe = firestore
      .collection("flashcards")
      .orderBy("rating", "desc")
      .onSnapshot((snapshot) => {
        const tempData = [];
        snapshot.forEach((doc) => {
          const toSubmit = { id: doc.id, data: doc.data() };
          tempData.push(toSubmit);
        });
        setData(tempData);
        setUpdateFlatlist(false);
        setUpdateFlatlist(true);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View
      style={{
        height: Dimensions.get("window").height,
        width: Dimensions.get("window").width,
        flex: 19,
      }}
    >
      <View style={{ flex: 18, paddingHorizontal: 10 }}>
        <FlatList
          key={updateFlatlist ? "forceUpdate" : "noUpdate"}
          data={data}
          renderItem={({ item }) => <OneFlashcard data={item} />}
        />
      </View>
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => {
            DeviceEventEmitter.emit("closeFlashcardsRank", {});
          }}
          style={{ alignItems: "center" }}
        >
          <Text> Close page</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
