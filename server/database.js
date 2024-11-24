const express = require("express");
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
var cors = require("cors");
const bodyParser = require("body-parser");

// Create a connection to the MySQL database
const mysqlConfig = {
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || "3306",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "pass123",
  database: process.env.DB_NAME || "appdb",
};

let con = null;
const databaseInit = () => {
  con = mysql.createConnection(mysqlConfig);
  con.connect((err) => {
    if (err) {
      console.error("Error connecting to the database: ", err);
      return;
    }
    console.log("Connected to the database");
  });
};

const checkDB = () => {
  // make sure we have a connection to the database
  if (!con) {
    databaseInit();
  }
};

const database_commands = {

  /** 
   *  INSERT INTO DATABASE ========================================================================
   */
  insertEvent: (req, res) => {
    checkDB();
    console.log("insertEvent: here is the req.body:");
    console.log(req.body);
    console.log("insertEvent: here is the req.body.event_name:");
    console.log(req.body.event_name);
    con.query(
      "INSERT INTO event (organizer, category, description, price, name, date, location_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.body.organizer, req.body.category, req.body.description, req.body.price, req.body.name, req.body.date, req.body.location_id],
      (err, results) => {
        if (err) {
          console.error(err);
          if (!res.headersSent) {
            res.status(500).send("Error inserting data into database: " + err);
          }
        } else {
          if (!res.headersSent) {
            res.json(results);
          }
        }
      }
    );
  },
  insertUser: (req, res) => {
    checkDB();
    con.query(
      "INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
      [req.body.first_name, req.body.last_name, req.body.email, req.body.password],
      (err, results) => {
        if (err) {
          console.error(err);
          //res.status(500).send("Error inserting data into database: " + err);
        } else {
          //res.json(results);
        }
      }
    );
  },
  insertLocation: (req, res) => {
    checkDB();
    con.query(
      "INSERT INTO location (name, address, seats) VALUES (?, ?, ?)",
      [req.body.name, req.body.address, req.body.seats],
      (err, results) => {
        if (err) {
          console.error(err);
          //res.status(500).send("Error inserting data into database: " + err);
        } else {
          //res.json(results);
        }
      }
    );
  },
  insertReview: (req, res) => {
    checkDB();
    con.query(
      "INSERT INTO review (event_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
      [req.body.event_id, req.body.user_id, req.body.rating, req.body.comment],
      (err, results) => {
        if (err) {
          console.error(err);
          //res.status(500).send("Error inserting data into database: " + err);
        } else {
          //res.json(results);
        }
      }
    );
  },
  insertTicket: (req, res) => {
    checkDB();
    con.query(
      "INSERT INTO ticket (event_id, user_id, purchase_date, quantity, amount_paid) VALUES (?, ?, ?, ?, ?)",
      [req.body.event_id, req.body.user_id, req.body.purchase_date, req.body.quantity, req.body.amount_paid],
      (err, results) => {
        if (err) {
          console.error(err);
          // res.status(500).send("Error inserting data into database: " + err);
        } else {
          // res.json(results);
        }
      }
    );
  },

  /**
   *  RETRIEVE FROM DATABASE ========================================================================
   */

  getEvents: (req, res) => {
    checkDB();
    console.log("getEvent is retrieving:");
    con.query("SELECT * FROM event ORDER BY date DESC", (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving data from database: " + err);
      } else {
        console.log("getEvent's results:");
        console.log(results);
        res.json(results);
      }
    });
  },
  getEventById: (id, res) => {
    checkDB();
    con.query("SELECT * FROM event WHERE id = ?", [id], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving event details: " + err);
      } else {
        if (results.length === 0) {
          res.status(404).send("Event not found");
        } else {
          res.json(results[0]);
        }
      }
    });
  },
  getTickets: (req, res) => {
    checkDB();
    con.query("SELECT * FROM ticket", (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving data from database: " + err);
      } else {
        res.json(results);
      }
    });
  },
  getEventReviews: (id, res) => {
    checkDB();
    con.query("SELECT * FROM review WHERE event_id = ?", [id], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving event details: " + err);
      } else {
        if (results.length === 0) {
          res.status(404).send("Event not found");
        } else {
          console.log("Retrieved reviews for eventID: ", id);
          res.json(results);
        }
      }
    });
  },
  getUserByID: (id, res) => {
    checkDB();
    con.query("SELECT * FROM user WHERE id = ?", [id], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving user details: " + err);
      } else {
        if (results.length === 0) {
          res.status(404).send("User not found");
        } else {
          res.json(results[0]);
        }
      }
    });
  },
  getLocationByID: (id, res) => {
    checkDB();
    con.query("SELECT * FROM location WHERE id = ?", [id], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving location details: " + err);
      } else {
        if (results.length === 0) {
          res.status(404).send("Location not found");
        } else {
          res.json(results[0]);
        }
      }
    });
  },
  getLocations: (req, res) => {
    checkDB();
    con.query("SELECT * FROM location", (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving data from database: " + err);
      } else {
        res.json(results);
      }
    });
  }
};

module.exports = { databaseInit, checkDB, database_commands };