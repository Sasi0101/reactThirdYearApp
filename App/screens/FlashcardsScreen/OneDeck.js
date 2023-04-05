import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { DeviceEventEmitter } from "react-native";
import { Overlay } from "@rneui/themed";
import { auth, firestore } from "../../firebase";
import { COLORS } from "../../constants/COLORS";

const NEW_PER_DAY = 20;
//cardState can be new, learning, learning2 and review
export default function OneDeck(props) {
  const navigation = useNavigation();

  const [isEditCardOverlayOn, setIsEditCardOverlayOn] = useState(false);
  const [cards, setCards] = useState([]);
  const [isCardsOverlayOn, setIsCardsOverlayOn] = useState(false);
  const [newCards, setNewCards] = useState([]);
  const [learningCards, setLearningCards] = useState([]);
  const [reviewCards, setReviewCards] = useState([]);
  const [newCardsStudiedToday, setNewCardsStudiedToday] = useState(0);
  const [isOverlayOn, setIsOverlayOn] = useState(false);
  const [newCardsLength, setNewCardsLength] = useState(null);
  const [tempCard, setTempCard] = useState(null);
  const [frontCard, setFrontCard] = useState("");
  const [backCard, setBackCard] = useState("");

  useEffect(() => {
    const onEvent = () => {
      console.log("emitter received");
      loadData();
    };

    DeviceEventEmitter.addListener(props.deckName, onEvent);

    return () => {
      DeviceEventEmitter.removeAllListeners(props.deckName);
    };
  }, []);

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
    let newCardsArr = [];
    let learningCardsArr = [];
    let reviewCardsArr = [];

    cards.forEach((item) => {
      const tempDate = new Date(item.createdAt);
      item.createdAt = tempDate.toISOString();
      const tempDate2 = new Date(item.nextTime);
      item.nextTime = tempDate2.toISOString();

      switch (item.cardState) {
        case "new":
          newCardsArr.push(item);
          break;
        case "learning":
        case "learning2":
          learningCardsArr.push(item);
          break;
        case "review": // check here if the card should be shown or not
          if (item.nextTime && new Date(item.nextTime) <= new Date()) {
            reviewCardsArr.push(item);
          }

          break;
      }
    });

    setNewCards(newCardsArr);
    setLearningCards(learningCardsArr);
    setReviewCards(reviewCardsArr);

    setNewCardsLength(newCardsArr.slice(0, NEW_PER_DAY - newCardsStudiedToday));
  }, [cards]);

  const handleOnPublish = async () => {
    if (props.deckName.includes("@")) {
      Alert.alert(
        "Wrong deck name",
        "You can not publish decks with @ character in it."
      );
      return;
    }

    const dataToUpload = {
      email: auth.currentUser?.email,
      cards: cards,
      deckName: props.deckName + " - " + auth.currentUser?.email,
      rating: 0,
      usersVoted: [],
    };

    await firestore
      .collection("flashcards")
      .where("deckName", "==", props.deckName + " - " + auth.currentUser?.email)
      .get()
      .then(async (querySnapshot) => {
        if (!querySnapshot.empty) {
          let tempData;
          querySnapshot.docs.map((doc) => (tempData = doc.id));

          await firestore
            .collection("flashcards")
            .doc(tempData)
            .update(
              {
                cards: cards,
              },
              { merge: true }
            )
            .catch((error) =>
              console.error("Error while updating a deck: ", error)
            );
        } else {
          await firestore
            .collection("flashcards")
            .add(dataToUpload)
            .catch((error) =>
              console.error("Error while uploading flashcards: ", error)
            );
        }
      });
  };

  const OneCard = ({ card }) => (
    <TouchableOpacity
      onPress={() => {
        setTempCard(card);
        setFrontCard(card.front);
        setBackCard(card.back);
        setIsEditCardOverlayOn(true);
      }}
    >
      <View
        style={{
          flex: 2,
          flexDirection: "row",

          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ flex: 1, borderRightWidth: 1 }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 18,
            }}
          >
            {card.front}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 18,
            }}
          >
            {card.back}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  const handleEditCard = async () => {
    const newData = cards.map((item) => {
      if (item.id === tempCard.id) {
        const dataToUpdate = {
          id: tempCard.id,
          front: frontCard,
          back: backCard,
          createdAt: tempCard.createdAt,
          nextTime: tempCard.nextTime,
          cardState: tempCard.cardState,
          easeFactor: tempCard.easeFactor,
        };
        return dataToUpdate;
      } else {
        return item;
      }
    });

    await AsyncStorage.setItem(props.deckName, JSON.stringify(newData));
    setCards(newData);
    setIsEditCardOverlayOn(false);
  };

  const handleDeleteDeck = async () => {
    setIsOverlayOn(false);
    await AsyncStorage.removeItem(props.deckName);
    const currentDeckNames = JSON.parse(
      await AsyncStorage.getItem("deckNames")
    );
    const updatedDeckNames = currentDeckNames.filter(
      (item) => item !== props.deckName
    );
    await AsyncStorage.setItem("deckNames", JSON.stringify(updatedDeckNames));
    DeviceEventEmitter.emit("deckDeleted", {});
  };

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
      onLongPress={() => {
        setIsOverlayOn(true);
      }}
    >
      <View style={[styles.boxContainer, { flex: 10, flexDirection: "row" }]}>
        <Text
          style={{ fontWeight: "600", fontSize: 18, flex: 8 }}
          numberOfLines={2}
        >
          {props.deckName}
        </Text>
        <View
          style={{
            flex: 2,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Text style={{ color: "blue" }}>
            {newCards.slice(0, NEW_PER_DAY - newCardsStudiedToday).length}
          </Text>
          <Text style={{ color: "red" }}> {learningCards.length} </Text>
          <Text style={{ color: "green" }}> {reviewCards.length} </Text>
        </View>
      </View>

      <Overlay
        isVisible={isOverlayOn}
        onBackdropPress={() => {
          setIsOverlayOn(false);
        }}
        style={{}}
      >
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.primary,
            borderWidth: 1,
            borderRadius: 5,
            elevation: 4,
            alignItems: "center",
          }}
          onPress={() => {
            handleOnPublish();
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
            Publish deck: {props.deckName}
          </Text>
        </TouchableOpacity>
        <View style={{ paddingVertical: 10 }} />
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.primary,
            borderWidth: 1,
            borderRadius: 5,
            elevation: 4,
            alignItems: "center",
          }}
          onPress={() => {
            setIsOverlayOn(false);
            setIsCardsOverlayOn(true);
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
            View cards
          </Text>
        </TouchableOpacity>
        <View style={{ paddingVertical: 10 }} />
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.primary,
            borderWidth: 1,
            borderRadius: 5,
            elevation: 4,
            alignItems: "center",
          }}
          onPress={() => {
            handleDeleteDeck();
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
            Delete deck
          </Text>
        </TouchableOpacity>
      </Overlay>

      <Overlay
        isVisible={isCardsOverlayOn}
        onBackdropPress={() => {
          setIsCardsOverlayOn(false);
          setIsOverlayOn(true);
        }}
      >
        <View
          style={{
            width: Dimensions.get("window").width * 0.9,
            maxHeight: Dimensions.get("window").height * 0.9,
          }}
        >
          <View
            style={{
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setIsCardsOverlayOn(false);
                setIsOverlayOn(true);
              }}
              style={{ borderWidth: 1 }}
            >
              <Text style={{ paddingVertical: 2, paddingHorizontal: 2 }}>
                Close cards page
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ paddingTop: 7 }}>
            <FlatList
              data={cards}
              renderItem={({ item }) => <OneCard card={item} />}
            />
          </View>
        </View>
      </Overlay>

      <Overlay
        isVisible={isEditCardOverlayOn}
        onBackdropPress={() => setIsEditCardOverlayOn(false)}
      >
        <Text>Front:</Text>
        <TextInput
          style={{
            borderColor: "gray",
            borderWidth: 1,
            width: Dimensions.get("window").width * 0.8,
          }}
          placeholder=" Enter front of the card"
          value={frontCard}
          onChangeText={(text) => setFrontCard(text)}
          maxLength={256}
        />

        <Text>Back:</Text>
        <TextInput
          style={{
            borderColor: "gray",
            borderWidth: 1,
            width: Dimensions.get("window").width * 0.8,
          }}
          placeholder=" Enter back of the card"
          value={backCard}
          onChangeText={(text) => setBackCard(text)}
          maxLength={256}
        />
        <View>
          <View
            style={{
              flexDirection: "row",
              paddingTop: 10,
              maxHeight: Dimensions.get("window").height * 0.5,
            }}
          >
            <View>
              <TouchableOpacity
                onPress={() => {
                  setIsEditCardOverlayOn(false);
                }}
                style={{
                  paddingVertical: 2,
                  paddingHorizontal: 2,
                  alignItems: "center",
                  borderWidth: 1,
                }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={{ position: "absolute", bottom: 0, right: 0 }}>
              <TouchableOpacity
                onPress={() => {
                  handleEditCard();
                }}
                style={{
                  paddingVertical: 2,
                  paddingHorizontal: 2,
                  alignItems: "center",
                  borderWidth: 1,
                }}
              >
                <Text>Save edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Overlay>
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
    backgroundColor: "white",
    elevation: 4,
    borderRadius: 5,
  },
});
