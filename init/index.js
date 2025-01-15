if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const mongoose = require("mongoose");
const initData = require("../init/data.js");

const myDB_URL = process.env.ATLASDB_URL;
const Listing = require("../models/listing.js");
main()
    .then(()=>{
        console.log("connected to database");
    })
    .catch(err => console.log(err));
async function main() {
  await mongoose.connect(myDB_URL);
}
const initDb = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj, owner:"6784ce6c70b2d7c66ecc3e2a",
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
}
initDb();
