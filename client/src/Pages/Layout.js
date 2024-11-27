import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Layout = () => {
  const [user, setUser] = useState(null);

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
  }, []);

  // logout by deleting token from local storage
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
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