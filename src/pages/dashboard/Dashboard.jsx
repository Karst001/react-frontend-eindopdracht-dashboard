import React, {useState, useEffect} from "react";
import "./Dashboard.css";
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";
import {PieChart, Pie, Cell, ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip, Legend} from 'recharts';

// temporary setup for now, needs way more work
const Dashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    const weekday = currentTime.toLocaleDateString(undefined, {weekday: 'long'});
    const date = currentTime.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});

    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');
    const [machine, setMachine] = useState('');
    const [showJobPanel, setShowJobPanel] = useState(false);

    //set colors for donuts
    const donutColors = {
        Jobs: '#0088FE',
        Sleeves: '#00C49F',
        Plates: '#FFBB28',
    };

    // Define donut data and colors
    const donutData = [
        {label: 'Jobs', value: 22, color: donutColors.Jobs},
        {label: 'Sleeves', value: 48, color: donutColors.Sleeves},
        {label: 'Plates', value: 99, color: donutColors.Plates},
    ];

    // Calculate total based on highest value, this is done for proportional rendering instead of showing 3 donuts with 100% fill, kinda meaningless
    const donutMax = Math.max(...donutData.map(item => item.value));


    //forcast section
    const forecastData = [
        {name: 'Juli 21', Jobs: 34, Sleeves: 60, Plates: 90},
        {name: 'Juli 22', Jobs: 68, Sleeves: 85, Plates: 130},
        {name: 'Juli 23', Jobs: 48, Sleeves: 72, Plates: 110},
        {name: 'Juli 24', Jobs: 50, Sleeves: 50, Plates: 50},
        {name: 'Juli 25', Jobs: 60, Sleeves: 120, Plates: 120}
    ];

    //custom tooltip for forecast section
    const CustomTooltip = ({active, payload, label}) => {
        if (!active || !payload || !payload.length) return null;

        // Manually order the tooltip values
        const order = ['Jobs',
            'Sleeves',
            'Plates'];
        const orderedPayload = order.map(key =>
            payload.find(item => item.name === key)
        ).filter(Boolean); // remove undefined in case of missing data

        return (
            <div className="custom-tooltip">
                <strong>{label}</strong>
                <ul>
                    {orderedPayload.map((entry, index) => (
                        <li key={index}>
                            <span className="tooltip-color-box" style={{backgroundColor: entry.color}}>
                            </span>
                            {entry.name}: {entry.value}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    //data for Mounting Summary
    const mountingSummaryYtd = [
        { label: 'Jobs', value: 325, color: donutColors.Jobs },
        { label: 'Sleeves', value: 752, color: donutColors.Sleeves },
        { label: 'Plates', value: 1840, color: donutColors.Plates },
    ];

    const mountingSummaryMtd = [
        { label: 'Jobs', value: 68, color: donutColors.Jobs },
        { label: 'Sleeves', value: 268, color: donutColors.Sleeves },
        { label: 'Plates', value: 512, color: donutColors.Plates },
    ];

    //calculate max values so donuts are rendered proportionally, the MTD values are always less than YTD
    //so the YTD Plates set the stage for proportion
    const allValues = [
        ...mountingSummaryMtd.map(d => d.value),
        ...mountingSummaryYtd.map(d => d.value)
    ];
    const mountingSummaryMax = Math.max(...allValues);


    //data for tomorrow and day after
    const combinedForecastData = [
        { name: 'Juli 19', Jobs: 322, Sleeves: 840, Plates: 1150 },
        { name: 'Juli 20', Jobs: 299, Sleeves: 750, Plates: 1550 }
    ];

    // used for starting the clock to tick every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);


    return (
        <div className="dashboard-container">
            <div className="dashboard-sidebar">
                <Label label={<><span>Your machines:</span></>}>
                    <select value={machine} onChange={(e) => setMachine(e.target.value)} required>
                        <option value="">-- Select machine --</option>
                        <option value="machine1">FAMM 3.0</option>
                        <option value="machine2">SAMM 2.0</option>
                    </select>
                </Label>

                <Button text="Total Jobs" onClick={() => setShowJobPanel(true)} />
                <Button text="Avg. Time between Jobs"/>
                <Button text="Avg. Time between Sleeves"/>


                <div className="dashboard-clock">
                    <div className="clock-date">{weekday}, {date}</div>
                    <div className="clock-time">
                        <span className="clock-hms">{hours}:{minutes}:{seconds}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-main">
                {/* Row 1: Today + Forecast */}
                <div className="dashboard-row">
                    <div className="today-schedule">
                        <h2>Today's Schedule:</h2>

                        <div className="schedule-multi-donuts">
                            {donutData.map(({label, value, color}) => {
                                const data = [
                                    {name: label, value},
                                    {name: 'Remaining', value: donutMax - value}
                                ];

                                return (
                                    //some inline is used because Rechart does not accept something like this <ResponsiveContainer className="forecast-chart">
                                    //it won't render
                                    <div className="donut-chart" key={label}>
                                        <div className="donut-label">{label}</div>
                                        <ResponsiveContainer width="100%" height={160}>
                                            <PieChart>
                                                <Pie
                                                    data={data}
                                                    dataKey="value"
                                                    innerRadius={40}
                                                    outerRadius={70}
                                                    startAngle={90}
                                                    endAngle={-270}
                                                    animationDuration={500}
                                                    labelLine={false}
                                                >

                                                    <Cell fill={color}/>
                                                    <Cell fill="#f0f0f0"/>

                                                    {/* Custom label as a separate SVG element */}
                                                    <text
                                                        x="50%"
                                                        y="50%"
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        fontSize={26}
                                                        fill="#333"
                                                    >
                                                        {value}
                                                    </text>
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="forecast">
                        <h2>Forecast up to 7 days:</h2>

                        {/*same here, some inline CSS required by Rechart*/}
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={forecastData}
                                layout="vertical"
                                margin={{top: 10, right: 30, left: 60, bottom: 10}}
                            >
                                <XAxis type="number"/>
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{className: 'forecast-bar-label'}}
                                />
                                <Tooltip content={<CustomTooltip/>}/>
                                <Legend
                                    content={() => (
                                        <ul className="custom-legend">
                                            <li><span className="legend-box"
                                                      style={{backgroundColor: '#0088FE'}}></span> Jobs
                                            </li>
                                            <li><span className="legend-box"
                                                      style={{backgroundColor: '#00C49F'}}></span> Sleeves
                                            </li>
                                            <li><span className="legend-box"
                                                      style={{backgroundColor: '#FFBB28'}}></span> Plates
                                            </li>
                                        </ul>
                                    )}
                                />
                                <Bar dataKey="Jobs" stackId="a" fill="#0088FE"/>
                                <Bar dataKey="Sleeves" stackId="a" fill="#00C49F"/>
                                <Bar dataKey="Plates" stackId="a" fill="#FFBB28"/>

                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Row 2: Mounting Summary + next 2 days */}
                <div className="dashboard-row">
                    <div className="forecast-next-days">
                        <div className="forecast-tomorrow"> {/* You can rename class later if needed */}
                            <h2>Next 2 Days</h2>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={combinedForecastData}>
                                    <XAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{className: 'forecast-bar-label'}}
                                    />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend
                                        content={() => (
                                            <ul className="custom-legend">
                                                <li><span className="legend-box"
                                                          style={{backgroundColor: '#0088FE'}}></span> Jobs
                                                </li>
                                                <li><span className="legend-box"
                                                          style={{backgroundColor: '#00C49F'}}></span> Sleeves
                                                </li>
                                                <li><span className="legend-box"
                                                          style={{backgroundColor: '#FFBB28'}}></span> Plates
                                                </li>
                                            </ul>
                                        )}
                                    />
                                    <Bar dataKey="Jobs" fill={donutColors.Jobs} />
                                    <Bar dataKey="Sleeves" fill={donutColors.Sleeves} />
                                    <Bar dataKey="Plates" fill={donutColors.Plates} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="mounting-summary">
                        <h2>Mounting summary:</h2>

                        <div className="mounting-donuts-row">
                            <div className="time-period-label">MTD</div>
                            <div className="mounting-donuts-grid">
                                {mountingSummaryMtd.map(({ label, value, color }) => {
                                    const data = [
                                        { name: label, value },
                                        { name: 'Remaining', value: mountingSummaryMax - value }
                                    ];

                                    return (
                                        <div className="donut-chart" key={label}>
                                            <div className="donut-label">{label}</div>
                                            <ResponsiveContainer width="100%" height={160}>
                                                <PieChart>
                                                    <Pie
                                                        data={data}
                                                        dataKey="value"
                                                        innerRadius={40}
                                                        outerRadius={70}
                                                        startAngle={90}
                                                        endAngle={-270}
                                                        animationDuration={500}
                                                        labelLine={false}
                                                    >
                                                        <Cell fill={color} />
                                                        <Cell fill="#f0f0f0" />
                                                        <text
                                                            x="50%"
                                                            y="50%"
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            fontSize={24}
                                                            fill="#333"
                                                        >
                                                            {value}
                                                        </text>
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mounting-donuts-row">
                            <div className="time-period-label">YTD</div>
                            <div className="mounting-donuts-grid">
                                {mountingSummaryYtd.map(({ label, value, color }) => {
                                    const data = [
                                        { name: label, value },
                                        { name: 'Remaining', value: mountingSummaryMax - value }
                                    ];

                                    return (
                                        <div className="donut-chart" key={label}>
                                            <div className="donut-label">{label}</div>
                                            <ResponsiveContainer width="100%" height={160}>
                                                <PieChart>
                                                    <Pie
                                                        data={data}
                                                        dataKey="value"
                                                        innerRadius={40}
                                                        outerRadius={70}
                                                        startAngle={90}
                                                        endAngle={-270}
                                                        animationDuration={500}
                                                        labelLine={false}
                                                    >
                                                        <Cell fill={color} />
                                                        <Cell fill="#f0f0f0" />
                                                        <text
                                                            x="50%"
                                                            y="50%"
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            fontSize={24}
                                                            fill="#333"
                                                        >
                                                            {value}
                                                        </text>
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showJobPanel && (
                <div className="job-panel">
                    <button className="close-panel-btn" onClick={() => setShowJobPanel(false)}>Close</button>
                    <div className="panel-content">
                        {/* You can put your graph here */}
                        <h2>Total Jobs Graph</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={forecastData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="Jobs" fill="#0088FE" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
