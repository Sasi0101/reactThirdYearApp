import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  Button,
  Alert,
  FlatList,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useLayoutEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Overlay } from "@rneui/themed";
import OneDeck from "./OneDeck";
import { DeviceEventEmitter } from "react-native";
import { auth, firestore } from "../../firebase";
import NetInfo from "@react-native-community/netinfo";
import VotingFlashcardsScreen from "./VotingFlashcardsScreen";

export default function FlashcardsScreen(props) {
  const [deckNames, setDeckNames] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState("Select deck");
  const [frontCard, setFrontCard] = useState("");
  const [backCard, setBackCard] = useState("");
  const [deckOverlay, setDeckOverlay] = useState(false);
  const [cardsOverlay, setCardsOverlay] = useState(false);
  const [chooseDeckOverlay, setChooseDeckOverlay] = useState(false);
  const [updateFlatlist, setUpdateFlatlist] = useState(false);
  const [shouldShowOnlineDeck, setShouldShowOnlineDecks] = useState(false);
  const [onlineCards, setOnlineCards] = useState([]);
  const [isThereWifi, setIsThereWifi] = useState(true);

  useEffect(() => {
    (async () => {
      const storedDeckNames = await AsyncStorage.getItem("deckNames");
      if (storedDeckNames) {
        const filteredArray = JSON.parse(storedDeckNames).filter(function (
          string
        ) {
          return string !== "";
        });
        setDeckNames(filteredArray);
      }
    })();

    DeviceEventEmitter.addListener("deckDeleted", handleDeckDeleted);

    return () => {
      DeviceEventEmitter.removeAllListeners("deckDeleted");
    };
  }, []);

  useLayoutEffect(() => {
    const unsubsribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        setIsThereWifi(true);
      } else {
        setIsThereWifi(false);
      }
    });

    DeviceEventEmitter.addListener("closeFlashcardsRank", onEvent);
    DeviceEventEmitter.addListener("deckDownloaded", onDownload);

    return () => {
      unsubsribe();
      DeviceEventEmitter.removeAllListeners("closeFlashcardsRank");
      DeviceEventEmitter.removeAllListeners("deckDownload");
    };
  }, []);

  const handleDeckDeleted = async () => {
    const tempItem = await AsyncStorage.getItem("deckNames");
    setDeckNames(JSON.parse(tempItem));
  };

  const onEvent = () => {
    setShouldShowOnlineDecks(false);
  };

  const onDownload = async () => {
    const decks = JSON.parse(await AsyncStorage.getItem("deckNames"));
    setDeckNames(decks);
    console.log("updated in flashcardsScreen");
  };

  //updates the right value the rigth value
  useEffect(() => {
    (async () => {
      const filteredArray = deckNames.filter(function (string) {
        return string !== "";
      });
      await AsyncStorage.setItem("deckNames", JSON.stringify(filteredArray));
    })();
  }, [deckNames]);

  const DeckItem = ({ name }) => (
    <TouchableOpacity
      style={{
        width: "100%",
        borderWidth: 1,
        borderColor: "gray",
        height: 40,
        alignItems: "center",
        justifyContent: "center",
      }}
      onPress={() => {
        setSelectedOption(name);
        setChooseDeckOverlay(!chooseDeckOverlay);
      }}
    >
      <Text>{name}</Text>
    </TouchableOpacity>
  );

  const HandleCardAddition = async () => {
    let oldCards = [];
    const checkIfExists = await AsyncStorage.getItem(selectedOption);

    if (checkIfExists !== null) oldCards = JSON.parse(checkIfExists);

    const new_item = {
      id: Math.random(),
      front: frontCard,
      back: backCard,
      createdAt: new Date(),
      nextTime: new Date(),
      cardState: "new",
      easeFactor: 250,
    };

    oldCards.push(new_item);
    const newDeckName = selectedOption;
    const sortedArray = oldCards.sort(
      (a, b) => new Date(a.nextTime) - new Date(b.nextTime)
    );
    await AsyncStorage.setItem(newDeckName, JSON.stringify(sortedArray));

    //not the best idea as we have to rerender all of them
    setUpdateFlatlist(!updateFlatlist);
  };

  return (
    <View style={{ flex: 1, flexDirection: "column" }}>
      <View style={{ height: "90%" }}>
        <FlatList
          key={updateFlatlist ? "forceUpdate" : "noUpdate"}
          data={deckNames}
          renderItem={({ item }) => <OneDeck deckName={item} />}
        />
      </View>

      <View style={{ height: "10%" }}>
        <TouchableOpacity
          style={styles.openPopupButton}
          onPress={() => {
            if (isThereWifi) {
              setShouldShowOnlineDecks(true);
              console.log("should open other decks");
            } else {
              Alert.alert(
                "Network failure",
                "Please connect to the network to view this page."
              );
            }
          }}
        >
          <Text>Open Popup</Text>
        </TouchableOpacity>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setCardsOverlay(true);
            }}
          >
            <Text>Add a card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setDeckOverlay(!deckOverlay);
            }}
          >
            <Text>Add decks</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Overlay
        isVisible={deckOverlay}
        onBackdropPress={() => {
          setDeckOverlay(!deckOverlay);
          setInputValue("");
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ width: "30%", fontSize: 18 }}> Deck name </Text>
          <TextInput
            style={{ borderColor: "gray", borderWidth: 1, width: "60%" }}
            placeholder=" Enter deck name"
            value={inputValue}
            onChangeText={(text) => setInputValue(text)}
            maxLength={50}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            marginTop: 40,
            marginBottom: 5,
            marginHorizontal: 5,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setInputValue("");
              setDeckOverlay(!deckOverlay);
            }}
          >
            <Text>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ position: "absolute", right: 0 }}
            onPress={() => {
              const checkIfThereIsSameDeckName = deckNames.includes(inputValue);

              if (checkIfThereIsSameDeckName) {
                Alert.alert(
                  "Similar deck name",
                  "There is already a deck with the same name please change this name"
                );
              } else {
                if (inputValue.includes("@")) {
                  Alert.alert(
                    "Wrong deck name",
                    "You can not publish decks with @ character in it."
                  );
                } else {
                  setDeckNames([...deckNames, inputValue]);
                  setInputValue("");
                  setDeckOverlay(!deckOverlay);
                }
              }
            }}
          >
            <Text>Add deck</Text>
          </TouchableOpacity>
        </View>
      </Overlay>

      <Overlay
        isVisible={cardsOverlay}
        onBackdropPress={() => {
          setCardsOverlay(!cardsOverlay);
        }}
      >
        <View
          style={{
            flexDirection: "row",
            width: "90%",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 17, width: "20%" }}>Deck: </Text>
          <TouchableOpacity
            style={{ width: "70%" }}
            onPress={() => {
              setChooseDeckOverlay(!chooseDeckOverlay);
            }}
          >
            <Text> {selectedOption}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "column" }}>
          <Text style={{ paddingTop: 25, paddingBottom: 10, fontSize: 17 }}>
            Front:
          </Text>
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
            }}
            placeholder=" Enter question"
            value={frontCard}
            onChangeText={(text) => setFrontCard(text)}
            maxLength={256}
          />
        </View>

        <View style={{ flexDirection: "column" }}>
          <Text style={{ paddingTop: 25, paddingBottom: 10, fontSize: 17 }}>
            Back:
          </Text>
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
            }}
            placeholder=" Enter answer"
            value={backCard}
            onChangeText={(text) => setBackCard(text)}
            maxLength={512}
          />
        </View>

        <View style={{ height: "20%" }} />

        <View
          style={{
            position: "absolute",
            bottom: 15,
            alignSelf: "center",
          }}
        >
          <Button
            title="Add card"
            onPress={() => {
              if (selectedOption === "Select deck") {
                Alert.alert("You must choose a desk.");
                return;
              }

              if (frontCard === "") {
                Alert.alert("Front card can not be empty");
                return;
              }

              if (backCard === "") {
                Alert.alert("Back card can not be empty");
                return;
              }

              //handle adding the card
              HandleCardAddition();
              setFrontCard("");
              setBackCard("");
            }}
            accessibilityLabel="Press this to add"
          />
        </View>
      </Overlay>

      <View>
        <Overlay
          isVisible={chooseDeckOverlay}
          onBackdropPress={() => {
            setChooseDeckOverlay(!chooseDeckOverlay);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "90%",
              height: Dimensions.get("screen").height / 2,
            }}
          >
            <FlatList
              data={deckNames}
              renderItem={({ item }) => <DeckItem name={item} />}
              style={{ flex: 1 }}
              keyExtractor={(item) => item}
              contentContainerStyle={{
                flexGrow: 1,
              }}
            />
          </View>
        </Overlay>
      </View>

      <Overlay
        isVisible={shouldShowOnlineDeck}
        onBackdropPress={() => {
          setShouldShowOnlineDecks(false);
        }}
      >
        <VotingFlashcardsScreen />
      </Overlay>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: 16,
  },
  openPopupButton: {
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    position: "absolute",
    bottom: 0,
  },
  optionButton: {
    alignItems: "center",
    backgroundColor: "#dddddd",
    padding: 10,
    borderRadius: 7,
    marginHorizontal: 8,
  },
});
