import React, { useEffect, useState } from "react";

function Home() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    event_name: "",
    event_type_id: "",
    event_location: "",
    event_description: "",
    event_price: "",
    start_time: "",
    end_time: "",
  });

  // Fetch events data from the backend and updates the state
  useEffect(() => {
    fetch("http://localhost:3000/event")
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error("Error fetching events:", error));
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

  // Handle form submission to add a new event triggered when the form is submitted.
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:3000/event", { //makes a POST request to the backend (http://localhost:3000/event) with the newEvent data
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEvent),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Event added:", data);
        setEvents((prevEvents) => [...prevEvents, newEvent]); 
      })//if it works than it logs the added event to the console and updates the events state by adding the new event to the existing list.
      .catch((error) => console.error("Error adding event:", error));
  };

  return (
    <div>
      <h1>Event Manager</h1>

      <h2>Add a New Event</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Event Name:
          <input
            type="text"
            name="event_name"
            value={newEvent.event_name}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Event Type ID:
          <input
            type="text"
            name="event_type_id"
            value={newEvent.event_type_id}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Event Location:
          <input
            type="text"
            name="event_location"
            value={newEvent.event_location}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Event Description:
          <textarea
            name="event_description"
            value={newEvent.event_description}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Event Price:
          <input
            type="number"
            name="event_price"
            value={newEvent.event_price}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Start Time:
          <input
            type="datetime-local"
            name="start_time"
            value={newEvent.start_time}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          End Time:
          <input
            type="datetime-local"
            name="end_time"
            value={newEvent.end_time}
            onChange={handleChange}
          />
        </label>
        <br />
        <button type="submit">Add Event</button>
      </form>
      
      <h2>Current Events</h2>
      <ul>
        {events.map((event) => (
          <li key={event.event_name}>
            {event.id} - {event.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
