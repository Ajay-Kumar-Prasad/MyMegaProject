const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware");
const userController = require("../controllers/users");

router.route("/signup")
.get(userController.renderSignup)
.post(wrapAsync(userController.signUp));

router.route("/login")
.get(userController.renderLogin)
.post(saveRedirectUrl,passport.authenticate('local',{ 
    failureRedirect: '/login',failureFlash: true
}) ,userController.loginUser);

router.get("/logout",userController.logoutUser);

module.exports = router;