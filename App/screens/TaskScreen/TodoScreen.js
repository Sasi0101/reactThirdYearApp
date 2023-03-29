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
  Alert,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Overlay } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OneTask from "./OneTask";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function TodoScreen() {
  const [isOverlayOn, setIsOverlayOn] = useState(false);
  const [task, setTasks] = useState(null);
  const [showingDetailedSpecs, setShowingDetailedSpecs] = useState(false);
  const [isEditOverlay, setIsEditOverlay] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [updateFlatlist, setUpdateFlatlist] = useState(false);

  const [taskWriting, setTaskWriting] = useState("");
  const [specTaskWriting, setSpecTaskWriting] = useState("");

  useLayoutEffect(() => {
    setTaskWriting("");
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
    const dataToUpload = {
      task: taskWriting,
      completed: 0,
      id: Math.random(),
    };
    let toUpload = [dataToUpload, ...task];
    await AsyncStorage.setItem("tasks", JSON.stringify(toUpload));
    setTasks(toUpload);
    setTaskWriting("");
  };

  const handleOnDelete = async (data) => {
    const updatedTasks = task.filter((item) => item.id !== data.id);
    await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const handleOnShow = (data) => {
    setSpecTaskWriting(data.task);
    setCurrentId(data.id);
    setShowingDetailedSpecs(true);
  };

  const handleOnEdit = () => {
    setTaskWriting(specTaskWriting);
    setIsEditOverlay(true);
  };

  const handleEditChange = async () => {
    const itemToUpdate = task.find((item) => item.id === currentId);
    itemToUpdate.task = specTaskWriting;
    await AsyncStorage.setItem("tasks", JSON.stringify(task));
    setIsEditOverlay(false);
  };

  const getDescriptionStyle = (item) => {
    if (item.completed == 1) {
      return {
        textDecorationLine: "line-through",
        fontStyle: "italic",
        color: "#808080",
      };
    }
  };

  const getColour = (item) => {
    if (item.completed == 0) {
      return "grey";
    }
    if (item.completed == 1) {
      return "green";
    }
    if (item.completed == 2) {
      return "red";
    }
  };

  const getIconName = (item) => {
    if (item.completed == 0) {
      return "help-circle-outline";
    }
    if (item.completed == 1) {
      return "check-circle";
    }
    if (item.completed == 2) {
      return "close-circle";
    }
  };

  const handleNextPhase = async (item) => {
    const itemToUpdate = task.find((item2) => item2.id === item.id);
    itemToUpdate.completed = (itemToUpdate.completed + 1) % 3;
    await AsyncStorage.setItem("tasks", JSON.stringify(task));
    setUpdateFlatlist(!updateFlatlist);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={task}
          key={updateFlatlist ? "forceUpdate" : "noUpdate"}
          keyExtractor={(item) => {
            return item.id;
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { borderColor: getColour(item) }]}
              onPress={() => handleNextPhase(item)}
            >
              <View style={{ flexDirection: "column" }}>
                <View style={{ flexDirection: "row" }}>
                  <Icon
                    name={getIconName(item)}
                    color={getColour(item)}
                    size={30}
                  />
                  <TouchableOpacity onPress={() => handleOnShow(item)}>
                    <Icon name="information" color="" size={30} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleOnDelete(item)}>
                    <Icon name="delete-forever" color="black" size={30} />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.description, getDescriptionStyle(item)]}>
                    {item.task}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setTaskWriting("");
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
          setSpecTaskWriting("");
        }}
      >
        <View
          style={{
            width: Dimensions.get("window").width * 0.8,
            paddingBottom: 15,
          }}
        >
          <Text
            style={[
              {
                borderWidth: 1,
                borderColor: "#555555",
                borderRadius: 10,
                backgroundColor: "#ffffff",
                fontSize: 20,
                margin: 5,
                paddingVertical: 7,
                paddingHorizontal: 7,
              },
            ]}
          >
            {specTaskWriting}
          </Text>
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
        <View style={[styles.body]}>
          <TextInput
            value={taskWriting}
            style={{
              fontSize: 25,
              fontWeight: "bold",
              textAlign: "left",
              width: "100%",
              borderWidth: 1,
              paddingVertical: 5,
              paddingHorizontal: 5,
              marginBottom: 10,
            }}
            placeholder="Task"
            onChangeText={(value) => setTaskWriting(value)}
            maxLength={256}
          />
          <Button
            title="Save Task"
            onPress={() => {
              if (taskWriting.length < 1)
                Alert.alert(
                  "Body missing",
                  "You must write something as a task!"
                );
              else {
                setIsOverlayOn(false);
                setTask();
              }
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
        <View style={{ width: Dimensions.get("window").width * 0.8 }}>
          <TextInput
            value={specTaskWriting}
            style={[
              {
                borderWidth: 1,
                borderColor: "#555555",
                borderRadius: 10,
                backgroundColor: "#ffffff",
                fontSize: 20,
                margin: 5,
                paddingVertical: 7,
                paddingHorizontal: 7,
              },
            ]}
            multiline={true}
            placeholder="Title"
            onChangeText={(value) => setSpecTaskWriting(value)}
            maxLength={256}
          />

          <View
            style={{
              paddingTop: 15,
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Button
              title="Cancel"
              onPress={() => {
                setIsEditOverlay(false);
                setTaskWriting("");
              }}
            />

            <Button
              title="Save Task"
              onPress={() => {
                if (specTaskWriting.length < 1)
                  Alert.alert(
                    "Body missing",
                    "You must write something as a task!"
                  );
                else {
                  handleEditChange();
                }
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
    alignItems: "center",
    padding: 10,
    width: Dimensions.get("window").width * 0.85,
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
  item: {
    marginHorizontal: 10,
    marginVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    borderRadius: 10,
    elevation: 5,
  },
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#eeeeee",
  },
  tasks: {
    flex: 1,
  },
  cardContent: {
    marginLeft: 20,
    marginTop: 10,
  },
  image: {
    width: 25,
    height: 25,
  },
  card: {
    shadowColor: "#00000021",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,

    marginVertical: 10,
    marginHorizontal: 20,
    backgroundColor: "white",
    flexBasis: "46%",
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    borderLeftWidth: 6,
  },
  description: {
    fontSize: 18,
    flex: 1,
    color: "#008080",
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    flex: 1,
    color: "#696969",
    marginTop: 5,
  },
});
