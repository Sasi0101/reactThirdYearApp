import { auth, firestore } from "../../firebase";

export const getUsername = async () => {
  const userDoc = await firestore
    .collection("users")
    .doc(auth.currentUser?.email)
    .get();
  //username = userDoc.data().username
  console.log(userDoc.data().username);
  return JSON.stringify(userDoc.data().username);
};
