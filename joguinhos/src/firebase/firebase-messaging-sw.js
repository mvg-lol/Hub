importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
    apiKey: "AIzaSyC7kZlJzHaUmQVUWFLW_QRZ48gOQ4vqvOA",
    authDomain: "mvg-lol.firebaseapp.com",
    projectId: "mvg-lol",
    storageBucket: "mvg-lol.appspot.com",
    messagingSenderId: "232319448366",
    appId: "1:232319448366:web:ae6ab9e476f837e633b6bf",
    measurementId: "G-WLMK9WRGVG",
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log("Received background message ", payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});