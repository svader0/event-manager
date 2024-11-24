const express = require("express");
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
var cors = require("cors");
const bodyParser = require("body-parser");

const db = require('./database');

// Create the Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize database and tables on startup
db.databaseInit();

/** 
 *  POST REQUESTS ========================================================================
 */

app.post("/event", (req, res) => {
  console.log("post event: here is what is in req.body:");
  console.log(req.body);
  db.database_commands.insertEvent(req, res);
  res.end();
});
app.post("/user", (req, res) => {
  console.log("post user: here is what is in req.body:");
  console.log(req.body);
  db.database_commands.insertUser(req, res);
  res.end();
});
app.post("/review", (req, res) => {
  console.log("post review: here is what is in req.body:");
  console.log(req.body);
  db.database_commands.insertReview(req, res);
  res.end();
});
app.post("/location", (req, res) => {
  console.log("post location: here is what is in req.body:");
  console.log(req.body);
  db.database_commands.insertLocation(req, res);
  res.end();
});
app.post("/ticket", (req, res) => {
  console.log("post ticket: here is what is in req.body:");
  console.log(req.body);
  db.database_commands.insertTicket(req, res);
  res.end();
});


/**
 *  GET REQUESTS ========================================================================
 */

app.get("/event", (req, res) => {
  console.log("Received a GET request for all events");
  db.database_commands.getEvents(req, res);
});
app.get("/event/:id", (req, res) => {
  const eventId = req.params.id;
  console.log("Received a GET request for event with id:", eventId);
  db.database_commands.getEventById(eventId, res);
});
app.get("/ticket", (req, res) => {
  console.log("Received a GET request for all tickets");
  db.database_commands.getTickets(req, res);
});
app.get("/event/:id/review", (req, res) => {
  const eventId = req.params.id;
  console.log("Received a GET request for all tickets");
  db.database_commands.getEventReviews(eventId, res);
});
app.get("/user/:id", (req, res) => {
  const userId = req.params.id;
  console.log("Received a GET request for user with id:", userId);
  db.database_commands.getUserByID(userId, res);
});
app.get("/location/:id", (req, res) => {
  const locationId = req.params.id;
  console.log("Received a GET request for location with id:", locationId);
  db.database_commands.getLocationByID(locationId, res);
});
app.get("/location", (req, res) => {
  console.log("Received a GET request for all locations");
  db.database_commands.getLocations(req, res);
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});