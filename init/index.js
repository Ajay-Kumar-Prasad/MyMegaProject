require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require("mongoose");
const myDbUrl = process.env.ATLASDB_URL;
const initData = require("../init/data.js");
const Listing = require("../models/listing.js");
main()
    .then(()=>{
        console.log("connected to database");
    })
    .catch(err => console.log(err));
async function main() {
  await mongoose.connect(myDbUrl);
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
