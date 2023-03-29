import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function OneTask(props) {
  useEffect(() => {}, []);
  //<Icon name="home-outline" color={color} size={size} />
  //closecircle:1 or checkcircle:2 or questioncircle:0

  const getDescriptionStyle = () => {
    if (props.data.completed == 1) {
      return {
        textDecorationLine: "line-through",
        fontStyle: "italic",
        color: "#808080",
      };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: "red" }]}
      onPress={() => clickEventListener(item)}
    >
      <Icon name="close-circle" color={"red"} size={25} />
      <View style={styles.cardContent}>
        <Text style={[styles.description, getDescriptionStyle()]}>
          {props.data.task}
        </Text>
      </View>
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
