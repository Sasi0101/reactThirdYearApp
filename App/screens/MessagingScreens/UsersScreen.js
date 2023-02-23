import { StyleSheet, View, FlatList } from "react-native";
import { React, useState, useLayoutEffect } from "react";
import OneUser from "./OneUser";
import { auth, firestore } from "../../firebase";

export default function UsersScreen() {
  const [usersToPrint, setUsersToPrint] = useState([]);

  useLayoutEffect(() => {
    let unsubscribe;

    async function fetchData() {
      unsubscribe = await firestore
        .collection("users")
        .onSnapshot((element) => {
          let userInfo;
          let allUsers = [];
          //find the current user and put the rest in the users
          element.forEach((doc) => {
            if (doc.data().email == auth.currentUser?.email) {
              userInfo = doc.data();
            } else {
              allUsers.push({
                email: doc.data().email,
                username: doc.data().username,
              });
            }
          });

          let finalData = [];

          if (userInfo.usersTalkedTo && userInfo.usersTalkedTo.length !== 0) {
            const idsToFilter = userInfo.usersTalkedTo;
            const filteredData = allUsers.filter((element) => {
              for (const obj of idsToFilter) {
                if (obj.email === element.email) {
                  return false;
                }
              }
              return true;
            });

            finalData = [...userInfo.usersTalkedTo, ...filteredData];
          } else {
            finalData = allUsers;
          }

          setUsersToPrint(finalData);
        });
    }

    fetchData();

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View>
      {usersToPrint.length !== 0 && (
        <FlatList
          data={usersToPrint}
          renderItem={({ item }) => (
            <OneUser username={item.username} email={item.email} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
