import React, { useEffect, useState } from "react";
// no style sheet for the clock

//removed the clock from the dashboard as the useEffect was re-rendering the page each second, this was visible in the Console.log
//Now its a separate component that can be called from any page if desired.
const Clock = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const weekday = currentTime.toLocaleDateString(undefined, { weekday: "long" });
    const date = currentTime.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    const hours = String(currentTime.getHours()).padStart(2, "0");
    const minutes = String(currentTime.getMinutes()).padStart(2, "0");
    const seconds = String(currentTime.getSeconds()).padStart(2, "0");

    return (
        <div className="dashboard-clock">
            <div className="clock-date">{weekday}, {date}</div>
            <div className="clock-time">
                <span className="clock-hms">{hours}:{minutes}:{seconds}</span>
            </div>
        </div>
    );
};

export default Clock;