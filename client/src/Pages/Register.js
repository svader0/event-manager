import React, { useState } from "react";
import axios from "axios";

const Register = () => {
    const [user, setUser] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/register", user);
            console.log("User registered:", response.data);
            window.location.href = "/login"; // Redirect to login page
        } catch (error) {
            console.error("Error registering user:", error);
            alert("Failed to register user. Please try again.");
        }
    };

    return (
        <div className="container">
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    First Name:
                    <input type="text" name="first_name" value={user.first_name} onChange={handleChange} />
                </label>
                <label>
                    Last Name:
                    <input type="text" name="last_name" value={user.last_name} onChange={handleChange} />
                </label>
                <label>
                    Email:
                    <input type="email" name="email" value={user.email} onChange={handleChange} />
                </label>
                <label>
                    Password:
                    <input type="password" name="password" value={user.password} onChange={handleChange} />
                </label>
                <label>
                    Role:
                    <select name="role" value={user.role} onChange={handleChange}>
                        <option value="attendee">Attendee</option>
                        <option value="organizer">Organizer</option>
                    </select>
                </label>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;