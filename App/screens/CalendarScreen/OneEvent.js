import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Overlay } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OneEvent(props) {
  const [showOverLay, setShowOverlay] = useState(false);

  function GetTime(date) {
    let time = new Date(date);
    let hour = time.getHours();
    let minutes = time.getMinutes().toString();

    if (minutes.length == 1) minutes = "0" + minutes;

    return hour + ":" + minutes;
  }

  const handleDelete = async () => {
    setShowOverlay(false);
    const storedData = await AsyncStorage.getItem(props.date);
    const array = JSON.parse(storedData);

    const updated = array.filter((item) => item.id !== props.data.id);

    if (updated.length == 0) {
      //should remove the eventsDate
    }
    await AsyncStorage.setItem(props.date, JSON.stringify(updated));
    props.onDelete();
  };

  return (
    <View style={{ paddingVertical: 8, paddingHorizontal: 5 }}>
      <TouchableOpacity
        style={{ borderWidth: 1, height: 70, borderRadius: 10 }}
        onPress={() => setShowOverlay(true)}
      >
        <Text
          style={{
            alignSelf: "flex-start",
            fontSize: 20,
            paddingHorizontal: 5,
            paddingTop: 5,
          }}
        >
          {props.data.name}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ paddingHorizontal: 5 }}>
            {GetTime(props.data.from)} - {GetTime(props.data.to)}
          </Text>
        </View>
      </TouchableOpacity>

      <Overlay
        isVisible={showOverLay}
        onBackdropPress={() => {
          setShowOverlay(false);
        }}
      >
        <View
          style={{
            width: Dimensions.get("window").width * 0.9,
            height: Dimensions.get("window").height * 0.5,
          }}
        >
          <Text
            style={{ fontSize: 25, fontWeight: "bold", alignSelf: "center" }}
          >
            {props.data.name}
          </Text>
          <Text style={{ paddingTop: 30, fontSize: 17 }}>
            From: {GetTime(new Date(props.data.from))}
          </Text>
          <Text style={{ fontSize: 17 }}>
            To: {GetTime(new Date(props.data.to))}
          </Text>

          {props.data.description !== "" && (
            <>
              <Text style={{ paddingTop: 25, paddingBottom: 15, fontSize: 20 }}>
                Description:
              </Text>
              <Text
                style={{
                  borderWidth: 1,
                  borderRadius: 5,
                  backgroundColor: "#FFFDD0",
                  paddingHorizontal: 5,
                  fontSize: 18,
                }}
              >
                {props.data.description}
              </Text>
            </>
          )}

          <View
            style={{
              position: "absolute",
              bottom: 0,
              flexDirection: "row",
              width: Dimensions.get("window").width * 0.9,
              justifyContent: "space-between",
              paddingHorizontal: 10,
              paddingBottom: 5,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setShowOverlay(false);
              }}
            >
              <Text> Close </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={{
                  marginRight: 10,
                }}
                onPress={() => {
                  props.onEdit(props);
                  setShowOverlay(false);
                }}
              >
                <Text> Edit </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Delete",
                    "Are you sure you want to delete this event?",
                    [
                      { text: "No", onPress: () => {} },
                      {
                        text: "Yes",
                        onPress: () => handleDelete(),
                      },
                    ],
                    { cancelable: false }
                  );
                }}
              >
                <Text> Delete </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Overlay>
    </View>
  );
}

const styles = StyleSheet.create({});
