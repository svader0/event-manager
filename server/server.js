const express = require("express");
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
var cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SECRET_KEY = "BANANA_STAND";

const db = require('./database');

// Create the Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize database and tables on startup
db.databaseInit();

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (!token) {
		console.log("No token provided");
		return res.sendStatus(401);
	}
	jwt.verify(token, SECRET_KEY, (err, user) => {
		if (err) {
			console.log("Token verification failed:", err);
			return res.sendStatus(403);
		}
		req.user = user;
		console.log("Token verified, user:", user);
		next();
	});
};

/** 
 *  POST REQUESTS ========================================================================
 */

app.post("/event", (req, res) => {
	console.log("post event: here is what is in req.body:");
	console.log(req.body);
	db.database_commands.insertEvent(req, res);
	res.end();
});

app.post("/login", async (req, res) => {
	const { email, password } = req.body;
	db.database_commands.getUserByEmail(email, async (err, user) => {
		if (err || !user) {
			return res.status(400).send("Invalid email or password");
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).send("Invalid email or password");
		}
		const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
		res.json({ token });
	});
});

app.post("/register", async (req, res) => {
	const { first_name, last_name, email, password } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);
	db.database_commands.insertUser({ ...req.body, password: hashedPassword }, res);
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
	console.log("Received a GET request for all reviews for event with id:", eventId);
	db.database_commands.getEventReviews(eventId, res);
});

app.get("/user/me", authenticateToken, (req, res) => {
	const userId = req.user.id;
	console.log("Received a GET request for myself with id:", userId);
	db.database_commands.getUserByID(userId, (err, user) => {
		if (err) {
			console.error("Error fetching user data:", err);
			return res.status(500).send("Error fetching user data");
		}
		if (!user) {
			console.log("User not found with ID:", userId);
			return res.status(404).send("User not found");
		}
		res.json(user);
	});
});

app.get("/user/:id", (req, res) => {
	const userId = req.params.id;
	console.log("Received a GET request for user with id:", userId);
	db.database_commands.getUserByID(userId, (err, user) => {
		if (err) {
			console.error("Error fetching user data:", err);
			return res.status(500).send("Error fetching user data");
		}
		if (!user) {
			console.log("User not found with ID:", userId);
			return res.status(404).send("User not found");
		}
		res.json(user);
	});
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

app.get("/recommended-events", authenticateToken, (req, res) => {
	console.log("Received a GET request for recommended events for user with id:", req.user.id);
	db.database_commands.getRecommendedEvents(req, res);
});

// PUT REQUESTS ========================================================================

app.put("/event/:id", (req, res) => {
	const eventId = req.params.id;
	const updatedEvent = req.body;
	db.database_commands.updateEvent(eventId, updatedEvent, (err, results) => {
		if (err) {
			console.error("Error updating event:", err);
			return res.status(500).send("Error updating event");
		}
		res.json(results);
	});
});

// Start the server
app.listen(3000, () => {
	console.log("Server running on port 3000");
});