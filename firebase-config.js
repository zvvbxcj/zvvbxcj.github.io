const firebaseConfig = {
    apiKey: "AIzaSyBQs-PrzkEl40MAkfqWTC6hspQCJ1vR-WE",
    authDomain: "axio-yes.firebaseapp.com",
    projectId: "axio-yes",
    storageBucket: "axio-yes.firebasestorage.app",
    messagingSenderId: "560089412720",
    appId: "1:560089412720:web:d0220ae3d33a3c11b7f0b5"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const USER_COLLECTION = 'axioUsers';