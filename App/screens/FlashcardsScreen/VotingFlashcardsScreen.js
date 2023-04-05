import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  DeviceEventEmitter,
  SafeAreaView,
} from "react-native";
import React, { useState, useLayoutEffect } from "react";
import { auth, firestore } from "../../firebase";
import OneFlashcard from "./OneFlashcard";
import { COLORS } from "../../constants/COLORS";

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
    <SafeAreaView
      style={{
        height: Dimensions.get("window").height,
        width: Dimensions.get("window").width,
        flex: 18,
      }}
    >
      <View style={{ flex: 16.5, paddingHorizontal: 10, paddingTop: 10 }}>
        <FlatList
          key={updateFlatlist ? "forceUpdate" : "noUpdate"}
          data={data}
          renderItem={({ item }) => <OneFlashcard data={item} />}
        />
      </View>
      <View style={{ flex: 1.5, alignItems: "center" }}>
        <View style={{ width: 140 }}>
          <TouchableOpacity
            onPress={() => {
              DeviceEventEmitter.emit("closeFlashcardsRank", {});
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
                paddingHorizontal: 5,
                paddingVertical: 5,
              }}
            >
              Close page
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
