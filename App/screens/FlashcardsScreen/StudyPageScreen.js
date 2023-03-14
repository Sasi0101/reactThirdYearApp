import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";

export default function StudyPageScreen({ route }) {
  const [shouldShowAnswer, setShouldShowAnswer] = useState(false);
  const [currentCard, setCurrentCard] = useState();
  const [allCards, setAllCards] = useState([]);
  const [combinedCards, setCombinedCards] = useState([]);
  const [areThereCards, setAreThereCards] = useState(false);
  const [newCardsNumber, setNewCardsNumber] = useState(0);
  const [learningCardsNumber, setLearningCardsNumber] = useState(0);
  const [reviewCardsNumber, setReviewCardsNumber] = useState(0);
  const [eventEmitted, setEventEmitted] = useState(false);

  useLayoutEffect(() => {
    setNewCardsNumber(route.params.newCards.length);
    setLearningCardsNumber(route.params.learningCards.length);
    console.log("length is ", route.params.reviewCards.length);
    setReviewCardsNumber(route.params.reviewCards.length);

    const tempCards = [
      ...route.params.newCards,
      ...route.params.learningCards,
      ...route.params.reviewCards,
    ];
    const sortedArray = tempCards.sort(
      (a, b) => new Date(a.nextTime) - new Date(b.nextTime)
    );
    setCombinedCards(sortedArray);
    setShouldShowAnswer(false);

    //change this to the reviews first
    if (sortedArray.length != 0) {
      setCurrentCard(sortedArray[0]);
      setAreThereCards(true);
    } else {
      setAreThereCards(false);
    }

    const loadData = async () => {
      const data = await AsyncStorage.getItem(route.params.deckName);
      setAllCards(JSON.parse(data));
    };

    loadData();
  }, []);

  useEffect(() => {}, [currentCard, areThereCards]);

  const handleRevealAnswer = () => {
    setShouldShowAnswer(true);
  };

  //handle again should work
  const handleAgain = async () => {
    setShouldShowAnswer(false);

    let index = combinedCards.findIndex((item) => item.id === currentCard.id);
    let secondIndex = allCards.findIndex((item) => item.id === currentCard.id);

    if (currentCard.cardState == "review") {
      //here we should change the ease factor as well
      if (index !== -1) {
        setReviewCardsNumber(reviewCardsNumber - 1);
        setLearningCardsNumber(learningCardsNumber + 1);
        //changing it in the currentDeck that we are using
        if (combinedCards[index].easeFactor > 150) {
          combinedCards[index].easeFactor =
            combinedCards[index].easeFactor - 20;
          allCards[secondIndex].easeFactor =
            allCards[secondIndex].easeFactor - 20;
        }

        combinedCards[index].cardState = "learning2";
        combinedCards[index].nextTime = new Date(
          new Date().getTime() + 5 * 60 * 1000
        );
        //changing it in the all cards deck
        allCards[secondIndex].cardState = "learning2";
        allCards[secondIndex].nextTime = new Date(
          new Date().getTime() + 5 * 60 * 1000
        );
      }
    } else {
      if (index !== -1) {
        if (currentCard.cardState == "new") {
          handleNewCardSeen();
          setLearningCardsNumber(learningCardsNumber + 1);
          setNewCardsNumber(newCardsNumber - 1);

          combinedCards[index].cardState = "learning";
          combinedCards[index].interval = 1;
          combinedCards[index].nextTime = new Date(
            new Date().getTime() + 1 * 60 * 1000
          );
          //changing it in the all cards deck
          allCards[secondIndex].cardState = "learning";
          allCards[secondIndex].interval = 1;
          allCards[secondIndex].nextTime = new Date(
            new Date().getTime() + 1 * 60 * 1000
          );
        } else {
          if (combinedCards[index].interval < 1440) {
            combinedCards[index].interval = 1;
            allCards[secondIndex].interval = 1;
          } else {
            allCards[secondIndex].easeFactor =
              allCards[secondIndex].easeFactor - 20;
            combinedCards[index].easeFactor =
              combinedCards[index].easeFactor - 20;
          }

          combinedCards[index].cardState = "learning";
          combinedCards[index].nextTime = new Date(
            new Date().getTime() + 1 * 60 * 1000
          );
          //changing it in the all cards deck
          allCards[secondIndex].cardState = "learning";
          allCards[secondIndex].nextTime = new Date(
            new Date().getTime() + 1 * 60 * 1000
          );
        }
        //changing it in the currentDeck that we are using
      }
    }

    //after changing the card we sort it based on time again
    if (combinedCards.length == 0) {
      setAreThereCards(false);
      return;
    } else {
      const sortedArray = combinedCards.sort(
        (a, b) => new Date(a.nextTime) - new Date(b.nextTime)
      );
      setCombinedCards(sortedArray);
      setCurrentCard(sortedArray[0]);

      await AsyncStorage.setItem(
        route.params.deckName,
        JSON.stringify(allCards)
      );
    }

    DeviceEventEmitter.emit("testEvent", {});
  };

  const handleNewCardSeen = async () => {
    const formattedDate = new Date().toISOString().slice(0, 10).toString();
    const currentNumber = await AsyncStorage.getItem(
      route.params.deckName + formattedDate
    );

    let number = parseInt(JSON.parse(currentNumber)) + 1;
    await AsyncStorage.setItem(
      route.params.deckName + formattedDate,
      JSON.stringify(number)
    );
  };

  //good should work
  const handleGood = async () => {
    setShouldShowAnswer(false);
    let index = combinedCards.findIndex((item) => item.id === currentCard.id);
    let secondIndex = allCards.findIndex((item) => item.id === currentCard.id);

    if (currentCard.cardState == "review") {
      //here we should not change the ease factor and make it remain in review
      if (index !== -1) {
        setReviewCardsNumber(reviewCardsNumber - 1);
        const tempArr = combinedCards.splice(index, 1);
        setCombinedCards(tempArr);
        //changing it in the all cards deck
        allCards[secondIndex].interval =
          (allCards[secondIndex].interval * allCards[secondIndex].easeFactor) /
          100;
        allCards[secondIndex].nextTime = new Date(
          new Date().getTime() + combinedCards[index].interval * 60 * 1000
        );
      }
    } else if (currentCard.cardState == "new") {
      handleNewCardSeen();
      setLearningCardsNumber(learningCardsNumber + 1);
      setNewCardsNumber(newCardsNumber - 1);

      combinedCards[index].cardState = "learning2";
      combinedCards[index].interval = 10;
      combinedCards[index].nextTime = new Date(
        new Date().getTime() + 10 * 60 * 1000
      );

      allCards[secondIndex].cardState = "learning2";
      allCards[secondIndex].interval = 10;
      allCards[secondIndex].nextTime = new Date(
        new Date().getTime() + 10 * 60 * 1000
      );
    } else if (currentCard.cardState == "learning") {
      combinedCards[index].cardState = "learning2";
      if (combinedCards[index].interval < 1440)
        combinedCards[index].interval = 10;
      combinedCards[index].nextTime = new Date(
        new Date().getTime() + 10 * 60 * 1000
      );

      allCards[secondIndex].cardState = "learning2";
      if (allCards[secondIndex].interval < 1440)
        allCards[secondIndex].interval = 10;
      allCards[secondIndex].nextTime = new Date(
        new Date().getTime() + 10 * 60 * 1000
      );
    } else if (currentCard.cardState == "learning2") {
      const tempArr = combinedCards.splice(index, 1);
      setCombinedCards(tempArr);
      setLearningCardsNumber(learningCardsNumber - 1);

      if (allCards[secondIndex].interval < 1440) {
        allCards[secondIndex].interval = 1440;
      } else {
        allCards[secondIndex].interval =
          (allCards[secondIndex].interval * allCards[secondIndex].easeFactor) /
          100;
      }

      allCards[secondIndex].cardState = "review";
      allCards[secondIndex].nextTime = new Date(
        new Date().getTime() + allCards[secondIndex].interval * 60 * 1000
      );
    }

    //after changing the card we sort it based on time again
    if (combinedCards.length == 0) {
      setAreThereCards(false);
      return;
    } else {
      const sortedArray = combinedCards.sort(
        (a, b) => new Date(a.nextTime) - new Date(b.nextTime)
      );
      setCombinedCards(sortedArray);
      setCurrentCard(sortedArray[0]);

      await AsyncStorage.setItem(
        route.params.deckName,
        JSON.stringify(allCards)
      );
    }

    DeviceEventEmitter.emit("testEvent", {});
  };

  //easy should work
  const handleEasy = async () => {
    setShouldShowAnswer(false);
    let index = combinedCards.findIndex((item) => item.id === currentCard.id);
    let secondIndex = allCards.findIndex((item) => item.id === currentCard.id);

    if (currentCard.cardState == "review") {
      //here we should not change the ease factor and make it remain in review
      if (index !== -1) {
        setReviewCardsNumber(reviewCardsNumber - 1);
        const tempArr = combinedCards.splice(index, 1);
        setCombinedCards(tempArr);
        //changing it in the all cards deck
        allCards[secondIndex].easeFactor =
          allCards[secondIndex].easeFactor + 15;
        allCards[secondIndex].interval =
          ((allCards[secondIndex].interval * allCards[secondIndex].easeFactor) /
            100) *
          1.3;

        allCards[secondIndex].nextTime = new Date(
          new Date().getTime() + combinedCards[index].interval * 60 * 1000
        );
      }
    } else if (currentCard.cardState == "new") {
      handleNewCardSeen();
      setNewCardsNumber(newCardsNumber - 1);
      const tempArr = combinedCards.splice(index, 1);
      setCombinedCards(tempArr);

      allCards[secondIndex].easeFactor = allCards[secondIndex].easeFactor + 15;
      allCards[secondIndex].cardState = "review";
      allCards[secondIndex].interval = 1440;

      allCards[secondIndex].nextTime = new Date(
        new Date().getTime() + allCards[secondIndex].interval * 60 * 1000
      );
    } else if (currentCard.cardState == "learning") {
      const tempArr = combinedCards.splice(index, 1);
      setCombinedCards(tempArr);
      setLearningCardsNumber(learningCardsNumber - 1);
      allCards[secondIndex].easeFactor = allCards[secondIndex].easeFactor + 15;
      allCards[secondIndex].cardState = "review";
      if (allCards[secondIndex].interval > 1440) {
        allCards[secondIndex].interval =
          ((allCards[secondIndex].interval * allCards[secondIndex].easeFactor) /
            100) *
          1.3;
      } else {
        allCards[secondIndex].interval = 1440;
      }
      allCards[secondIndex].nextTime = new Date(
        new Date().getTime() + allCards[secondIndex].interval * 60 * 1000
      );
    } else if (currentCard.cardState == "learning2") {
      const tempArr = combinedCards.splice(index, 1);
      setCombinedCards(tempArr);
      setLearningCardsNumber(learningCardsNumber - 1);
      allCards[secondIndex].easeFactor = allCards[secondIndex].easeFactor + 15;
      allCards[secondIndex].cardState = "review";
      if (allCards[secondIndex].interval > 1440) {
        allCards[secondIndex].interval =
          (allCards[secondIndex].interval / 100) *
          allCards[secondIndex].easeFactor *
          1.3;
      } else {
        allCards[secondIndex].interval = 1440;
      }
      allCards[secondIndex].nextTime = new Date(
        new Date().getTime() + allCards[secondIndex].interval * 60 * 1000
      );
    }

    //after changing the card we sort it based on time again
    if (combinedCards.length == 0) {
      setAreThereCards(false);
      return;
    } else {
      const sortedArray = combinedCards.sort(
        (a, b) => new Date(a.nextTime) - new Date(b.nextTime)
      );
      setCombinedCards(sortedArray);
      setCurrentCard(sortedArray[0]);

      await AsyncStorage.setItem(
        route.params.deckName,
        JSON.stringify(allCards)
      );
    }
    DeviceEventEmitter.emit("testEvent", {});
  };

  return (
    <View style={{ flex: 15 }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          borderBottomWidth: 2,
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 10,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Text>New cards: </Text>
          <Text style={{ color: "blue" }}>{newCardsNumber}</Text>
        </View>

        <View style={{ flexDirection: "row" }}>
          <Text>Again cards: </Text>
          <Text style={{ color: "red" }}>{learningCardsNumber}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text>Review cards: </Text>
          <Text style={{ color: "green" }}>{reviewCardsNumber}</Text>
        </View>
      </View>
      {areThereCards && currentCard && (
        <View style={{ flex: 13, paddingVertical: 10, alignItems: "center" }}>
          <Text style={{ paddingBottom: 10 }}>{currentCard.front}</Text>
          {shouldShowAnswer && (
            <>
              <Text style={{ borderTopWidth: 1, width: "100%" }}></Text>
              <Text>{currentCard.back}</Text>
            </>
          )}
        </View>
      )}
      {!areThereCards && (
        <View style={{ flex: 13, paddingVertical: 10, alignItems: "center" }}>
          <Text>You have finished learning for today!</Text>
        </View>
      )}

      <View style={{ flex: 1, alignItems: "center", paddingTop: 10 }}>
        {!shouldShowAnswer && (
          <TouchableOpacity
            onPress={() => {
              handleRevealAnswer();
            }}
          >
            <Text>Show answer</Text>
          </TouchableOpacity>
        )}
        {shouldShowAnswer && (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                handleAgain();
              }}
            >
              <Text>Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingLeft: 25 }}
              onPress={() => {
                handleGood();
              }}
            >
              <Text>Good</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingLeft: 25 }}
              onPress={() => {
                handleEasy();
              }}
            >
              <Text>Easy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
