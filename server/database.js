const express = require("express");
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
var cors = require("cors");
const bodyParser = require("body-parser");

// Create the Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

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

// Initialize database and tables on startup
databaseInit();

const database_commands = {

/** 
 *  INSERT INTO DATABASE ========================================================================
 */
insertEvent: (req,res) => {
  console.log("insertEvent: here is the req.body:");
  console.log(req.body);
  console.log("insertEvent: here is the req.body.event_name:");
  console.log(req.body.event_name);
  con.query(
    "INSERT INTO eventtest (name) VALUES (?)",
    [req.body.event_name],
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

/**
 *  RETRIEVE FROM DATABASE ========================================================================
 */

getEvent: (req, res) => {
  console.log("getEvent is retrieving:");
  con.query("SELECT * FROM eventtest", (err, results) => {
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

};

module.exports = database_commands;