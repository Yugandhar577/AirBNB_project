const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./Models/listings.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/expressError.js');

main().then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("Error connecting to MongoDB", err);
});

async function main() {
    await mongoose.connect('mongodb://localhost:27017/FullStackAIRBNB');
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// index route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("index.ejs", { listings: allListings });
}));

// create new listing form
app.get("/listings/new", (req, res) => {
    res.render("new.ejs");
});

// create new listing
app.post("/listings", wrapAsync(async (req, res) => {
    if(!req.body.Listing) throw new ExpressError("Invalid Listing Data", 400);
    const newlisting = new Listing(req.body.Listing);
    await newlisting.save();
    res.redirect("/listings");
}));

// edit listing form
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.render("edit.ejs", { listing });
}));

// update listing
app.put("/listings/:id", wrapAsync(async (req, res) => {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { ...req.body.listing });
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.redirect(`/listings/${listing._id}`);
}));

// delete listing
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.redirect("/listings");
}));

// show listing details
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.render("show.ejs", { listing });
}));

// error handler
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    let {statusCode=500, message="Something went wrong!"} = err;
    // res.status(statusCode).send(message);
    res.render("error.ejs", { statusCode, message });
});

app.listen(7070, () => {
    console.log("server is listening to port 7070");
});
