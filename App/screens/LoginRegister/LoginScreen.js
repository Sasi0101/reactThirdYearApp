import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { auth } from "../../firebase";
import { useNavigation } from "@react-navigation/core";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const maxUsernameLength = 50;
  const maxPasswordLength = 36;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isThereWifi, setIsThereWifi] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    let unsubscribe;

    //check if there is someone logged in
    if (isThereWifi) {
      unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          navigation.navigate("DrawerNavigator");
        }
      });
    } else {
      Alert.alert("Network error", "There is no connection to the internet");
    }

    return unsubscribe;
  }, [isThereWifi]);

  useLayoutEffect(() => {
    const unsubsribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        setIsThereWifi(true);
      } else {
        setIsThereWifi(false);
      }
    });

    return unsubsribe;
  }, []);

  const handleLogin = () => {
    if (!isThereWifi) {
      Alert.alert("Network error", "There is no connection to the internet");
      return;
    }

    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
      })
      .catch((error) => console.log(error.message));
  };

  const changeToRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <>
      <View style={styles.container} behavior="padding">
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.input}
            maxLength={50}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.input}
            secureTextEntry
            maxLength={32}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}> Login </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={changeToRegister}
            style={[styles.button, styles.buttonOutline]}
          >
            <Text style={styles.buttonOutlineText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    width: "80%",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  button: {
    backgroundColor: "#0782F9",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "white",
    marginTop: 5,
    borderColor: "#0782F9",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "#0782F9",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default LoginScreen;
