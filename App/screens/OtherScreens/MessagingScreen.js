import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useState, useEffect } from "react";
import * as firebase from "firebase";
import ChatPart from "./ChatApp";

export default function MessagingScreen() {
  return (
    <View>
      <ChatPart />
    </View>
  );
}

const styles = StyleSheet.create({});
