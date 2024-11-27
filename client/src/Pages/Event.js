import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Event = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [location, setLocation] = useState(null);
    const [ticket, setTicket] = useState({
        name: "",
        email: "",
        event_id: id,
        purchase_date: new Date().toISOString().split('T')[0], // current date
        quantity: 1,
        amount_paid: 0,
        user_id: null
    });
    const [review, setReview] = useState({
        user_id: null,
        event_id: id,
        rating: 0,
        comment: ""
    });
    const [reviews, setReviews] = useState([]);
    const [users, setUsers] = useState({});
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/event/${id}`);
                setEvent(response.data);

                // Fetch location details
                const locationResponse = await axios.get(`http://localhost:3000/location/${response.data.location_id}`);
                setLocation(locationResponse.data);
            } catch (error) {
                console.error("Error fetching event details:", error);
            }
        };

        const fetchReviews = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/event/${id}/review`);
                setReviews(response.data);

                // Fetch user details for each review
                const userPromises = response.data.map(review =>
                    axios.get(`http://localhost:3000/user/${review.user_id}`)
                );
                const userResponses = await Promise.all(userPromises);
                const userMap = userResponses.reduce((acc, userResponse) => {
                    acc[userResponse.data.id] = userResponse.data;
                    return acc;
                }, {});
                setUsers(userMap);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };

        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await axios.get("http://localhost:3000/user/me", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data);
                    setTicket((prev) => ({
                        ...prev,
                        user_id: response.data.id // Set user_id in ticket
                    }));
                    setReview((prev) => ({
                        ...prev,
                        user_id: response.data.id // Set user_id in review
                    }));
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };

        fetchEvent();
        fetchReviews();
        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTicket((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setReview((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            ticket.amount_paid = event.price;
            ticket.name = user.first_name + " " + user.last_name;
            ticket.email = user.email;
            const response = await axios.post("http://localhost:3000/ticket", ticket);
            console.log("Ticket reserved:", response.data);

            // Update the attendee count
            const updatedEvent = { ...event, attendee_count: event.attendee_count + Number(ticket.quantity) };
            await axios.put(`http://localhost:3000/event/${event.id}`, updatedEvent);
            setEvent(updatedEvent);

            // Show alert and refresh the page
            alert("Your reservation was created successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error reserving ticket:", error);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/review", review);
            console.log("Review submitted:", response.data);
            setReviews((prev) => [...prev, response.data]);
            window.location.reload();
        } catch (error) {
            console.error("Error submitting review:", error);
            if (error.response && error.response.data) {
                alert("Failed to submit review: " + error.response.data);
            } else {
                alert("Failed to submit review. Please try again later.");
            }
        }
    };

    if (!event || !location) {
        return <div>Loading...</div>;
    }

    const eventDate = new Date(event.date);
    const currentDate = new Date();
    const isEventPassed = currentDate > eventDate;

    return (
        <div className="container">
            <div>
                <h1>{event.name}</h1>
                <p>Organizer: {event.organizer}</p>
                <p>Category: {event.category}</p>
                <p>Description: {event.description}</p>
                <p>Price: ${event.price}</p>
                <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                <p>Time: {event.time}</p>
                <p>Attendees: {event.attendee_count} / {location.seats}</p>
                <p>Location: {location.name}, {location.address}</p>
            </div>
            {!isEventPassed && user && (
                <div>
                    <h2>Reserve a Ticket</h2>
                    <p>Note that if you reserve a ticket online and the event is not free admission, you will be obligated to pay in cash at the door.</p>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Quantity:
                            <input type="number" name="quantity" value={ticket.quantity} onChange={handleChange} min="1" />
                        </label>
                        <button type="submit">Purchase/Reserve</button>
                    </form>
                </div>
            )}
            {!user && (
                <p>Please log in to reserve a ticket.</p>
            )}
            {isEventPassed && user && (
                <div>
                    <h2>Reviews</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Rating</th>
                                <th>Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review) => (
                                <tr key={review.id}>
                                    <td>{users[review.user_id]?.first_name || review.user_id}</td>
                                    <td>{review.rating}</td>
                                    <td>{review.comment}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h2>Leave a Review</h2>
                    <form onSubmit={handleReviewSubmit}>
                        <label>
                            Rating:
                            <input type="number" name="rating" value={review.rating} onChange={handleReviewChange} min="0" max="5" />
                        </label>
                        <label>
                            Comment:
                            <textarea name="comment" value={review.comment} onChange={handleReviewChange}></textarea>
                        </label>
                        <button type="submit">Submit Review</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Event;