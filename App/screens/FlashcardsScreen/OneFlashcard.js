import {
  Alert,
  DeviceEventEmitter,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Overlay } from "@rneui/themed";
import { Rating } from "react-native-ratings";
import { auth, firestore } from "../../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../constants/COLORS";

export default function OneFlashcard(props) {
  const [deckName, setDeckName] = useState("");
  const [cards, setCards] = useState(null);
  const [rating, setRating] = useState(0);
  const [allRating, setAllRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(0);
  const [isCardsOverlayOn, setIsCardsOverlayOn] = useState(false);
  const [isOptionsOverlayOn, setIsOptionsOverlayOn] = useState(false);

  useLayoutEffect(() => {
    setDeckName(props.data.data.deckName);
    setCards(props.data.data.cards);
    decideStartingRating();
    setAllRating(props.data.data.rating);
  }, []);

  const handleVoteUpdate = async () => {
    const filteredArray = props.data.data.usersVoted.filter(
      (item) => item.email !== auth.currentUser?.email
    );
    const tempData = {
      email: auth.currentUser?.email,
      voting: currentRating,
    };
    filteredArray.push(tempData);

    const newRating = await calculateAllRating(filteredArray);

    await firestore
      .collection("flashcards")
      .doc(props.data.id)
      .update(
        {
          usersVoted: filteredArray,
          rating: newRating,
        },
        { merge: true }
      )
      .catch((error) =>
        console.error("Error when updating a flashcard rating: ", error)
      );
  };

  const calculateAllRating = async (filteredArray) => {
    let numberOfUsersVoted = 0;
    let sumOfUsersVoted = 0;
    let number = 0;

    filteredArray.map((item) => {
      numberOfUsersVoted += 1;
      sumOfUsersVoted += item.voting;
    });

    if (numberOfUsersVoted !== 0) number = sumOfUsersVoted / numberOfUsersVoted;

    return number;
  };

  useEffect(() => {
    if (rating !== currentRating) {
      setRating(currentRating);
      handleVoteUpdate();
    }
  }, [isOptionsOverlayOn]);

  const decideStartingRating = () => {
    const item = props.data.data.usersVoted.find(
      (item) => item.email === auth.currentUser?.email
    );

    if (item) {
      setRating(item.voting);
      setCurrentRating(item.voting);
    } else {
      if (props.data.data.usersVoted.length === 0) {
        setRating(0);
        setCurrentRating(0);
      } else {
        setRating(props.data.data.rating);
        setCurrentRating(props.data.data.rating);
      }
    }
  };

  const handleDownload = async () => {
    let deckNames = [];
    let tempDeckNames = JSON.parse(await AsyncStorage.getItem("deckNames"));
    if (tempDeckNames) deckNames = tempDeckNames;

    const item = deckNames.find((item) => item === props.data.data.deckName);
    if (item) {
      Alert.alert(
        "Similar deck name",
        "A deck with this name already exists if you download this deck it will overwrite the current deck are you sure you want to download?",
        [
          {
            text: "No",
            onPress: () => {
              return;
            },
          },
          {
            text: "Yes",
            onPress: () => {
              handleDownloadAfterDeckName(deckNames);
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      handleDownloadAfterDeckName(deckNames);
    }
    setIsOptionsOverlayOn(false);
  };

  const handleDownloadAfterDeckName = async (deckNames) => {
    const newDeckNames = deckNames.filter(
      (item) => item !== props.data.data.deckName
    );
    newDeckNames.push(props.data.data.deckName);
    await AsyncStorage.setItem("deckNames", JSON.stringify(newDeckNames));

    await AsyncStorage.removeItem(props.data.data.deckName);

    const cardsToUpload = props.data.data.cards.map((item) => {
      const tempData = {
        back: item.back,
        cardState: "new",
        createdAt: item.createdAt,
        front: item.front,
        id: item.id,
        interval: 1,
        nextTime: new Date(),
      };
      return tempData;
    });

    await AsyncStorage.setItem(
      props.data.data.deckName,
      JSON.stringify(cardsToUpload)
    );

    DeviceEventEmitter.emit("deckDownloaded", {});
  };

  const OneCard = ({ card }) => (
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
  );

  return (
    <SafeAreaView style={{ paddingBottom: 15 }}>
      <TouchableOpacity
        onPress={() => {
          setIsOptionsOverlayOn(true);
        }}
        style={{
          borderWidth: 1,
          height: 80,
          backgroundColor: "white",
          borderRadius: 5,
          elevation: 4,
        }}
      >
        <View style={{ flexDirection: "column", alignItems: "center" }}>
          <Text style={{ fontSize: 20, textAlign: "center" }} numberOfLines={2}>
            {deckName}
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Rating
              type="star"
              ratingCount={5}
              imageSize={20}
              fractions={1}
              startingValue={allRating}
              readonly={true}
            />
            <Text>
              {" "}
              {props.data.data.usersVoted.length}{" "}
              {props.data.data.usersVoted.length < 2 ? "vote" : "votes"}
            </Text>
          </View>
        </View>

        <Overlay
          isVisible={isOptionsOverlayOn}
          onBackdropPress={() => {
            setIsOptionsOverlayOn(false);
          }}
        >
          <View style={{ width: Dimensions.get("window").width * 0.9 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  paddingRight: 25,
                  paddingLeft: 10,
                  fontSize: 20,
                  fontWeight: "bold",
                  paddingLeft: 15,
                }}
              >
                Rating:
              </Text>
              <Rating
                type="star"
                ratingCount={5}
                imageSize={40}
                fractions={1}
                startingValue={rating}
                onFinishRating={(rating) => setCurrentRating(rating)}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: 20,
                paddingHorizontal: 10,
                paddingBottom: 5,
              }}
            >
              <TouchableOpacity
                onPress={() => handleDownload()}
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
                    fontSize: 18,
                    paddingHorizontal: 5,
                    paddingVertical: 5,
                  }}
                >
                  Download deck
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.primary,
                  borderWidth: 1,
                  borderRadius: 5,
                  elevation: 4,
                  alignItems: "center",
                }}
                onPress={() => {
                  setIsOptionsOverlayOn(false);
                  setIsCardsOverlayOn(true);
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 18,
                    paddingHorizontal: 5,
                    paddingVertical: 5,
                  }}
                >
                  View cards
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Overlay>

        <Overlay
          isVisible={isCardsOverlayOn}
          onBackdropPress={() => {
            setIsCardsOverlayOn(false);
            setIsOptionsOverlayOn(true);
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
                  setIsOptionsOverlayOn(true);
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
                  Close cards page
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ paddingTop: 7 }}>
              <FlatList
                data={cards}
                renderItem={({ item }) => <OneCard card={item} />}
                style={{ maxHeight: Dimensions.get("window").height * 0.8 }}
              />
            </View>
          </View>
        </Overlay>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
