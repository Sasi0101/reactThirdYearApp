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
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState, useLayoutEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Overlay } from "@rneui/themed";
import OneDeck from "./OneDeck";
import { COLORS } from "../../constants/COLORS";

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
    props.navigation.setOptions({ title: "Flashcards" });
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
        setChooseDeckOverlay(false);
        setCardsOverlay(true);
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
    <SafeAreaView style={{ flex: 1, flexDirection: "column" }}>
      {!shouldShowOnlineDeck && (
        <>
          <View style={{ height: "90%" }}>
            <FlatList
              key={updateFlatlist ? "forceUpdate" : "noUpdate"}
              data={deckNames}
              renderItem={({ item }) => <OneDeck deckName={item} />}
            />
          </View>

          <View
            style={{
              height: "10%",
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View style={{ paddingLeft: 7 }}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: COLORS.primary,
                    borderWidth: 1,
                    borderRadius: 5,
                    elevation: 4,
                  },
                ]}
                onPress={() => {
                  setCardsOverlay(true);
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  ADD CARDS
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: COLORS.primary,
                    borderWidth: 1,
                    borderRadius: 5,
                    elevation: 4,
                  },
                ]}
                onPress={() => {
                  setDeckOverlay(!deckOverlay);
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  ADD A DECK
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ paddingRight: 7 }}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: COLORS.primary,
                    borderWidth: 1,
                    borderRadius: 5,
                    elevation: 4,
                  },
                ]}
                onPress={() => {
                  if (isThereWifi) {
                    setShouldShowOnlineDecks(true);
                  } else {
                    Alert.alert(
                      "Network failure",
                      "Please connect to the network to view uploaded decks."
                    );
                  }
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  DECKS ONLINE
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      <Overlay
        isVisible={deckOverlay}
        onBackdropPress={() => {
          setDeckOverlay(!deckOverlay);
          setInputValue("");
        }}
      >
        <View
          style={{
            alignItems: "center",
            width: Dimensions.get("window").width * 0.9,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", paddingBottom: 10 }}>
            Deck name
          </Text>
          <TextInput
            style={{
              borderColor: "gray",
              borderWidth: 1,
              width: "100%",
              borderRadius: 5,
              elevation: 1,
              height: 30,
              paddingHorizontal: 5,
            }}
            placeholder=" Enter deck name"
            placeholderTextColor={"gray"}
            value={inputValue}
            onChangeText={(text) => setInputValue(text)}
            maxLength={50}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            marginTop: 20,
            marginBottom: 5,
            marginHorizontal: 5,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primary,
              borderWidth: 1,
              borderRadius: 5,
              elevation: 4,
            }}
            onPress={() => {
              setInputValue("");
              setDeckOverlay(!deckOverlay);
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                paddingHorizontal: 5,
                paddingVertical: 5,
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              position: "absolute",
              right: 0,
              backgroundColor: COLORS.primary,
              borderWidth: 1,
              borderRadius: 5,
              elevation: 4,
            }}
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
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                paddingHorizontal: 5,
                paddingVertical: 5,
              }}
            >
              Add deck
            </Text>
          </TouchableOpacity>
        </View>
      </Overlay>

      <Overlay
        isVisible={cardsOverlay}
        onBackdropPress={() => {
          setCardsOverlay(false);
        }}
      >
        <View
          style={{
            width: Dimensions.get("window").width * 0.9,
          }}
        >
          <Text style={{ fontSize: 17, width: "20%", fontWeight: "bold" }}>
            Deck:
          </Text>
          <View style={{ paddingTop: 10 }} />
          <TouchableOpacity
            style={{
              borderColor: "gray",
              borderWidth: 1,
              borderRadius: 4,
              height: 25,
            }}
            onPress={() => {
              setCardsOverlay(false);
              setChooseDeckOverlay(true);
            }}
          >
            <Text style={{ fontSize: 16 }}> {selectedOption}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "column" }}>
          <Text
            style={{
              paddingTop: 25,
              paddingBottom: 10,
              fontSize: 17,
              fontWeight: "bold",
            }}
          >
            Front:
          </Text>
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              borderRadius: 4,
            }}
            placeholder=" Enter question"
            placeholderTextColor={"gray"}
            value={frontCard}
            onChangeText={(text) => setFrontCard(text)}
            maxLength={256}
          />
        </View>

        <View style={{ flexDirection: "column" }}>
          <Text
            style={{
              paddingTop: 25,
              paddingBottom: 10,
              fontSize: 17,
              fontWeight: "bold",
            }}
          >
            Back:
          </Text>
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              borderRadius: 4,
            }}
            placeholder=" Enter answer"
            placeholderTextColor={"gray"}
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
          <TouchableOpacity
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
            style={{
              backgroundColor: COLORS.primary,
              borderWidth: 1,
              borderRadius: 5,
              elevation: 4,
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
              ADD CARD
            </Text>
          </TouchableOpacity>
        </View>
      </Overlay>

      <Overlay
        isVisible={chooseDeckOverlay}
        onBackdropPress={() => {
          setChooseDeckOverlay(false);
          setCardsOverlay(true);
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

      {shouldShowOnlineDeck && <VotingFlashcardsScreen />}
    </SafeAreaView>
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
