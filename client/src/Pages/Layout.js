import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";

const Layout = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.get("http://localhost:3000/user/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }

    // Fetch events for the search bar
    axios.get("http://localhost:3000/event")
      .then((response) => {
        const eventOptions = response.data.map(event => ({
          value: event.id,
          label: event.name
        }));
        setEvents(eventOptions);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  const handleEventChange = (selectedOption) => {
    setSelectedEvent(selectedOption);
    if (selectedOption) {
      window.location.href = `/event/${selectedOption.value}`;
    }
  };

  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Select
              options={events}
              onChange={handleEventChange}
              placeholder="Search..."
              isClearable
            />
          </li>
          {user ? (
            <>
              {user.role === "organizer" && (
                <li>
                  <Link to="/location">Locations</Link>
                </li>
              )}
              <li>Logged in as: {user.email}</li>
              <li>
                <Link to="/account">Account</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Log Out</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                <Link to="/login">Sign In</Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <Outlet />
    </>
  );
};

export default Layout;