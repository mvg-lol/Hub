importScripts(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

(function (self) {
    let messaging;

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
    messaging = firebase.messaging();


    self.addEventListener("push", function (event) {
        messaging.onBackgroundMessage((payload) => {
            const {
                data: { title, body, actionUrl, icon },
            } = payload;

            const notificationOptions = {
                body,
                icon,
                data: {
                    actionUrl,
                },
            };

            const promiseChain = new Promise((resolve) => {
                self.registration
                    .showNotification(title, notificationOptions)
                    .then(() => resolve());
            });

            event.waitUntil(promiseChain);
        });
    });

    self.addEventListener("notificationclick", (event) => {
        const { notification } = event;
        const {
            data: { actionUrl },
        } = notification;

        event.notification.close();

        event.waitUntil(
            clients
                .matchAll({ type: "window", includeUncontrolled: true })
                .then((clientsArr) => {
                    // If a Window tab matching the targeted URL already exists, focus that;
                    const hadWindowToFocus = clientsArr.some((windowClient) => {
                        windowClient.url === actionUrl
                            ? (windowClient.focus(), true)
                            : false;
                    });

                    // Otherwise, open a new tab to the applicable URL and focus it.
                    if (!hadWindowToFocus) {
                        return clients.openWindow(actionUrl);
                    }
                })
        );
    });
})(self);
