//
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ListingsDB = require("./modules/listingsDB.js");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const db = new ListingsDB();

db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server listening on: ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });

//Server Check
app.get('/', (req, res) => {
  res.json({ message: "DATABASE TEST" });
});

//Add a new listing
app.post('/api/listings', (req, res) => {
  console.log("Received data for new listing:", req.body); // Log the received data
  db.addNewListing(req.body)
    .then((newListing) => {
      res.status(201).json(newListing);
    })
    .catch((err) => {
      console.error("Error adding listing:", err); 
      res.status(500).json({ message: "Unable to add listing", error: err.message });
    });
});

//Get listings with optional pagination and filtering by name
app.get('/api/listings', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const name = req.query.name || null;

  db.getAllListings(page, perPage, name)
    .then((listings) => {
      res.status(200).json(listings);
    })
    .catch((err) => {
      console.error("Error retrieving listings:", err);
      res.status(500).json({ message: "Unable to retrieve listings", error: err.message });
    });
});

//Get a specific listing by ID
app.get('/api/listings/:id', (req, res) => {
  db.getListingById(req.params.id)
    .then((listing) => {
      if (listing) {
        res.status(200).json(listing);
      } else {
        res.status(404).json({ message: "Listing not found" });
      }
    })
    .catch((err) => {
      console.error("Error retrieving listing by ID:", err);
      res.status(500).json({ message: "Unable to retrieve listing", error: err.message });
    });
});

//Update a listing by ID
app.put('/api/listings/:id', (req, res) => {
  db.updateListingById(req.body, req.params.id)
    .then((result) => {
      if (result.nModified > 0) {
        res.status(200).json({ message: "Listing updated successfully" });
      } else {
        res.status(404).json({ message: "Listing not found or no changes made" });
      }
    })
    .catch((err) => {
      console.error("Error updating listing:", err); 
      res.status(500).json({ message: "Unable to update listing", error: err.message });
    });
});

//Delete a listing by ID
app.delete('/api/listings/:id', (req, res) => {
  db.deleteListingById(req.params.id)
    .then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Listing deleted successfully" });
      } else {
        res.status(404).json({ message: "Listing not found" });
      }
    })
    .catch((err) => {
      console.error("Error deleting listing:", err); 
      res.status(500).json({ message: "Unable to delete listing", error: err.message });
    });
});
