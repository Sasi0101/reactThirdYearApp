import { StyleSheet, Text, View } from "react-native";
import React from "react";

export default function OneMessage({ text, user }) {
  return (
    <View style={styles.messageContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.message}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "50%",
    padding: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    backgroundColor: "blue",
    width: "50%",
    padding: 10,
    borderRadius: 10,
  },
  sender: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  message: {
    color: "#333333",
    fontSize: 20,
  },
});
