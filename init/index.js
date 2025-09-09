const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing = require('../Models/listings.js');
main().then(() =>{
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("Error connecting to MongoDB", err);
});

async function main(){
    await mongoose.connect('mongodb://localhost:27017/FullStackAIRBNB');
}

async function initdb() {
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log("Database initialized");
}

main()
  .then(() => initdb())
  .catch(err => {
    console.error("Error connecting to MongoDB", err);
});