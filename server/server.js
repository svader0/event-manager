const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig');
const db = require('./database');

const SECRET_KEY = 'BANANA_STAND';

// Create the Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Initialize database and tables on startup
db.databaseInit();

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) {
		console.log('No token provided');
		return res.sendStatus(401);
	}
	jwt.verify(token, SECRET_KEY, (err, user) => {
		if (err) {
			console.log('Token verification failed:', err);
			return res.sendStatus(403);
		}
		req.user = user;
		console.log('Token verified, user:', user);
		next();
	});
};

/** 
 *  POST REQUESTS ========================================================================
 */
/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid email or password
 */
app.post('/login', async (req, res) => {
	const { email, password } = req.body;
	db.database_commands.getUserByEmail(email, async (err, user) => {
		if (err || !user) {
			return res.status(400).send('Invalid email or password');
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).send('Invalid email or password');
		}
		const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
		res.json({ token });
	});
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: User registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration successful
 *       500:
 *         description: Error inserting data into database
 */
app.post('/register', async (req, res) => {
	const { first_name, last_name, email, password } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);
	db.database_commands.insertUser({ ...req.body, password: hashedPassword }, res);
});

/**
 * @swagger
 * /event:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizer:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 format: time
 *               location_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Event created successfully
 *       500:
 *         description: Error inserting data into database
 */
app.post('/event', (req, res) => {
	console.log('post event: here is what is in req.body:');
	console.log(req.body);
	db.database_commands.insertEvent(req, res);
});

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       500:
 *         description: Error inserting data into database
 */
app.post('/user', (req, res) => {
	console.log('post user: here is what is in req.body:');
	console.log(req.body);
	db.database_commands.insertUser(req, res);
});

/**
 * @swagger
 * /review:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review created successfully
 *       500:
 *         description: Error inserting data into database
 */
app.post('/review', (req, res) => {
	console.log('post review: here is what is in req.body:');
	console.log(req.body);
	db.database_commands.insertReview(req, res);
});

/**
 * @swagger
 * /location:
 *   post:
 *     summary: Create a new location
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zip:
 *                 type: string
 *     responses:
 *       200:
 *         description: Location created successfully
 *       500:
 *         description: Error inserting data into database
 */
app.post('/location', (req, res) => {
	console.log('post location: here is what is in req.body:');
	console.log(req.body);
	db.database_commands.insertLocation(req, res);
});

/**
 * @swagger
 * /ticket:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Ticket created successfully
 *       500:
 *         description: Error inserting data into database
 */
app.post('/ticket', (req, res) => {
	console.log('post ticket: here is what is in req.body:');
	console.log(req.body);
	db.database_commands.insertTicket(req, res);
});

/**
 * @swagger
 * /event:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of events
 *       500:
 *         description: Error fetching data from database
 */
app.get('/event', (req, res) => {
	console.log('Received a GET request for all events');
	db.database_commands.getEvents(req, res);
});

/**
 * @swagger
 * /event/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event details
 *       500:
 *         description: Error fetching data from database
 */
app.get('/event/:id', (req, res) => {
	const eventId = req.params.id;
	console.log('Received a GET request for event with id:', eventId);
	db.database_commands.getEventById(eventId, (err, event) => {
		if (err) {
			console.error('Error retrieving event details:', err);
			return res.status(500).json({ error: "Error retrieving event details" });
		}
		if (!event) {
			return res.status(404).json({ error: "Event not found" });
		}
		res.status(200).json(event);
	});
});

/**
 * @swagger
 * /ticket:
 *   get:
 *     summary: Get all tickets
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: List of tickets
 *       500:
 *         description: Error fetching data from database
 */
app.get('/ticket', (req, res) => {
	console.log('Received a GET request for all tickets');
	db.database_commands.getTickets(req, res);
});

/**
 * @swagger
 * /event/{id}/review:
 *   get:
 *     summary: Get all reviews for an event
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 *       500:
 *         description: Error fetching data from database
 */
app.get('/event/:id/review', (req, res) => {
	const eventId = req.params.id;
	console.log('Received a GET request for all reviews for event with id:', eventId);
	db.database_commands.getEventReviews(eventId, res);
});

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error fetching data from database
 */
app.get('/user/me', authenticateToken, (req, res) => {
	const userId = req.user.id;
	console.log('Received a GET request for myself with id:', userId);
	db.database_commands.getUserByID(userId, (err, user) => {
		if (err) {
			console.error('Error fetching user data:', err);
			return res.status(500).send('Error fetching user data');
		}
		if (!user) {
			console.log('User not found with ID:', userId);
			return res.status(404).send('User not found');
		}
		res.json(user);
	});
});

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *       500:
 *         description: Error fetching data from database
 */
app.get('/user/:id', (req, res) => {
	const userId = req.params.id;
	console.log('Received a GET request for user with id:', userId);
	db.database_commands.getUserByID(userId, (err, user) => {
		if (err) {
			console.error('Error fetching user data:', err);
			return res.status(500).send('Error fetching user data');
		}
		if (!user) {
			console.log('User not found with ID:', userId);
			return res.status(404).send('User not found');
		}
		res.json(user);
	});
});

/**
 * @swagger
 * /location/{id}:
 *   get:
 *     summary: Get location by ID
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Location details
 *       500:
 *         description: Error fetching data from database
 */
app.get('/location/:id', (req, res) => {
	const locationId = req.params.id;
	console.log('Received a GET request for location with id:', locationId);
	db.database_commands.getLocationByID(locationId, res);
});


/**
 * @swagger
 * /event/{id}/statistics:
 *   get:
 *     summary: Get statistics for an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event statistics
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error fetching data from database
 */
app.get('/event/:id/statistics', authenticateToken, (req, res) => {
	const eventId = req.params.id;
	const userId = req.user.id;

	// Ensure the user is the creator of the event
	db.database_commands.getEventById(eventId, (err, event) => {
		if (err || !event) {
			return res.status(404).send('Event not found');
		}
		if (event.creator_id !== userId) {
			return res.status(403).send('Unauthorized');
		}

		db.database_commands.getEventStatistics(eventId, (err, statistics) => {
			if (err) {
				console.error('Error fetching event statistics:', err);
				return res.status(500).send('Error fetching event statistics');
			}
			res.json(statistics);
		});
	});
});

/**
 * @swagger
 * /location:
 *   get:
 *     summary: Get all locations
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of locations
 *       500:
 *         description: Error fetching data from database
 */
app.get('/location', (req, res) => {
	console.log('Received a GET request for all locations');
	db.database_commands.getLocations(req, res);
});

/**
 * @swagger
 * /recommended-events:
 *   get:
 *     summary: Get recommended events for the current user
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommended events
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error fetching data from database
 */
app.get('/recommended-events', authenticateToken, (req, res) => {
	console.log('Received a GET request for recommended events for user with id:', req.user.id);
	db.database_commands.getRecommendedEvents(req, res);
});

/**
 * @swagger
 * /user/{id}/tickets:
 *   get:
 *     summary: Get tickets for a user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of tickets
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error fetching data from database
 */
app.get('/user/:id/tickets', authenticateToken, (req, res) => {
	const userId = req.params.id;
	console.log('Received a GET request for tickets for user with id:', userId);
	db.database_commands.getUserTickets(userId, (err, tickets) => {
		if (err) {
			console.error('Error fetching tickets:', err);
			return res.status(500).send('Error fetching tickets');
		}
		res.json(tickets);
	});
});

/**
 * @swagger
 * /user/{id}/events:
 *   get:
 *     summary: Get events created by a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user-created events
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Error fetching data from database
 */
app.get('/user/:id/events', authenticateToken, (req, res) => {
	const userId = req.params.id;

	// Optional: Ensure the requester is the user or an admin
	if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
		return res.status(403).send('Forbidden');
	}

	db.database_commands.getUserEvents(userId, (err, events) => {
		if (err) {
			console.error('Error fetching user events:', err);
			return res.status(500).send('Error fetching user events');
		}
		res.json(events);
	});
});

/**
 * @swagger
 * /user/{id}/reviews:
 *   get:
 *     summary: Get reviews for a user
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error fetching data from database
 */
app.get('/user/:id/reviews', authenticateToken, (req, res) => {
	const userId = req.params.id;
	console.log('Received a GET request for reviews for user with id:', userId);
	db.database_commands.getUserReviews(userId, (err, reviews) => {
		if (err) {
			console.error('Error fetching reviews:', err);
			return res.status(500).send('Error fetching reviews');
		}
		res.json(reviews);
	});
});

/*
 *  PUT REQUESTS ========================================================================
 */

/**
 * @swagger
 * /event/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizer:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 format: time
 *               location_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       500:
 *         description: Error updating data in database
 */
app.put('/event/:id', authenticateToken, (req, res) => {
	const eventId = req.params.id;
	const updatedEvent = req.body;
	const userId = req.user.id;

	db.database_commands.getEventById(eventId, (err, event) => {
		if (err || !event) {
			return res.status(404).send('Event not found');
		}
		if (event.creator_id !== userId) {
			return res.status(403).send('Unauthorized');
		}

		db.database_commands.updateEvent(eventId, updatedEvent, (err, results) => {
			if (err) {
				console.error('Error updating event:', err);
				return res.status(500).send('Error updating event');
			}
			res.json(results);
		});
	});
});

/**
 * @swagger
 * /event/{id}:
 *  put:
 *   summary: Update an event
 * 	tags: [Events]
 * 	parameters:
 * 		- in: path
 * 			name: id
 * 			required: true
 * 			schema:
 * 				type: integer
 * 	requestBody:
 * 		required: true
 * 		content:
 * 			application/json:
 * 				schema:
 * 					type: object
 * 					properties:
 * 						organizer:
 * 							type: string
 * 						category:
 * 							type: string
 * 						description:
 * 							type: string
 * 						price:
 * 							type: number
 * 						name:
 * 							type: string
 * 						date:
 * 							type: string
 * 							format: date
 * 						time:
 * 							type: string
 * 							format: time
 * 						location_id:
 * 							type: integer
 * 	responses:
 * 		200:
 * 			description: Event updated successfully
 * 		500:
 * 			description: Error updating data in database
 * 
 */
app.put('/event/:id', authenticateToken, (req, res) => {
	const eventId = req.params.id;
	const updatedEvent = req.body;
	const userId = req.user.id;

	// Ensure the user is the creator of the event
	db.database_commands.getEventById(eventId, (err, event) => {
		if (err || !event) {
			return res.status(404).send('Event not found');
		}
		if (event.creator_id !== userId) {
			return res.status(403).send('Unauthorized');
		}

		db.database_commands.updateEvent(eventId, updatedEvent, (err, results) => {
			if (err) {
				console.error('Error updating event:', err);
				return res.status(500).send('Error updating event');
			}
			res.json(results);
		});
	});
});

/*
 *  DELETE REQUESTS ========================================================================
 */

/**
 * @swagger
 * /event/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the event to delete
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 *       500:
 *         description: Error deleting event
 */
app.delete('/event/:id', authenticateToken, (req, res) => {
	const eventId = req.params.id;
	const userId = req.user.id;

	db.database_commands.getEventById(eventId, (err, event) => {
		if (err || !event) {
			return res.status(404).send('Event not found');
		}
		if (event.creator_id !== userId) {
			return res.status(403).send('Unauthorized');
		}

		db.database_commands.deleteEvent(eventId, (err, results) => {
			if (err) {
				console.error('Error deleting event:', err);
				return res.status(500).send('Error deleting event');
			}
			res.json(results);
		});
	});
});


// Start the server
app.listen(3000, () => {
	console.log('Server running on port 3000');
});
