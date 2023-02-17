import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Button,
  Dimensions,
  FlatList,
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

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={task}
          renderItem={({ item }) => (
            <OneTask data={item} onDelete={(data) => handleOnDelete(data)} />
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
