import React, { useEffect, useState } from "react";
import axios from "axios";
import { GoogleMap, LoadScript, Autocomplete, Marker } from "@react-google-maps/api";

const Locations = () => {
    const [locations, setLocations] = useState([]);
    const [newLocation, setNewLocation] = useState({
        name: "",
        address: "",
        seats: "",
        latitude: null,
        longitude: null,
    });
    const [autocomplete, setAutocomplete] = useState(null);
    const [map, setMap] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(null);

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
            console.log("Location added:", response.data);
            setLocations((prev) => [...prev, response.data]);
            setNewLocation({ name: "", address: "", seats: "", latitude: null, longitude: null });
            setMarkerPosition(null);
        } catch (error) {
            console.error("Error adding location:", error);
            alert("Failed to add location. Please try again.");
        }
    };

    const onLoad = (autoC) => {
        setAutocomplete(autoC);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            const location = place.geometry.location;
            setMarkerPosition({
                lat: location.lat(),
                lng: location.lng(),
            });
            setNewLocation((prev) => ({
                ...prev,
                address: place.formatted_address,
                latitude: location.lat(),
                longitude: location.lng(),
            }));
        } else {
            console.log("Autocomplete is not loaded yet!");
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
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <input type="text" name="name" value={newLocation.name} onChange={handleChange} />
                    </label>
                    <br />
                    <label>
                        Seats:
                        <input type="number" name="seats" value={newLocation.seats} onChange={handleChange} />
                    </label>
                    <br />
                    <label>
                        Address:
                        <LoadScript googleMapsApiKey="AIzaSyA5MSFwQqHON3V7GwWykjbEJjs_DrQix30" libraries={["places"]}>
                            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                                <input
                                    type="text"
                                    placeholder="Enter a location"
                                    style={{ width: "90%", height: "40px" }}
                                />
                            </Autocomplete>
                            <div style={{ height: "400px", width: "100%", marginTop: "10px" }}>
                                <GoogleMap
                                    mapContainerStyle={{ height: "80%", width: "100%" }}
                                    center={markerPosition || { lat: 37.4221, lng: -122.0841 }}
                                    zoom={markerPosition ? 15 : 10}
                                    onLoad={(map) => setMap(map)}
                                >
                                    {markerPosition && <Marker position={markerPosition} />}
                                </GoogleMap>
                            </div>
                        </LoadScript>
                    </label>
                    <br />
                    <button type="submit">Add Location</button>
                </form>
            </div>
        </div>
    );
};

export default Locations;