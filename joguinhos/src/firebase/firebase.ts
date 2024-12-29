// Import the functions you need from the SDKs you need
import { FirebaseOptions, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, MessagePayload, Messaging, onMessage } from "firebase/messaging";
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
const messaging = getMessaging(firebaseApp);
const userIsMartinho = (uid: string) => Object.values(UIDsMartinho).filter(uidE => uidE === uid).length > 0


// obrigado https://medium.com/@ali.tavafii/setting-up-firebase-cloud-messaging-for-web-push-notifications-client-side-guide-803257fa13ea
export const activateNotifications = async function (window: Window & typeof globalThis) {
    const registerServiceWorker = async () => {
        try {
            const swOptions: RegistrationOptions = {
                type: "classic",
                scope: "/",
            };

            const sw = await window.navigator.serviceWorker.register(`/joguinhos/firebase-messaging-sw.js`, swOptions);
            await sw.update()
            return sw
        } catch (error) {
            // Oops. Registration was unsucessfull
            console.error("Can not register service worker", error);
        }
    }; 
    const requestPermission = async (messaging: Messaging) => {
        try {
            const permission = await window.Notification.requestPermission();

            if (permission === "granted") {
                const serviceWorkerRegistration = await registerServiceWorker();

                return getToken(messaging, {
                    serviceWorkerRegistration: serviceWorkerRegistration,
                    vapidKey: "BM5gIIdhEpJ9JhU1uijArmRduwPCd2VCHDBvQrGAoRHcWRR0ePRdhzq9IOfegAOnAc5tBIIS7mkr63IyxjV7SaY",
                })
                    .then((token) => {
                        // Generated a new FCM token for the client
                        // You can send it to server, e.g. fetch('your.server/subscribe', { token });
                        // And store it for further usages (Server, LocalStorage, IndexedDB, ...)
                        // For example:
                        console.log(token)
                        window.localStorage.setItem("fcm_token", token);
                    })
                    .catch((err) => {
                        console.error("Unable to get FCM Token", err);
                    });
            } else {
                console.error("Unable to grant permission", permission);
            }
        } catch (error) {
            console.error("Unable to request permission", error);
        }
    };

    const checkIfTokenIsNotGeneratedBefore = () =>
        !window.localStorage.getItem("fcm_token");

    if (checkIfTokenIsNotGeneratedBefore()) {
        await requestPermission(messaging);
    }

    const showNotification = (payload: MessagePayload) => {
        if (payload.data === undefined) {
            console.log("payload.data undefined", payload)
            return
        }
        const {
            // It's better to send notifications as Data Message to handle it by your own SDK
            // See https://firebase.google.com/docs/cloud-messaging/concept-options#notifications_and_data_messages
            data: { title, body, actionUrl, icon },
        } = payload;

        // See https://developer.mozilla.org/docs/Web/API/Notification
        const notificationOptions = {
            body,
            icon,
        };
        const notification = new window.Notification(title, notificationOptions);

        notification.onclick = (event) => {
            event.preventDefault(); // prevent the browser from focusing the Notification's tab
            window.open(actionUrl, "_blank")?.focus();
        };
    };

    // ...

    onMessage(messaging, (payload) => {
        showNotification(payload);
    });
}

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
    GithubVicente = '33wirV2uLFdV1eDdITiiSYs5zAH3',
}

