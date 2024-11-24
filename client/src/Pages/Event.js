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
        amount_paid: 0
    });
    const [review, setReview] = useState({
        user_id: 1,
        event_id: id,
        rating: 0,
        comment: ""
    });
    const [reviews, setReviews] = useState([]);
    const [users, setUsers] = useState({});

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

        fetchEvent();
        fetchReviews();
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
            const response = await axios.post("http://localhost:3000/ticket", ticket);
            console.log("Ticket reserved:", response.data);
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
        } catch (error) {
            console.error("Error submitting review:", error);
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
                <p>Date: {event.date}</p>
                <p>Time: {event.time}</p>
                <p>Attendees: {event.attendee_count} / {location.seats}</p>
                <p>Location: {location.name}, {location.address}</p>
            </div>
            {!isEventPassed && (
                <div>
                    <h2>Reserve a Ticket</h2>
                    <p>Note that if you reserve a ticket online and the event is not free admission, you will be obligated to pay in cash at the door.</p>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Name:
                            <input type="text" name="name" value={ticket.name} onChange={handleChange} />
                        </label>
                        <label>
                            Email:
                            <input type="email" name="email" value={ticket.email} onChange={handleChange} />
                        </label>
                        <label>
                            Quantity:
                            <input type="number" name="quantity" value={ticket.quantity} onChange={handleChange} min="1" />
                        </label>
                        <button type="submit">Purchase/Reserve</button>
                    </form>
                </div>
            )}
            {isEventPassed && (
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