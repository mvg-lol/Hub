// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth/*, createUserWithEmailAndPassword*/ } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC7kZlJzHaUmQVUWFLW_QRZ48gOQ4vqvOA",
    authDomain: "mvg-lol.firebaseapp.com",
    projectId: "mvg-lol",
    storageBucket: "mvg-lol.appspot.com",
    messagingSenderId: "232319448366",
    appId: "1:232319448366:web:ae6ab9e476f837e633b6bf",
    measurementId: "G-WLMK9WRGVG"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const auth = getAuth();
const db = getFirestore(firebaseApp);

const myFirebase = {
    app: firebaseApp,
    analytics: analytics,
    auth: auth,
    db: db,
} 

export default myFirebase 