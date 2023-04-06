import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Switch,
  Platform,
} from "react-native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { auth, firestore } from "../../firebase";
import { useNavigation } from "@react-navigation/core";
import NetInfo from "@react-native-community/netinfo";
import { COLORS } from "../../constants/COLORS";
import { CheckBox } from "@rneui/themed";
import { Overlay } from "@rneui/themed";
import { ScrollView } from "react-native";
import { Dimensions } from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [username, setUsername] = useState("");
  const navigation = useNavigation();
  const [isThereWifi, setIsThereWifi] = useState(true);
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);
  const [isTermsAndServicesAccepted, setIsTermsAndServicesAccepted] =
    useState(false);
  const [isOverlayOn, setIsOverlayOn] = useState(false);

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

    if (!isTermsAndServicesAccepted) {
      Alert.alert("Error", "You must accept the terms and services");
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
              notifications: [],
              description: "",
              usersTalkedTo: [],
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
          secureTextEntry={true}
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

        <View
          style={{
            paddingVertical: 5,
            flexDirection: "row",
            alignSelf: "flex-start",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={() => setIsOverlayOn(true)} style={{}}>
            <Text>
              Accept{" "}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#0000FF",
                }}
              >
                terms and services
              </Text>
            </Text>
          </TouchableOpacity>

          <CheckBox
            checked={isTermsAndServicesAccepted}
            onPress={() =>
              setIsTermsAndServicesAccepted(!isTermsAndServicesAccepted)
            }
            size={30}
          />
        </View>

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

      <Overlay
        isVisible={isOverlayOn}
        onBackdropPress={() => setIsOverlayOn(false)}
      >
        <View
          style={{
            height: Dimensions.get("window").height * 0.7,
            width: Dimensions.get("window").width * 0.9,
          }}
        >
          <Text
            style={{ fontSize: 26, fontWeight: "bold", alignSelf: "center" }}
          >
            Terms and Services
          </Text>
          <ScrollView
            style={{
              borderRadius: 5,
              backgroundColor: "white",
              elevation: 5,
            }}
          >
            <Text style={styles.termsAndServices}>
              As a user of this platform, you agree to communicate with others
              in a respectful and appropriate manner. Any behavior that is
              considered abusive, harassing, threatening, or otherwise
              inappropriate towards other users or our staff will not be
              tolerated. This includes, but is not limited to, using hate
              speech, making derogatory comments, or engaging in any other form
              of discrimination.
            </Text>
            <Text style={styles.termsAndServices}>
              By using this platform, you acknowledge and agree that any content
              or communication that you submit is your sole responsibility. We
              are not responsible for any content posted by users on this
              platform, and we reserve the right to remove any content or
              communication that we deem to be inappropriate.
            </Text>

            <Text style={styles.termsAndServices}>
              We reserve the right to take any necessary action, including but
              not limited to, suspending or terminating your account, if we
              determine that your behavior on this platform violates these terms
              and services.
            </Text>
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 10,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary,
                borderWidth: 1,
                borderRadius: 5,
                elevation: 4,
                alignItems: "center",
              }}
              onPress={() => setIsOverlayOn(false)}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary,
                borderWidth: 1,
                borderRadius: 5,
                elevation: 4,
                alignItems: "center",
              }}
              onPress={() => {
                setIsTermsAndServicesAccepted(true);
                setIsOverlayOn(false);
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                }}
              >
                Accept
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Overlay>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  termsAndServices: {
    paddingTop: 10,
    fontSize: Platform.OS === "ios" ? 18 : 16,
    paddingHorizontal: 5,
  },
  forIOS: {
    borderRadius: 5,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
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
