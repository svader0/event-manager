import React, { useEffect, useState } from "react";
import axios from "axios";

const Account = () => {
    const [user, setUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const userResponse = await axios.get("http://localhost:3000/user/me", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(userResponse.data);

                    const ticketsResponse = await axios.get(`http://localhost:3000/user/${userResponse.data.id}/tickets`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setTickets(ticketsResponse.data);

                    const reviewsResponse = await axios.get(`http://localhost:3000/user/${userResponse.data.id}/reviews`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setReviews(reviewsResponse.data);
                } catch (error) {
                    console.error("Error fetching user data, tickets, or reviews:", error);
                    alert("Failed to fetch user data. Please try again later.");
                }
            }
        };

        fetchUserData();
    }, []);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <h1>Account Info</h1>
            <p>Name: {user.first_name} {user.last_name}</p>
            <p>Email: {user.email}</p>
            <h2>Reserved Tickets</h2>
            <table>
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Quantity</th>
                        <th>Reservation Date</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(ticket => (
                        <tr key={ticket.id}>
                            <td>{ticket.event_name}</td>
                            <td>{ticket.quantity}</td>
                            <td>{new Date(ticket.purchase_date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h2>Reviews Left</h2>
            <table>
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Rating</th>
                        <th>Comment</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map(review => (
                        <tr key={review.event_id}>
                            <td>{review.event_name}</td>
                            <td>{review.rating}</td>
                            <td>{review.comment}</td>
                            <td>{new Date(review.timestamp).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Account;