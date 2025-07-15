import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import Button from "../../components/button/Button.jsx";
//
// temporary setup for now, needs way more work
const Dashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    const weekday = currentTime.toLocaleDateString(undefined, { weekday: 'long' });
    const date = currentTime.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);


    return (
        <div className="dashboard-container">
            <div className="dashboard-sidebar">
                <label>Your machines:</label>
                <select>
                    <option>Select</option>
                    <option>Machine 1</option>
                    <option>Machine 2</option>
                </select>

                <Button text="Job Center"  />
                <Button text="Total Jobs"  />
                <Button text="Avg. Time between Jobs"  />
                <Button text="Avg. Time between Sleeves"  />
            </div>

            <div className="dashboard-main">
                <div className="dashboard-row">
                    <div className="card">
                        <h2>Todays Schedule</h2>
                        <div className="schedule-stats">
                            <div className="stat">
                                <div className="stat-value">36%</div>
                                <div>Jobs</div>
                            </div>
                            <div className="stat">
                                <div className="stat-value">40%</div>
                                <div>Sleeves</div>
                            </div>
                            <div className="stat">
                                <div className="stat-value">45%</div>
                                <div>Plates</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2>Tomorrow</h2>
                        <div className="forecast-stats">
                            <div className="tomorrow-stat">
                                <div className="label">Jobs:</div>
                                <div className="value">322</div>
                            </div>
                            <div className="tomorrow-stat">
                                <div className="label">Sleeves:</div>
                                <div className="value">840</div>
                            </div>
                            <div className="tomorrow-stat">
                                <div className="label">Plates:</div>
                                <div className="value">1200</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2>Day after tomorrow</h2>
                        <div className="forecast-stats">
                            <div className="tomorrow-stat">
                                <div className="label">Jobs:</div>
                                <div className="value">299</div>
                            </div>
                            <div className="tomorrow-stat">
                                <div className="label">Sleeves:</div>
                                <div className="value">750</div>
                            </div>
                            <div className="tomorrow-stat">
                                <div className="label">Plates:</div>
                                <div className="value">1300</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-row">
                    <div className="card">
                        <h2>Mounting summary</h2>
                        <p>Ytd Jobs: 325</p>
                        <p>Ytd Sleeves: 752</p>
                        <p>Ytd Plates: 1840</p>
                        <p>Mtd Jobs: 63</p>
                    </div>

                    <div className="card">
                        <h2>Forecast</h2>
                        <p>Bounce Rate: 34%</p>
                        <p>New Visits: 68%</p>
                        <p>Search Traffic: 48%</p>
                        <p>Modern Browsers: 77%</p>
                        <p>Returning: 49%</p>
                    </div>
                </div>
            </div>
            <div className="dashboard-clock">
                <div className="clock-date">{weekday}, {date}</div>
                <div className="clock-time">
                    <span className="clock-hms">{hours}:{minutes}:{seconds}</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
