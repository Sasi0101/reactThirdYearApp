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
import { COLORS } from "../../constants/COLORS";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <View style={{ paddingVertical: 8, paddingHorizontal: 8 }}>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderRadius: 10,
          elevation: 4,
          paddingHorizontal: 8,
          paddingVertical: 5,
          justifyContent: "center",
          backgroundColor: "white",
        }}
        onPress={() => setShowOverlay(true)}
      >
        <Text
          style={{
            fontSize: 20,
          }}
          numberOfLines={1}
        >
          {props.data.name}
        </Text>
        {props.data.description.length > 0 && (
          <Text numberOfLines={1} style={{ fontStyle: "italic" }}>
            {props.data.description}
          </Text>
        )}

        <Text style={{ fontStyle: "italic", fontWeight: "bold" }}>
          {GetTime(props.data.from)} - {GetTime(props.data.to)}
        </Text>
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
            //height: Dimensions.get("window").height * 0.5,
          }}
        >
          <Text
            style={{
              fontSize: 25,
              fontWeight: "bold",
              alignSelf: "center",
            }}
          >
            {props.data.name}
          </Text>

          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <View style={{ paddingTop: 10 }} />
            <Text
              style={{
                fontSize: 17,
                borderRadius: 5,
                paddingLeft: 5,
                elevation: 5,
                backgroundColor: "white",
                justifyContent: "center",
                borderWidth: 1,
              }}
            >
              From: {GetTime(new Date(props.data.from))}
            </Text>
            <View style={{ paddingTop: 10 }} />
            <Text
              style={{
                fontSize: 17,
                borderRadius: 5,
                paddingLeft: 5,
                elevation: 5,
                backgroundColor: "white",
                justifyContent: "center",
                borderWidth: 1,
              }}
            >
              To: {GetTime(new Date(props.data.to))}
            </Text>
          </View>

          {props.data.description !== "" && (
            <>
              <Text style={{ paddingTop: 25, paddingBottom: 15, fontSize: 20 }}>
                Description:
              </Text>
              <Text
                style={{
                  fontSize: 17,
                  borderRadius: 5,
                  paddingLeft: 5,
                  elevation: 5,
                  backgroundColor: "white",
                  justifyContent: "center",
                  borderWidth: 1,
                }}
              >
                {props.data.description}
              </Text>
            </>
          )}

          <View
            style={{
              paddingTop: 20,
              flexDirection: "row",
              width: Dimensions.get("window").width * 0.9,
              justifyContent: "space-between",
              paddingBottom: 5,
            }}
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
                setShowOverlay(false);
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
                Close
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.primary,
                  borderWidth: 1,
                  borderRadius: 5,
                  elevation: 4,
                  alignItems: "center",
                }}
                onPress={() => {
                  props.onEdit(props);
                  setShowOverlay(false);
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 16,
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                  }}
                >
                  Edit
                </Text>
              </TouchableOpacity>
              <View style={{ paddingLeft: 15 }} />
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.primary,
                  borderWidth: 1,
                  borderRadius: 5,
                  elevation: 4,
                  alignItems: "center",
                }}
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
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 16,
                    paddingHorizontal: 5,
                    paddingVertical: 5,
                  }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Overlay>
    </View>
  );
}

const styles = StyleSheet.create({});
