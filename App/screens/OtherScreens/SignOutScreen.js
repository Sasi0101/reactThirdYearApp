import { StyleSheet, Text, View } from "react-native";
import { auth } from "../../firebase";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

export default function SignOutScreen() {
  const navigation = useNavigation();

  return useEffect(() => {
    console.log("Signing out");
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => alert(error.message));
  }, []);
}

const styles = StyleSheet.create({});
