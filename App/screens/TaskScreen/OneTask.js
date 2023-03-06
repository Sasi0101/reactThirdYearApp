import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";

export default function OneTask(props) {
  useEffect(() => {}, []);

  return (
    <View style={[{ flexDirection: "row" }, styles.item]}>
      <TouchableOpacity
        style={{ flex: 8 }}
        onPress={() => {
          props.onShow(props.data);
          //console.log("should show info");
        }}
      >
        <View style={{ flexDirection: "column" }}>
          <Text style={[styles.title]} numberOfLines={1}>
            {props.data.title}
          </Text>
          <Text style={[styles.subtitle]} numberOfLines={1}>
            {props.data.description}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={() => {
          props.onDelete(props.data);
        }}
      >
        <View style={{}}>
          <Text>Delete</Text>
        </View>
      </TouchableOpacity>
    </View>
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
  title: {
    color: "#000000",
    fontSize: 30,
    margin: 5,
  },
  subtitle: {
    color: "#999999",
    fontSize: 20,
    margin: 5,
  },
});
