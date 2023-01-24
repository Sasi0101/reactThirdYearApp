import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

export default function OneUser(props) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("PrivateMessageScreen", {
          username: props.username,
          email: props.email,
        });
      }}
    >
      <View style={styles.boxContainer}>
        <Text style={styles.textContainer}>{props.username}</Text>
        <Text style={styles.textContainer}>{props.email}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boxContainer: {
    borderWidth: 1,
    borderColor: "black",
    padding: 10,
    margin: 10,
    alignItems: "center",
  },
  textContainer: {
    fontSize: 16,
    marginVertical: 5,
  },
});
