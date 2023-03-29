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
import { auth, firestore } from "../../firebase";
import { useNavigation } from "@react-navigation/core";
import NetInfo from "@react-native-community/netinfo";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [username, setUsername] = useState("");
  const navigation = useNavigation();
  const [isThereWifi, setIsThereWifi] = useState(true);
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);

  useLayoutEffect(() => {
    const unsubsribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        setIsThereWifi(true);
      } else {
        setIsThereWifi(false);
      }
    });

    return unsubsribe();
  }, []);

  useEffect(() => {
    let unsubscribe;
    if (isThereWifi) {
      unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          navigation.replace("DrawerNavigator");
        }
      });
    } else {
      Alert.alert("Network error", "There is no connection to the internet");
    }
    return unsubscribe;
  }, []);

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  // Register the user with email and password
  const handleSignUp = () => {
    if (!isThereWifi) {
      Alert.alert("Network error", "There is no connection to the internet");
      return;
    }

    email == "" || password == "" || password2 == "" || username == ""
      ? Alert.alert("Error", "All inputs must be filled out!")
      : password != password2
      ? Alert.alert("Error", "Passwords are not matching!")
      : auth
          .createUserWithEmailAndPassword(email, password)
          .then((userCredentials) => {
            const user = userCredentials.user;
            const newUser = {
              email: email,
              groups_created: [],
              groups_joined: [],
              username: username,
            };

            firestore
              .collection("users")
              .doc(email)
              .set(newUser)
              .then(() => {
                console.log("user added successfully");
              })
              .catch((error) => {
                console.error(
                  "Error at adding the new user to database ",
                  error
                );
              });
          })
          .catch((error) => alert(error.message));
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          maxLength={50}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => setPassword(text)}
          maxLength={32}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          value={password2}
          onChangeText={(text) => setPassword2(text)}
          maxLength={32}
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={(text) => setUsername(text)}
          maxLength={24}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={handleLogin}
        >
          <Text style={styles.createAccountButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#20B2AA",
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
    color: "#20B2AA",
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
    backgroundColor: "#20B2AA",
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
    color: "#20B2AA",
    fontSize: 12,
    fontWeight: "bold",
  },
});
