import { StyleSheet, View, FlatList } from "react-native";
import { React, useEffect, useState } from "react";
import OneUser from "./OneUser";
import { auth, firestore } from "../../firebase";

export default function UsersScreen() {
  const [usersToPrint, setUsersToPrint] = useState(null);

  useEffect(() => {
    const usersRef = firestore
      .collection("users")
      .where("email", "!=", auth.currentUser?.email);

    usersRef.onSnapshot((element) => {
      let users = [];
      element.forEach((doc) => {
        users.push(doc.data());
      });
      setUsersToPrint(users);
    });
  }, []);

  return (
    <View>
      <FlatList
        data={usersToPrint}
        renderItem={({ item }) => (
          <OneUser username={item.username} email={item.email} />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
