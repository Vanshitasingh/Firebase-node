const firebase = require("firebase");

const secondaryAppConfig = {
    apiKey: process.env.API_KEY2,
    authDomain: process.env.AUTH2,
    databaseURL: process.env.DB2,
    projectId: process.env.PROJECT_ID2,
};

const secondarydb = firebase.initializeApp(secondaryAppConfig, "secondary");

module.exports = secondarydb;