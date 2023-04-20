import {
  Alert,
  Button,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import "firebase/storage";
import firebase from "firebase/app";
import { auth, firestore } from "../../firebase";
import { Overlay } from "@rneui/themed";
import { COLORS } from "../../constants/COLORS";

export default function QuestionsScreen(props) {
  const [data, setData] = useState([]);
  const [question, setQuestion] = useState("");
  const [isQuestionOverlayOn, setIsQuestionOverlayOn] = useState(false);
  const [isAnswerOverlayOn, setIsAnswerOverlayOn] = useState(false);
  const [updateFlatlist, setUpdateFlatlist] = useState(false);
  const [currentData, setCurrentData] = useState();
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [username, setUsername] = useState(""); // add username instead of email

  useLayoutEffect(() => {
    props.navigation.setOptions({ title: "Forum" });
    const unsubscribe = firestore
      .collection("questions")
      .orderBy("lastAnswerDate", "desc")
      .onSnapshot((snapshot) => {
        const tempData = [];
        snapshot.forEach((doc) => {
          let tempData1 = doc.data();
          tempData1.answers.sort((a, b) => new Date(b.time) - new Date(a.time));
          const toSubmit = { id: doc.id, data: tempData1 };
          tempData.push(toSubmit);
        });
        setData(tempData);
      });

    const unsubscribe2 = firestore
      .collection("users")
      .doc(auth.currentUser?.email)
      .onSnapshot((snapshot) => {
        setUsername(snapshot.data().username);
      });

    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, []);

  useEffect(() => {}, [data]);

  const handleAskingAQuestion = async () => {
    const tempData = {
      answers: [],
      lastAnswerDate: new Date(),
      question: question,
      whoAsked: auth.currentUser?.email,
    };

    await firestore.collection("questions").add(tempData);

    setQuestion("");
    setIsQuestionOverlayOn(false);
  };

  const OneQuestion = ({ data }) => (
    <View style={[styles.item]}>
      <View>
        <Text style={{ fontSize: 25, alignSelf: "center" }}>
          {data.data.question}
        </Text>
        <Text style={{ alignSelf: "center" }}>{data.data.whoAsked}</Text>
      </View>
      <View
        style={{
          paddingVertical: 10,
          maxWidth: Dimensions.get("window").width * 0.7,
        }}
      >
        {data.data.answers.length < 1 ? (
          <Text>No answers yet</Text>
        ) : (
          <FlatList
            data={data.data.answers.slice(0, 3)}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <Text style={{ fontSize: 16 }}>{item.answerer}: </Text>
                <Text style={{ fontSize: 16 }}>{item.answer}</Text>
              </View>
            )}
          />
        )}

        {data.data.answers.length > 3 && (
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>...</Text>
        )}

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 5,
            width: Dimensions.get("window").width * 0.9,
          }}
        >
          <Button
            title="Answer question"
            onPress={() => {
              setCurrentData(data);
              setIsAnswerOverlayOn(true);
            }}
            color={COLORS.primary}
          />
        </View>
      </View>
    </View>
  );

  const handleAnswerintQuestion = async () => {
    let tempData = [];
    await firestore
      .collection("questions")
      .doc(currentData.id)
      .get()
      .then((doc) => {
        tempData = doc.data();
      })
      .catch((error) =>
        console.error(
          "Error while getting the data when answering a question ",
          error
        )
      );

    tempData.answers.length < 1
      ? (tempData.answers = [
          {
            answer: questionAnswer,
            answerer: username,
            time: new Date().toISOString(),
          },
        ])
      : tempData.answers.push({
          answer: questionAnswer,
          answerer: username,
          time: new Date().toISOString(),
        });

    await firestore
      .collection("questions")
      .doc(currentData.id)
      .update(
        { answers: tempData.answers, lastAnswerDate: new Date() },
        { merge: true }
      )
      .catch((error) =>
        console.error(
          "Error while updating data for answering a question ",
          error
        )
      );

    setQuestionAnswer("");
    setIsAnswerOverlayOn(false);
  };

  return (
    <SafeAreaView style={{ flex: 10 }}>
      <View style={{ flex: 9 }}>
        <FlatList
          data={data}
          key={updateFlatlist ? "forceUpdate" : "noUpdate"}
          renderItem={({ item }) => <OneQuestion data={item} />}
        />
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Button
          title="Ask a question"
          onPress={() => setIsQuestionOverlayOn(true)}
          color={COLORS.primary}
        />
      </View>

      <Overlay
        isVisible={isQuestionOverlayOn}
        onBackdropPress={() => {
          setQuestion("");
          setIsQuestionOverlayOn(false);
        }}
      >
        <SafeAreaView style={{ width: Dimensions.get("window").width * 0.9 }}>
          <View>
            <Text style={{ fontSize: 22, paddingLeft: 5 }}>Question:</Text>
            <View style={{ elevation: 1, borderWidth: 0.5, borderRadius: 5 }}>
              <TextInput
                style={{ fontSize: 18, margin: 5 }}
                multiline={true}
                placeholder="Write your question here"
                placeholderTextColor={"gray"}
                value={question}
                onChangeText={(text) => setQuestion(text)}
                maxLength={256}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              margin: 10,
              justifyContent: "space-between",
            }}
          >
            <Button
              title="Cancel"
              color={COLORS.primary}
              onPress={() => {
                setQuestion("");
                setIsQuestionOverlayOn(false);
              }}
            />
            <Button
              title="Ask question"
              color={COLORS.primary}
              onPress={() => {
                question.length < 1
                  ? Alert.alert(
                      "Missing question",
                      "The question must not be empty."
                    )
                  : handleAskingAQuestion();
              }}
            />
          </View>
        </SafeAreaView>
      </Overlay>

      {currentData && (
        <Overlay
          isVisible={isAnswerOverlayOn}
          onBackdropPress={() => {
            setIsAnswerOverlayOn(false);
          }}
        >
          <SafeAreaView
            style={{
              flex: 10,
              margin: 5,
              width: Dimensions.get("window").width * 0.95,
            }}
          >
            <View>
              <Text style={{ fontSize: 25, alignSelf: "center" }}>
                {currentData.data.question}
              </Text>
              <Text style={{ alignSelf: "center" }}>
                {currentData.data.whoAsked}
              </Text>
            </View>
            <View
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                flex: 9,
                paddingHorizontal: 2,
              }}
            >
              <FlatList
                data={currentData.data.answers}
                renderItem={({ item }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      paddingTop: 5,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        {item.answerer}:{" "}
                      </Text>
                      {item.answer}
                    </Text>
                  </View>
                )}
              />
            </View>

            <KeyboardAvoidingView
              style={{
                flex: 1,
                elevation: 1,
                borderWidth: 0.5,
                borderRadius: 5,
              }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <TextInput
                style={{ fontSize: 16, margin: 5 }}
                placeholder="Write your answer"
                placeholderTextColor="gray"
                value={questionAnswer}
                onChangeText={(text) => setQuestionAnswer(text)}
                maxLength={256}
              />
            </KeyboardAvoidingView>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                margin: 5,
              }}
            >
              <Button
                title="Cancel"
                onPress={() => {
                  setQuestionAnswer("");
                  setIsAnswerOverlayOn(false);
                }}
                color={COLORS.primary}
              />

              <Button
                title="Send"
                onPress={() => {
                  questionAnswer.length < 1
                    ? Alert.alert(
                        "Missing answer",
                        "You must write something as an aswer."
                      )
                    : handleAnswerintQuestion();
                }}
                color={COLORS.primary}
              />
            </View>
          </SafeAreaView>
        </Overlay>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  item: {
    marginHorizontal: 10,
    marginVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    borderRadius: 10,
    elevation: 5,
  },
});
