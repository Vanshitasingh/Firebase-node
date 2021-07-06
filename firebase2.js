const firebase = require("firebase");

const secondaryAppConfig = {
    apiKey: "AIzaSyBSqjz5T8amyptZTCTy8zwFD3wOxBQBqAY",
    authDomain: "wizdom-bed4a.firebaseapp.com",
    databaseURL: "https://wizdom-bed4a.firebaseio.com",
    projectId: "wizdom-bed4a",
};

const secondarydb = firebase.initializeApp(secondaryAppConfig, "secondary");

module.exports = secondarydb;