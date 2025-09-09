    const express = require('express');
    const app = express();
    const mongoose = require('mongoose');
    const Listing = require('./Models/listings.js');
    const path = require('path');
    const methodOverride = require('method-override');
    const ejsMate = require('ejs-mate');

    main().then(() =>{
        console.log("Connected to MongoDB");
    }).catch(err => {
        console.error("Error connecting to MongoDB", err);
    });

    async function main(){
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
    app.get("/listings", async (req, res) => {
        try {
            const allListings = await Listing.find({});
            res.render("index.ejs", { listings: allListings });
        } catch (err) {
            console.error("Error fetching listings", err);
            res.status(500).send("Internal Server Error");
        }
    });

    // create new listing form
    app.get("/listings/new", (req, res) => {
        res.render("new.ejs");
    });

    // create new listing
    app.post("/listings", async (req, res) => {
        try {
            const newlisting = new Listing(req.body.Listing);
            await newlisting.save();
            console.log(newlisting);
            res.redirect("/listings");
        } catch (err) {
            console.error("Error creating listing", err);
            res.status(500).send("Internal Server Error");
        }
    });

    // edit listings
    app.get("/listings/:id/edit", async (req, res) => {
        try {
            const listing = await Listing.findById(req.params.id);
            if (!listing) {
                return res.status(404).send("Listing not found");
            }
            res.render("edit.ejs", { listing });
        } catch (err) {
            console.error("Error fetching listing", err);
            res.status(500).send("Internal Server Error");
        }
    });

    // update listing
    app.put("/listings/:id", async (req, res) => {
        try {
            const listing = await Listing.findByIdAndUpdate(req.params.id, { ...req.body.listing });
            if (!listing) {
                return res.status(404).send("Listing not found");
            }
            res.redirect(`/listings/${listing._id}`);
        } catch (err) {
            console.error("Error updating listing", err);
            res.status(500).send("Internal Server Error");
        }
    });

    // delete listings
    app.delete("/listings/:id", async (req, res) => {
        try {
            const listing = await Listing.findByIdAndDelete(req.params.id);
            if (!listing) {
                return res.status(404).send("Listing not found");
            }
            res.redirect("/listings");
        } catch (err) {
            console.error("Error deleting listing", err);
            res.status(500).send("Internal Server Error");
        }
    });

    // show listing details
    app.get("/listings/:id", async (req, res) => {
        try {
            const listing = await Listing.findById(req.params.id);
            if (!listing) {
                return res.status(404).send("Listing not found");
            }
            res.render("show.ejs", { listing });
        } catch (err) {
            console.error("Error fetching listing", err);
            res.status(500).send("Internal Server Error");
        }
    });

    app.listen(7070, () => {
    console.log("server is listening to port 7070");
    });