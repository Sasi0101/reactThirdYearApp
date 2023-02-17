import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const NEW_PER_DAY = 20;

export default function OneDeck(props) {
  const navigation = useNavigation();

  const [newCards, setNewCards] = useState([]);
  const [againCards, setAgainCards] = useState([]);
  const [reviewCards, setReviewCards] = useState([]);

  useLayoutEffect(() => {
    const loadData = async () => {
      let newCardsNotParsed = await AsyncStorage.getItem(
        props.deckName + "new"
      );

      if (newCardsNotParsed !== null) {
        let newCardsParsed = JSON.parse(newCardsNotParsed);
        setNewCards(newCardsParsed.slice(0, NEW_PER_DAY));
      }

      let againCardsNotParsed = await AsyncStorage.getItem(
        props.deckName + "again"
      );
      if (againCardsNotParsed !== null)
        setAgainCards(JSON.parse(againCardsNotParsed));

      let reviewCardsNotParsed = await AsyncStorage.getItem(
        props.deckName + "review"
      );
      if (reviewCardsNotParsed !== null) {
        let timeReview = JSON.parse(reviewCardsNotParsed);
        let tempReviewCards = [];

        for (let i = 0; i < timeReview.length; i++) {
          if (timeReview[i].nextTime <= new Date().getTime()) {
            tempReviewCards.push(timeReview[i]);
          }
        }

        setReviewCards(tempReviewCards);
      }
    };

    loadData();
  }, []);

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("StudyPageScreen");
        console.log("Should navigate to another page.");
      }}
    >
      <View style={styles.boxContainer}>
        <Text style={{ fontWeight: "600", fontSize: 18 }}>
          {props.deckName}
        </Text>
        <View style={{ position: "absolute", right: 10, flexDirection: "row" }}>
          <Text style={{ color: "blue" }}> {newCards.length} </Text>
          <Text style={{ color: "red" }}> {againCards.length} </Text>
          <Text style={{ color: "green" }}> {reviewCards.length} </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boxContainer: {
    borderWidth: 1,
    borderColor: "black",
    padding: 10,
    margin: 10,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
});
