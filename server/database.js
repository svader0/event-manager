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
		con.query(
			"INSERT INTO event (organizer, category, description, price, name, date, time, location_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			[req.body.organizer, req.body.category, req.body.description, req.body.price, req.body.name, req.body.date, req.body.time, req.body.location_id],
			(err, results) => {
				if (err) {
					console.error(err);
					if (!res.headersSent) {
						res.status(500).send("Error inserting data into database: " + err);
					}
				} else {
					if (!res.headersSent) {
						res.json({ success: true, results });
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
					res.status(500).send("Error inserting data into database: " + err);
				} else {
					res.json(results);
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
					res.status(500).send("Error inserting data into database: " + err);
				} else {
					res.json(results);
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
					if (err.sqlState === "45000") {
						console.log("Sending 400 response");
						return res.status(400).send("You cannot leave a review for an event you have not attended.");
					}
					console.log("Sending 500 response");
					return res.status(500).send("Error inserting data into database: " + err);
				}
				console.log("Sending 200 response");
				res.json(results);
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
					console.log("Sending 500 response");
					return res.status(500).send("Error inserting data into database: " + err);
				}
				console.log("Sending 200 response");
				res.json(results);
			}
		);
	},

	/**
	 * UPDATE DATABASE ========================================================================
	 */

	updateEvent: (id, updatedEvent, callback) => {
		checkDB();
		con.query(
			"UPDATE event SET attendee_count = ? WHERE id = ?",
			[updatedEvent.attendee_count, id],
			(err, results) => {
				if (err) {
					console.error(err);
					return callback(err, null);
				}
				callback(null, results);
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
	getUserByID: (id, callback) => {
		checkDB();
		con.query("SELECT * FROM user WHERE id = ?", [id], (err, results) => {
			if (err) {
				console.error(err);
				return callback(err, null);
			}
			if (results.length === 0) {
				return callback(null, null);
			}
			callback(null, results[0]);
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
	},
	insertUser: (user, res) => {
		checkDB();
		con.query(
			"INSERT INTO user (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
			[user.first_name, user.last_name, user.email, user.password, user.role],
			(err, results) => {
				if (err) {
					console.error(err);
					res.status(500).send("Error inserting data into database: " + err);
				} else {
					res.json(results);
				}
			}
		);
	},
	getUserByEmail: (email, callback) => {
		checkDB();
		con.query("SELECT * FROM user WHERE email = ?", [email], (err, results) => {
			if (err || results.length === 0) {
				callback(err || new Error("User not found"));
			} else {
				callback(null, results[0]);
			}
		});
	},
	getUserTickets: (userId, callback) => {
		checkDB();
		con.query(
			`SELECT ticket.*, event.name as event_name FROM ticket JOIN event ON ticket.event_id = event.id WHERE ticket.user_id = ?`,
			[userId],
			(err, results) => {
				if (err) {
					console.error(err);
					return callback(err, null);
				}
				callback(null, results);
			}
		);
	},

	getEventCategoryCounts: (eventIds, callback) => {
		checkDB();
		con.query("SELECT category, COUNT(*) as count FROM event WHERE id IN (?) GROUP BY category ORDER BY count DESC", [eventIds], (err, results) => {
			if (err) {
				console.error(err);
				return callback(err, null);
			}
			callback(null, results);
		});
	},
	getEventsByCategory: (eventCategory, limit, callback) => {
		checkDB();
		con.query("SELECT * FROM event WHERE category = ? ORDER BY date DESC LIMIT ?", [eventCategory, limit], (err, results) => {
			if (err) {
				console.error(err);
				return callback(err, null);
			}
			callback(null, results);
		});
	},
	getUserReviews: (userId, callback) => {
		checkDB();
		con.query(
			`SELECT review.*, event.name as event_name FROM review JOIN event ON review.event_id = event.id WHERE review.user_id = ?`,
			[userId],
			(err, results) => {
				if (err) {
					console.error(err);
					return callback(err, null);
				}
				callback(null, results);
			}
		);
	},
	getRecommendedEvents: (req, res) => {
		const userId = req.user.id;

		// Step 1: Fetch all tickets purchased by the user
		database_commands.getUserTickets(userId, (err, tickets) => {
			if (err) {
				return res.status(500).send("Error fetching user tickets: " + err);
			}

			const eventIds = tickets.map(ticket => ticket.event_id);

			if (eventIds.length === 0) {
				return res.json([]);
			}

			// Step 2: Determine the most common event categories
			database_commands.getEventCategoryCounts(eventIds, (err, eventCategoryCounts) => {
				if (err) {
					return res.status(500).send("Error fetching event category counts: " + err);
				}

				if (eventCategoryCounts.length === 0) {
					return res.json([]);
				}

				// Step 3: Fetch the latest events of the most common event category
				const mostCommonCategory = eventCategoryCounts[0].category;
				database_commands.getEventsByCategory(mostCommonCategory, 5, (err, latestEvents) => { // Limit to top 5 events
					if (err) {
						return res.status(500).send("Error fetching latest events: " + err);
					}

					res.json(latestEvents);
				});
			});
		});
	}
};

module.exports = { databaseInit, checkDB, database_commands };