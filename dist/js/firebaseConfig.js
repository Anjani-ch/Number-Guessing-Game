const firebaseConfig = {
    apiKey: "AIzaSyBvEL47ZfTPPTvkQY1fg34hi3qNa0vL8oc",
    authDomain: "guessinggame-6e213.firebaseapp.com",
    projectId: "guessinggame-6e213",
    storageBucket: "guessinggame-6e213.appspot.com",
    messagingSenderId: "977661724873",
    appId: "1:977661724873:web:854a844dd0bf1a38756518"
};

firebase.initializeApp(firebaseConfig);

const DB = firebase.firestore()