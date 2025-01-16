const Listing = require('../models/listing');
const User = require('../models/users');
module.exports.index = async (req,res) => {
    const allListings = await Listing.find();
    res.render("./listings/index.ejs",{allListings});
}
module.exports.renderNewForm = (req,res) => {
    console.log(req.user);
    res.render("./listings/new.ejs");
}
module.exports.showListing = async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews", populate: {path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing not found!!");
        res.redirect("/listing");
    }
    console.log(listing.owner);
    res.render("./listings/show.ejs",{listing});
}
module.exports.createListing = async (req,res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url,"..",filename);
    const newListing = new Listing(req.body.listing);
    console.log(req.user);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    await newListing.save();
    req.flash("success","New listing created!");
    res.redirect("/listing");
}
module.exports.renderEditForm = async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing not found!!");
        res.redirect("/listing");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("./listings/edit.ejs",{listing,originalImageUrl});
}
module.exports.updateListing = async (req,res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file!= "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    req.flash("success","listing updated");
    res.redirect(`/listing/${id}`);
}
module.exports.destroyListing = async (req,res) => {
    let { id } = req.params;
    let deletedList = await Listing.findByIdAndDelete(id);
    req.flash("success","Existing Listing deleted!");
    res.redirect("/listing");
}
