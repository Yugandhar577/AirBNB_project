const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./Models/listings.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/expressError.js');
const listingSchema = require('./schema.js');

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

// Middleware for validation
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    }
    next();
};

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

// create new listing with validation
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    const newlisting = new Listing(req.body.Listing);
    await newlisting.save();
    res.redirect("/listings");
}));

// edit listing form
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError("Listing not found", 404);
    }
    res.render("edit.ejs", { listing });
}));

// update listing with validation
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { ...req.body.Listing });
    if (!listing) {
        throw new ExpressError("Listing not found", 404);
    }
    res.redirect(`/listings/${listing._id}`);
}));

// delete listing
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
        throw new ExpressError("Listing not found", 404);
    }
    res.redirect("/listings");
}));

// show listing details
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError("Listing not found", 404);
    }
    res.render("show.ejs", { listing });
}));

// catch-all 404
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { statusCode, message });
});

app.listen(7070, () => {
    console.log("server is listening to port 7070");
});
