import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { auth, firestore } from "../../firebase";
import { useNavigation } from "@react-navigation/core";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [username, setUsername] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.replace("DrawerNavigator");
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  // Register the user with email and password
  const handleSignUp = () => {
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
    <View style={styles.container} behavior="padding">
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />

        <TextInput
          placeholder="Re-enter password"
          value={password2}
          onChangeText={(text) => setPassword2(text)}
          style={styles.input}
          secureTextEntry
        />

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={(text) => setUsername(text)}
          style={styles.input}
        />
      </View>

      <View style={styles.buttonContainer}>
        {/** Register button */}
        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}> Login </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;

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
