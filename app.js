if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const myDB_URL = process.env.ATLASDB_URL;
const path = require("path");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const ejsMate = require("ejs-mate");
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const listingRouter = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");
const { resolveAny } = require("dns");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users.js");

main()
    .then(()=>{
        console.log("connected to database");
    })
    .catch(err => console.log(err));
async function main() {
  await mongoose.connect(myDB_URL);
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));

const store = MongoStore.create({
    mongoUrl: myDB_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});
store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE",err);
});
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};
// app.get("/",(req,res) => {
//     res.send("welcome to our app!");
// });

app.use(session(sessionOptions));
app.use(flash());

//implementing authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //user data stored! in context of session
passport.deserializeUser(User.deserializeUser()); // user data removed! (session)

//obtaining flash messages
app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})
// app.get("/demoUser", async (req,res) => {
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"delta-student",
//     });
//     let registerdUser = await User.register(fakeUser,"helloworld"); //to registerr with given password
//     res.send(registerdUser);
// })

app.use("/listing",listingRouter);
app.use("/listing/:id/reviews",reviews);
app.use("/",user);

app.all("*",(req,res,next) => {
    next(new ExpressError(500,"Page not found!"))
})
app.use((err,req,res,next) => {
    let { statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
    
});
app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});


// app.get("/testListing",async (req,res) => {
//     let sampleListing = new Listing({
//         title:"My New Villa",
//         description:"Beaultiful Lake",
//         price:1200,
//         location:"Kerela"
//     });

//     await sampleListing.save();
//     console.log("sampe was saved!");
//     res.send("succesful testing");
// })