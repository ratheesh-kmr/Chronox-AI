const mongoose = require("mongoose");

const url =
  "mongodb+srv://xplorecodebases:Xplore123@xplorecodebases.tbbuc.mongodb.net/TaskManager?retryWrites=true&w=majority&appName=Xplorecodebases";

const connectionParams = {
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 45000,
};

const connectToDatabase = async () => {
  try {
    await mongoose.connect(url, connectionParams);
    console.log("connect to the database");
  } catch (err) {
    console.log(`Error Connecting database : /n ${err}`);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
