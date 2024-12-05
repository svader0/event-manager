import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const EventStatistics = () => {
    const { id } = useParams();
    const [statistics, setStatistics] = useState([]);
    const [error, setError] = useState(null);
    const [totalSales, setTotalSales] = useState(0);
    const [averageQuantity, setAverageQuantity] = useState(0);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:3000/event/${id}/statistics`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStatistics(response.data);

                // Calculate total sales and average quantity per person
                const totalQuantity = response.data.reduce((sum, stat) => sum + stat.quantity, 0);
                const totalSales = totalQuantity * response.data[0]?.price || 0;
                const averageQuantity = totalQuantity / response.data.length || 0;

                setTotalSales(totalSales);
                setAverageQuantity(averageQuantity);
            } catch (error) {
                console.error("Error fetching event statistics:", error);
                setError("Failed to fetch event statistics. Please try again later.");
            }
        };

        fetchStatistics();
    }, [id]);

    return (
        <div className="container">
            <h1>Event Statistics</h1>
            {error && <p>{error}</p>}
            <div>
                <p>Total Sales: ${totalSales.toFixed(2)}</p>
                <p>Average Quantity per Person: {averageQuantity.toFixed(2)}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {statistics.map(stat => (
                        <tr key={stat.user_id}>
                            <td>{stat.first_name}</td>
                            <td>{stat.last_name}</td>
                            <td>{stat.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EventStatistics;