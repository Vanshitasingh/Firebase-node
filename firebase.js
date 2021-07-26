const firebase = require("firebase");

const db = firebase.initializeApp({
    apiKey: process.env.API_KEY1,
    authDomain: process.env.AUTH,
    projectId: process.env.PROJECT_ID,
});


module.exports = db;