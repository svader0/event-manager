import React, { useState } from "react";
import axios from "axios";

const Account = () => {
    const [user, setUser] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: ""
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
            const response = await axios.post("http://localhost:3000/user", user);
            console.log("User created:", response.data);
            window.location.href = "/"; // Redirect to home page
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Failed to create user. Please try again.");
        }
    };

    return (
        <div className="container">
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input type="text" name="first_name" value={user.username} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Last Name:
                    <input type="text" name="last_name" value={user.last_name} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Email:
                    <input type="email" name="email" value={user.email} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" name="password" value={user.password} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Role:
                    <select name="role" value={user.role} onChange={handleChange}>
                        <option value="">Select a role</option>
                        <option value="user">Standard</option>
                        <option value="admin">Organizer</option>
                    </select>
                </label>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default Account;