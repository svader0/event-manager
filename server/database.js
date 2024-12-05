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
					res.status(500).json({ error: "Error inserting data into database" });
				} else {
					res.status(200).json({ message: "Event created successfully", results });
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
					res.status(500).json({ error: "Error inserting data into database" });
				} else {
					res.status(200).json({ message: "User created successfully", results });
				}
			}
		);
	},
	insertLocation: (req, res) => {
		checkDB();
		con.query(
			"INSERT INTO location (name, address, seats, latitude, longitude) VALUES (?, ?, ?, ?, ?)",
			[req.body.name, req.body.address, req.body.seats, req.body.latitude, req.body.longitude],
			(err, results) => {
				if (err) {
					console.error(err);
					res.status(500).json({ error: "Error inserting data into database" });
				} else {
					res.status(200).json({ message: "Location created successfully", results });
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
						return res.status(400).json({ error: "You cannot leave a review for an event you have not attended." });
					}
					return res.status(500).json({ error: "Error inserting data into database" });
				}
				res.status(200).json({ message: "Review created successfully", results });
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
					return res.status(500).json({ error: "Error inserting data into database" });
				}
				res.status(200).json({ message: "Ticket created successfully", results });
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
		con.query("SELECT event.*, location.latitude, location.longitude FROM event JOIN location ON event.location_id = location.id ORDER BY date DESC", (err, results) => {
			if (err) {
				console.error(err);
				res.status(500).json({ error: "Error retrieving data from database" });
			} else {
				res.status(200).json(results);
			}
		});
	},
	getEventById: (id, callback) => {
		checkDB();
		con.query("SELECT * FROM event WHERE id = ?", [id], (err, results) => {
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
	getTickets: (req, res) => {
		checkDB();
		con.query("SELECT * FROM ticket", (err, results) => {
			if (err) {
				console.error(err);
				res.status(500).json({ error: "Error retrieving data from database" });
			} else {
				res.status(200).json(results);
			}
		});
	},
	getEventReviews: (id, res) => {
		checkDB();
		con.query("SELECT * FROM review WHERE event_id = ?", [id], (err, results) => {
			if (err) {
				console.error(err);
				res.status(500).json({ error: "Error retrieving event details" });
			} else {
				if (results.length === 0) {
					res.status(404).json({ error: "Event not found" });
				} else {
					res.status(200).json(results);
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
				res.status(500).json({ error: "Error retrieving location details" });
			} else {
				if (results.length === 0) {
					res.status(404).json({ error: "Location not found" });
				} else {
					res.status(200).json(results[0]);
				}
			}
		});
	},
	getEventStatistics: (eventId, callback) => {
		checkDB();
		con.query(
			"SELECT user.first_name, user.last_name, ticket.quantity FROM ticket JOIN user ON ticket.user_id = user.id WHERE ticket.event_id = ?",
			[eventId],
			(err, results) => {
				if (err) {
					console.error(err);
					return callback(err, null);
				}
				callback(null, results);
			}
		);
	},
	getLocations: (req, res) => {
		checkDB();
		con.query("SELECT * FROM location", (err, results) => {
			if (err) {
				console.error(err);
				res.status(500).json({ error: "Error retrieving data from database" });
			} else {
				res.status(200).json(results);
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
					res.status(500).json({ error: "Error inserting data into database" });
				} else {
					res.status(200).json({ message: "User created successfully", results });
				}
			}
		);
	},
	getUserEvents: (userId, callback) => {
		checkDB();
		con.query(
			"SELECT * FROM event WHERE creator_id = ?",
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
		con.query("SELECT event.*, location.* FROM event JOIN location ON event.location_id = location.id  WHERE event.category = ? ORDER BY event.date DESC LIMIT ?", [eventCategory, limit], (err, results) => {
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
				return res.status(500).json({ error: "Error fetching user tickets" });
			}

			const eventIds = tickets.map(ticket => ticket.event_id);

			if (eventIds.length === 0) {
				return res.status(200).json([]);
			}

			// Step 2: Determine the most common event categories
			database_commands.getEventCategoryCounts(eventIds, (err, eventCategoryCounts) => {
				if (err) {
					return res.status(500).json({ error: "Error fetching event category counts" });
				}

				if (eventCategoryCounts.length === 0) {
					return res.status(200).json([]);
				}

				// Step 3: Fetch the latest events of the most common event category
				const mostCommonCategory = eventCategoryCounts[0].category;
				database_commands.getEventsByCategory(mostCommonCategory, 5, (err, latestEvents) => { // Limit to top 5 events
					if (err) {
						return res.status(500).json({ error: "Error fetching latest events" });
					}

					res.status(200).json(latestEvents);
				});
			});
		});
	},
	updateEvent: (id, updatedEvent, callback) => {
		checkDB();
		con.query(
			"UPDATE event SET name = ?, description = ?, date = ?, time = ?, location_id = ? WHERE id = ?",
			[updatedEvent.name, updatedEvent.description, updatedEvent.date, updatedEvent.time, updatedEvent.location_id, id],
			(err, results) => {
				if (err) {
					console.error(err);
					return callback(err, null);
				}
				callback(null, results);
			}
		);
	},
	deleteEvent: (id, callback) => {
		checkDB();
		con.query("DELETE FROM event WHERE id = ?", [id], (err, results) => {
			if (err) {
				console.error(err);
				return callback(err, null);
			}
			callback(null, results);
		});
	}
};

module.exports = { databaseInit, checkDB, database_commands };