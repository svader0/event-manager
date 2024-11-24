import React, { useEffect, useState } from "react";
import axios from "axios";

const Locations = () => {
    const [locations, setLocations] = useState([]);
    const [newLocation, setNewLocation] = useState({
        name: "",
        address: "",
        seats: ""
    });

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get("http://localhost:3000/location");
                setLocations(response.data);
            } catch (error) {
                console.error("Error fetching locations:", error);
            }
        };

        fetchLocations();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewLocation((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/location", newLocation);
            setLocations((prev) => [...prev, response.data]);
            setNewLocation({ name: "", address: "", seats: "" });
            window.location.reload();
        } catch (error) {
            console.error("Error adding location:", error);
            alert("Failed to add location. Please try again.");
        }
    };

    return (
        <div className="container">
            <h1>Locations</h1>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Seats</th>
                    </tr>
                </thead>
                <tbody>
                    {locations.map((location) => (
                        <tr key={location.id}>
                            <td>{location.name}</td>
                            <td>{location.address}</td>
                            <td>{location.seats}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h2>Add a New Location</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input type="text" name="name" value={newLocation.name} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Address:
                    <input type="text" name="address" value={newLocation.address} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Seats:
                    <input type="number" name="seats" value={newLocation.seats} onChange={handleChange} />
                </label>
                <br />
                <button type="submit">Add Location</button>
            </form>
        </div>
    );
};

export default Locations;