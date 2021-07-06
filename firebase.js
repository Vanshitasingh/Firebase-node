const firebase = require("firebase");

const db = firebase.initializeApp({
    apiKey: "AIzaSyBoUU7DYxpqOuAEkHgRmfxNFPILD91ybQM",
    authDomain: "firestorenode-706c0.firebaseapp.com",
    projectId: "firestorenode-706c0",
});


module.exports = db;