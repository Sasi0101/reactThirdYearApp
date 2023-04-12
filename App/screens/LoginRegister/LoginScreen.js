import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { auth } from "../../firebase";
import { useNavigation } from "@react-navigation/core";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../constants/COLORS";

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
    console.log("handeling login ", isThereWifi);
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
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: "https://www.bootdey.com/image/580x580/20B2AA/20B2AA" }}
        style={styles.header}
      >
        <Text style={styles.heading}>Study management application</Text>
      </ImageBackground>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={"gray"}
          value={email}
          onChangeText={(text) => setEmail(text)}
          maxLength={50}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={"gray"}
          secureTextEntry={true}
          maxLength={32}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={changeToRegister}
        >
          <Text style={styles.createAccountButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 20,
    width: "100%",
    height: 200,
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  forgotPasswordButton: {
    width: "100%",
    textAlign: "flex-end",
  },
  forgotPasswordButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    padding: 20,
    marginTop: 40,
    width: "90%",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: "100%",
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  createAccountButton: {
    marginTop: 20,
  },
  createAccountButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default LoginScreen;
