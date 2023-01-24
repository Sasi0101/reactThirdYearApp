import { useEffect } from "react";
import { auth, firestore } from "../../firebase";

export default function MyComponent() {
  let [previousData, setPreviousData] = useState({});

  useEffect(() => {
    console.log("userinfo");

    const unsubscribe = firestore
      .collection("users")
      .doc(auth.currentUser?.email)
      .onSnapshot((doc) => {
        const data = doc.data();
        if (data.username !== previousData.username) {
          setPreviousData(data);
        }
      });
    return () => unsubscribe();
  }, []);
}
