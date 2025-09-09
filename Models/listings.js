const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
        filename: { type: String, default: "listingimage" },
        url: { 
            type: String, 
            default: "C:\\Users\\Yugandhar Paulbudhe\\Desktop\\fullstack_project\\Models\\Default.jpeg",
            set: function(v) {
            return v === "" 
                ? "C:\\Users\\Yugandhar Paulbudhe\\Desktop\\fullstack_project\\Models\\Default.jpeg" 
                : v;
            }
        }
    },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    country: { type: String, required: true }
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;