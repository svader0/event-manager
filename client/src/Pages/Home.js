import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import "./mvp.css";

function Home() {
	const [events, setEvents] = useState([]);
	const [recommendedEvents, setRecommendedEvents] = useState([]);
	const [newEvent, setNewEvent] = useState({
		name: "",
		organizer: "",
		category: "",
		description: "",
		price: "",
		time: "",
		date: "",
		location_id: "",
	});
	const [locations, setLocations] = useState([]);
	const [user, setUser] = useState(null);
	const [userLocation, setUserLocation] = useState(null);
	const [locationError, setLocationError] = useState(null);
	const [distanceFilter, setDistanceFilter] = useState(12000);
	const [allEvents, setAllEvents] = useState([]);
	const [expandedTables, setExpandedTables] = useState({});

	function calculateDistance(lat1, lon1, lat2, lon2) {
		function toRad(Value) {
			return (Value * Math.PI) / 180;
		}

		const R = 6371; // Radius of the Earth in kilometers
		const dLat = toRad(lat2 - lat1);
		const dLon = toRad(lon1 - lon2);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(toRad(lat1)) *
			Math.cos(toRad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c;
		return distance;
	}

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setUserLocation({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					});
				},
				(error) => {
					console.error("Error obtaining location:", error);
					setLocationError("Unable to retrieve your location.");
				}
			);
		} else {
			setLocationError("Geolocation is not supported by this browser.");
		}

		axios.get("http://localhost:3000/event")
			.then((response) => {
				console.log("Fetched events:", response.data);
				setAllEvents(response.data);
			})
			.catch((error) => console.error("Error fetching events:", error));

		axios.get("http://localhost:3000/location")
			.then((response) => {
				const locationOptions = response.data.map(location => ({
					value: location.id,
					label: location.name
				}));
				setLocations(locationOptions);
			})
			.catch((error) => console.error("Error fetching locations:", error));
	}, []);

	useEffect(() => {
		if (userLocation) {
			const token = localStorage.getItem("token");
			if (token) {
				axios.get("http://localhost:3000/user/me", {
					headers: { Authorization: `Bearer ${token}` }
				})
					.then((response) => {
						setUser(response.data);
						axios.get("http://localhost:3000/recommended-events", {
							headers: { Authorization: `Bearer ${token}` }
						})
							.then((response) => {
								const recommendedEventsWithDistance = response.data.map((event) => {
									const distance = calculateDistance(
										userLocation.latitude,
										userLocation.longitude,
										event.latitude,
										event.longitude
									);
									return { ...event, distance };
								});

								const currentDate = new Date();
								const filteredAndSortedEvents = recommendedEventsWithDistance
									.filter(event => new Date(event.date) >= currentDate)
									.sort((a, b) => {
										const dateA = new Date(a.date);
										const dateB = new Date(b.date);
										if (dateA.getTime() === dateB.getTime()) {
											return a.distance - b.distance;
										}
										return dateA - dateB;
									});

								setRecommendedEvents(filteredAndSortedEvents);
							})
							.catch((error) => console.error("Error fetching recommended events:", error));
					})
					.catch((error) => console.error("Error fetching user data:", error));
			}
		}
	}, [userLocation]);

	useEffect(() => {
		if (userLocation && allEvents.length > 0) {
			const eventsWithDistance = allEvents.map((event) => {
				const distance = calculateDistance(
					userLocation.latitude,
					userLocation.longitude,
					event.latitude,
					event.longitude
				);
				return { ...event, distance };
			});

			const filteredEvents = eventsWithDistance
				.filter(event => event.distance <= distanceFilter)
				.sort((a, b) => new Date(a.date) - new Date(b.date));
			setEvents(filteredEvents);
		}
	}, [userLocation, allEvents, distanceFilter]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setNewEvent((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleLocationChange = (selectedOption) => {
		setNewEvent((prev) => ({
			...prev,
			location_id: selectedOption.value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		fetch("http://localhost:3000/event", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newEvent),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				if (data.success) {
					setEvents((prevEvents) => [...prevEvents, newEvent]);
					window.location.reload();
				} else {
					alert("Failed to add event: " + data.error);
				}
			})
			.catch((error) => {
				console.error("Error adding event:", error);
				alert("Failed to add event: " + error);
			});
	};

	const toggleExpandTable = (tableName) => {
		setExpandedTables((prev) => ({
			...prev,
			[tableName]: !prev[tableName],
		}));
	};

	const renderTable = (title, events) => {
		const isExpanded = expandedTables[title];
		const displayedEvents = isExpanded ? events : events.slice(0, 10);

		return (
			<div className="events-table">
				<h2>{title}</h2>
				<table>
					<thead>
						<tr>
							<th>Event Name</th>
							<th>Date</th>
							<th>Distance (km)</th>
							<th>Details</th>
						</tr>
					</thead>
					<tbody>
						{displayedEvents.map((event) => (
							<tr key={event.id}>
								<td>{event.name}</td>
								<td>{new Date(event.date).toLocaleDateString()}</td>
								<td>{event.distance ? event.distance.toFixed(2) : 'N/A'}</td>
								<td>
									<a href={`/event/${event.id}`}>Details</a>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{events.length > 10 && (
					<div className="expand-button" onClick={() => toggleExpandTable(title)}>
						{isExpanded ? "Show Less" : "Show More"}
					</div>
				)}
			</div>
		);
	};

	const currentDate = new Date();
	const upcomingEvents = events.filter(event => new Date(event.date) >= currentDate);
	const pastEvents = events.filter(event => new Date(event.date) < currentDate);

	return (
		<div className="container">
			<h1>Event Manager</h1>
			{locationError && <p>{locationError}</p>}
			{user && user.role === "organizer" && (
				<details>
					<summary>Add a new Event</summary>
					<div className="form-container">
						<h2>Add a New Event</h2>
						<form onSubmit={handleSubmit}>
							<label>
								Event Name:
								<input
									type="text"
									name="name"
									value={newEvent.name}
									onChange={handleChange}
								/>
							</label>
							<label>
								Organizer:
								<input
									type="text"
									name="organizer"
									value={newEvent.organizer}
									onChange={handleChange}
								/>
							</label>
							<label>
								Category:
								<select name="category" value={newEvent.category} onChange={handleChange}>
									<option value="">Select a category</option>
									<option value="Party">Party</option>
									<option value="Concert">Concert</option>
									<option value="Convention">Convention</option>
									<option value="Festival">Festival</option>
									<option value="Lecture">Lecture</option>
									<option value="Sports">Sports</option>
									<option value="Other">Other</option>
								</select>
							</label>
							<label>
								Event Description:
								<textarea
									name="description"
									value={newEvent.description}
									onChange={handleChange}
								/>
							</label>
							<label>
								Event Price:
								<input
									type="number"
									name="price"
									value={newEvent.price}
									onChange={handleChange}
								/>
							</label>
							<label>
								Date:
								<input
									type="date"
									name="date"
									value={newEvent.date}
									onChange={handleChange}
								/>
							</label>
							<label>
								Time:
								<input
									type="time"
									name="time"
									value={newEvent.time}
									onChange={handleChange}
								/>
							</label>
							<label>
								Location:
								<Select
									options={locations}
									onChange={handleLocationChange}
									isSearchable
								/>
							</label>
							<button type="submit">Add Event</button>
						</form>
					</div>
				</details>
			)}
			<div className="slider-container">
				<label>
					Filter by distance (km):
					<input
						type="range"
						min="0"
						max="12000"
						value={distanceFilter}
						onChange={(e) => setDistanceFilter(e.target.value)}
					/>
					<span>{distanceFilter} km</span>
				</label>
			</div>
			<div className="events-grid">
				{renderTable("Upcoming Events", upcomingEvents)}
				{renderTable("Past Events", pastEvents)}
				{user && recommendedEvents.length > 0 && renderTable("Recommended Events", recommendedEvents)}
			</div>
		</div>
	);
}

export default Home;