import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [locations, setLocations] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/event/${id}`);
                setEvent(response.data);
            } catch (error) {
                console.error("Error fetching event:", error);
                setError("Failed to fetch event. Please try again later.");
            }
        };

        const fetchLocations = async () => {
            try {
                const response = await axios.get("http://localhost:3000/location");
                const locationOptions = response.data.map(location => ({
                    value: location.id,
                    label: location.name
                }));
                setLocations(locationOptions);
            } catch (error) {
                console.error("Error fetching locations:", error);
                setError("Failed to fetch locations. Please try again later.");
            }
        };

        fetchEvent();
        fetchLocations();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEvent((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLocationChange = (selectedOption) => {
        setEvent((prev) => ({
            ...prev,
            location_id: selectedOption.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:3000/event/${id}`, event, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Event updated successfully!");
            navigate("/account");
        } catch (error) {
            console.error("Error updating event:", error);
            setError("Failed to update event. Please try again later.");
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:3000/event/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Event deleted successfully!");
            navigate("/account");
        } catch (error) {
            console.error("Error deleting event:", error);
            setError("Failed to delete event. Please try again later.");
        }
    };

    if (!event) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <h1>Edit Event</h1>
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Event Name:
                    <input type="text" name="name" value={event.name} onChange={handleChange} />
                </label>
                <label>
                    Description:
                    <textarea name="description" value={event.description} onChange={handleChange}></textarea>
                </label>
                <label>
                    Date:
                    <input type="date" name="date" value={event.date} onChange={handleChange} />
                </label>
                <label>
                    Time:
                    <input type="time" name="time" value={event.time} onChange={handleChange} />
                </label>
                <label>
                    Location:
                    <Select
                        options={locations}
                        value={locations.find(option => option.value === event.location_id)}
                        onChange={handleLocationChange}
                        isSearchable
                    />
                </label>
                <button type="submit">Update Event</button>
                <button type="button" onClick={handleDelete}>Delete Event</button>
            </form>
        </div>
    );
};

export default EditEvent;