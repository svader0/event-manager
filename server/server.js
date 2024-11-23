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
app.use(express.json())
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

/** 
 *  POST REQUESTS ========================================================================
 */
app.post("/event", (req, res) => {
    console.log("post event: here is what is in req.body:");
    console.log(req.body);
    db.insertEvent(req,res);
    res.end();
});

/**
 *  GET REQUESTS ========================================================================
 */

app.get("/event", (req, res) => {
  console.log("get event");
  db.getEvent(req,res);
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});