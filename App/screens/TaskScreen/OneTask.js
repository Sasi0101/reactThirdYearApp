import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";

export default function OneTask(props) {
  useEffect(() => {}, []);

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        props.onDelete(props.data);
      }}
    >
      <Text style={[styles.title]} numberOfLines={1}>
        {props.data.title}
      </Text>
      <Text style={[styles.subtitle]} numberOfLines={1}>
        {props.data.description}
      </Text>
    </TouchableOpacity>
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
