// Firebase Configuration
// Replace these with your actual Firebase project credentials
const firebaseConfig = {
    apiKey: "AIzaSyD5b3ZFO1DKvNOxwV-qltHve-eiNXLIVpg",
    authDomain: "seizure-tracking-app.firebaseapp.com",
    projectId: "seizure-tracking-app",
    storageBucket: "seizure-tracking-app.firebasestorage.app",
    messagingSenderId: "205059241434",
    appId: "1:205059241434:web:8bdb38943206097ca8bce3",
    measurementId: "G-XSQ89CDH33"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
