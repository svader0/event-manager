import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import "./mvp.css"

function Home() {
  const [events, setEvents] = useState([]);
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


  // Fetch events data from the backend and updates the state
  useEffect(() => {
    fetch("http://localhost:3000/event")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched events:", data);
        setEvents(data);
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

  // Handle form input changes called whenever an input field's value changes.
  //It updates the newEvent state by spreading the previous state (...prev) 
  //and updating the specific field that was modified (using name and value from the event target
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

  // Handle form submission to add a new event triggered when the form is submitted.
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:3000/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEvent),
    })
      .then((response) => response.json())
      .then((data) => {
        setEvents((prevEvents) => [...prevEvents, newEvent]);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error adding event:", error);
        alert("Failed to add event:" + error);
      });
  };

  return (
    <div className="container">
      <h1>Event Manager</h1>
      <details>
        <summary>Add a new Event</summary>
        <div>
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
            <br />
            <label>
              Organizer:
              <input
                type="text"
                name="organizer"
                value={newEvent.organizer}
                onChange={handleChange}
              />
            </label>
            <br />
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
            <br />
            <label>
              Event Description:
              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleChange}
              />
            </label>
            <br />
            <label>
              Event Price:
              <input
                type="number"
                name="price"
                value={newEvent.price}
                onChange={handleChange}
              />
            </label>
            <br />
            <label>
              Date:
              <input
                type="date"
                name="date"
                value={newEvent.date}
                onChange={handleChange}
              />
            </label>
            <br />
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
            <br />
            <button type="submit">Add Event</button>
          </form>
        </div>
      </details>

      <div>
        <h2>Events</h2>
        <table>
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.name}</td>
                <td>{new Date(event.date).toLocaleDateString()}</td>
                <td>
                  <a href={`/event/${event.id}`}>Details</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
