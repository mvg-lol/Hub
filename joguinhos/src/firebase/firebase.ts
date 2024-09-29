// Import the functions you need from the SDKs you need
import { FirebaseOptions, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyC7kZlJzHaUmQVUWFLW_QRZ48gOQ4vqvOA",
    authDomain: "mvg-lol.firebaseapp.com",
    projectId: "mvg-lol",
    storageBucket: "mvg-lol.appspot.com",
    messagingSenderId: "232319448366",
    appId: "1:232319448366:web:ae6ab9e476f837e633b6bf",
    measurementId: "G-WLMK9WRGVG",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const messaging = getMessaging();
const userIsMartinho = (uid: string) => Object.values(UIDsMartinho).filter(uidE => uidE === uid).length > 0

navigator.serviceWorker.register('/joguinhos/firebase/firebase-messaging-sw.js')
    .then((registration)=>{
        console.log(messaging, registration, "boas")
        //messaging.useServiceWorker(registration)
    })
    .catch((err)=>{
        console.log("erro", err)
    })

export const myFirebase = {
    app: firebaseApp,
    analytics: analytics,
    auth: auth,
    db: db,
    messaging: messaging,
    userIsMartinho: userIsMartinho
} 

export enum UIDsMartinho {
    Github = 'dkLZpTnrESPTGw5YbQuIdxsKFIm2',
    Email = 'IvLqUzTDgefh29eaQ7Qf1lWoiVS2',
}

