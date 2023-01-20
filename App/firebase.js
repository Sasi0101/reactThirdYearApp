// Import the functions you need from the SDKs you need
import * as firebase from "firebase";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7rNCMCy9Fp062o-wm9Nc4FIArdQERrx4",
  authDomain: "third-year-project-4e8dd.firebaseapp.com",
  projectId: "third-year-project-4e8dd",
  storageBucket: "third-year-project-4e8dd.appspot.com",
  messagingSenderId: "968773030192",
  appId: "1:968773030192:web:4e355590ec2e69fbe738f5",
};

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const auth = firebase.auth();

export { auth };
