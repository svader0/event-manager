import React, { useState } from "react";
import axios from "axios";

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/login", credentials);
            console.log("User logged in:", response.data);
            localStorage.setItem("token", response.data.token); // Save token to local storage
            window.location.href = "/"; // Redirect to home page
        } catch (error) {
            console.error("Error logging in:", error);
            alert("Failed to log in. Please try again.");
        }
    };

    return (
        <div className="container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input type="email" name="email" value={credentials.email} onChange={handleChange} />
                </label>
                <label>
                    Password:
                    <input type="password" name="password" value={credentials.password} onChange={handleChange} />
                </label>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;