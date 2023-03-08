import { StyleSheet, Text, View } from "react-native";
import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { DeviceEventEmitter } from "react-native";

const NEW_PER_DAY = 20;
//cardState can be new, learning, learning2 and review
export default function OneDeck(props) {
  const navigation = useNavigation();

  const [cards, setCards] = useState([]);

  const [newCards, setNewCards] = useState([]);
  const [learningCards, setLearningCards] = useState([]);
  const [reviewCards, setReviewCards] = useState([]);
  const [newCardsStudiedToday, setNewCardsStudiedToday] = useState(0);
  const [didReceiveEmit, setDidReceiveEmit] = useState(false);

  useEffect(() => {
    const onEvent = () => {
      console.log("emit received");
      if (!didReceiveEmit) {
        setDidReceiveEmit(true);
        loadData();
        setTimeout(() => {
          setDidReceiveEmit(false);
        }, 2000);
      }
    };

    DeviceEventEmitter.addListener("testEvent", onEvent);

    return () => {
      DeviceEventEmitter.removeAllListeners("testEvent");
    };
  }, [didReceiveEmit]);

  useLayoutEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    let cardsAsync = await AsyncStorage.getItem(props.deckName);

    if (cardsAsync !== null) {
      let cardsAsyncParsed = JSON.parse(cardsAsync);
      setCards(cardsAsyncParsed);
    }

    const formattedDate = new Date().toISOString().slice(0, 10).toString();
    let studiedToday = await AsyncStorage.getItem(
      props.deckName + formattedDate
    );

    if (studiedToday !== null) {
      let number = JSON.parse(studiedToday);
      setNewCardsStudiedToday(parseInt(number));
    } else {
      await AsyncStorage.setItem(
        props.deckName + formattedDate,
        JSON.stringify(0)
      );
      setNewCardsStudiedToday(0);
    }
  };

  useEffect(() => {
    const newCardsArr = [];
    const learningCardsArr = [];
    const reviewCardsArr = [];

    cards.forEach((item) => {
      switch (item.cardState) {
        case "new":
          newCardsArr.push(item);
          break;
        case "learning":
        case "learning2":
          learningCardsArr.push(item);
          break;
        case "review": // check here if the card should be shown or not
          if (item.nextTime && item.nextTime < new Date())
            reviewCardsArr.push(item);
          break;
      }
    });

    setNewCards(newCardsArr);
    setLearningCards(learningCardsArr);
    setReviewCards(reviewCardsArr);
  }, [cards]);

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("StudyPageScreen", {
          deckName: props.deckName,
          newCards: newCards.slice(0, NEW_PER_DAY - newCardsStudiedToday),
          learningCards: learningCards,
          reviewCards: reviewCards,
        });
      }}
    >
      <View style={styles.boxContainer}>
        <Text style={{ fontWeight: "600", fontSize: 18 }}>
          {props.deckName}
        </Text>
        <View style={{ position: "absolute", right: 10, flexDirection: "row" }}>
          <Text style={{ color: "blue" }}>
            {newCards.slice(0, NEW_PER_DAY - newCardsStudiedToday).length}
          </Text>
          <Text style={{ color: "red" }}> {learningCards.length} </Text>
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
