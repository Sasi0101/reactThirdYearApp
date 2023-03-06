import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Button,
  Dimensions,
  FlatList,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Overlay } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OneTask from "./OneTask";

export default function TodoScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isOverlayOn, setIsOverlayOn] = useState(false);
  const [task, setTasks] = useState(null);
  const [showingDetailedSpecs, setShowingDetailedSpecs] = useState(false);
  const [specTitle, setSpecTitle] = useState("");
  const [specDescription, setSpecDescription] = useState("");
  const [isEditOverlay, setIsEditOverlay] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const tempData = await AsyncStorage.getItem("tasks");
        if (tempData != null) {
          setTasks(JSON.parse(tempData));
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.error("Error at loading the data for todo screen: ", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {}, [task]);

  const setTask = async () => {
    let toUpload = task;

    const dataToUpload = {
      title: title,
      description: description,
      id: Math.random(),
    };
    toUpload.push(dataToUpload);

    await AsyncStorage.setItem("tasks", JSON.stringify(toUpload));

    setTasks(toUpload);
    setTitle("");
    setDescription("");
  };

  const handleOnDelete = async (data) => {
    const updatedTasks = task.filter((item) => item.id !== data.id);

    await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const handleOnShow = (data) => {
    setSpecTitle(data.title);
    setSpecDescription(data.description);
    setCurrentId(data.id);
    setShowingDetailedSpecs(true);
  };

  const handleOnEdit = () => {
    setDescription(specDescription);
    setTitle(specTitle);
    setIsEditOverlay(true);
  };

  const handleEditChange = async () => {
    const itemToUpdate = task.find((item) => item.id === currentId);
    itemToUpdate.description = description;
    itemToUpdate.title = title;
    await AsyncStorage.setItem("tasks", JSON.stringify(task));
    setIsEditOverlay(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={task}
          renderItem={({ item }) => (
            <OneTask
              data={item}
              onDelete={(data) => handleOnDelete(data)}
              onShow={(data) => handleOnShow(data)}
            />
          )}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setIsOverlayOn(true);
          }}
        >
          <Text style={{ fontSize: 30 }}> + </Text>
        </TouchableOpacity>
      </View>

      <Overlay
        isVisible={showingDetailedSpecs}
        onBackdropPress={() => {
          setShowingDetailedSpecs(false);
          setSpecTitle("");
          setSpecDescription("");
        }}
      >
        <View style={styles.body}>
          <Text>Title</Text>
          <Text style={[styles.input, { fontSize: 25, fontWeight: "bold" }]}>
            {specTitle}
          </Text>
          <Text>Description:</Text>
          <ScrollView
            style={[
              styles.input,
              {
                maxHeight: Dimensions.get("window").height * 0.2,
                flex: 2,
                textAlignVertical: "top",
                textAlign: "left",
              },
            ]}
          >
            <Text>{specDescription}</Text>
          </ScrollView>
        </View>
        <View>
          <Button
            title="Edit"
            style={{ width: "100%" }}
            onPress={() => {
              setShowingDetailedSpecs(false);
              handleOnEdit();
            }}
          />
        </View>
      </Overlay>

      <Overlay
        isVisible={isOverlayOn}
        onBackdropPress={() => {
          setIsOverlayOn(false);
        }}
      >
        <View style={styles.body}>
          <TextInput
            value={title}
            style={[styles.input, { fontSize: 25, fontWeight: "bold" }]}
            placeholder="Title"
            onChangeText={(value) => setTitle(value)}
            maxLength={64}
          />
          <TextInput
            value={description}
            style={[
              styles.input,
              { flex: 2, textAlignVertical: "top", textAlign: "left" },
            ]}
            placeholder="Description"
            multiline
            onChangeText={(value) => setDescription(value)}
            maxLength={512}
          />
          <Button
            title="Save Task"
            style={{ width: "100%" }}
            onPress={() => {
              setIsOverlayOn(false);
              setTask();
            }}
          />
        </View>
      </Overlay>

      <Overlay
        isVisible={isEditOverlay}
        onBackdropPress={() => {
          setIsEditOverlay(false);
        }}
      >
        <View style={styles.body}>
          <TextInput
            value={title}
            style={[styles.input, { fontSize: 25, fontWeight: "bold" }]}
            placeholder="Title"
            onChangeText={(value) => setTitle(value)}
            maxLength={64}
          />
          <TextInput
            value={description}
            style={[
              styles.input,
              { flex: 2, textAlignVertical: "top", textAlign: "left" },
            ]}
            placeholder="Description"
            multiline
            onChangeText={(value) => setDescription(value)}
            maxLength={512}
          />

          <View style={{ flexDirection: "row" }}>
            <Button
              title="Cancel"
              style={{ width: "100%" }}
              onPress={() => {
                setIsEditOverlay(false);
                setDescription("");
                setTitle("");
              }}
            />

            <Button
              title="Save Task"
              style={{ width: "100%" }}
              onPress={() => {
                handleEditChange();
              }}
            />
          </View>
        </View>
      </Overlay>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    //flex: 1,
    //justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    width: Dimensions.get("window").width * 0.85,
    height: Dimensions.get("window").height * 0.4,
  },
  input: {
    flex: 1,
    width: "100%",
    borderWidth: 1,
    borderColor: "#555555",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    textAlign: "left",
    fontSize: 20,
    margin: 10,
    paddingHorizontal: 10,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0080ff",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    right: 10,
    elevation: 5,
  },
});
