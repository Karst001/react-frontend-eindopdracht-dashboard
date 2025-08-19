import React, {useEffect, useState} from "react";
import "./Dashboard.css";
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";
// To display pies and bar charts I am using an open source component from 'recharts'
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    XAxis,
    YAxis,
    Bar,
    Tooltip,
    Legend,
} from 'recharts';

import Clock from "../../components/clock/Clock.jsx";
import CustomGrid from "../../components/datagrid/CustomGrid.jsx";
import { useInternetStatus  } from '../../hooks/useInternetStatus.js';
import Spinner from "../../components/loader/Spinner.jsx";
import ErrorMessage from "../../components/errormessage/ErrorMessage.jsx";

const Dashboard = () => {
    const [machine, setMachine] = useState('');
    const [selectedMachine, setSelectedMachine] = useState({ value: '', label: '' });
    const [showJobPanel, setShowJobPanel] = useState(false);
    const [showAvgTimeBetweenJobsPanel, setShowAvgTimeBetweenJobsPanel] = useState(false);
    const [showAvgTimeBetweenSleevesPanel, setShowAvgTimeBetweenSleevesPanel] = useState(false);

    //used to track which month was selected and if a modal form was opened, this is used as drilldown function on the graphs
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pageLimit, setPageLimit] = useState(12); //to track the page limit in the CustomGrid
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [jobListData, setJobListData] = useState([]);
    //used to track if screen is mobile or not, if mobile then the pie charts are smaller size
    const isMobile = window.innerWidth <= 768;
    const [hamburgerOpen, setHamburgerOpen] = useState(false);


    //track if internet is online or not, if it changes trigger the fetch routine to update dashboard
    const isOnline = useInternetStatus();

    //set colors for donuts via a state, load initial blank color value into state
    const [donutColors, setDonutColors] = useState({
        Jobs: '',
        Sleeves: '',
        Plates: '',
        UnusedDonutArea: ''
    });

    //load the color values from CSS upon a page mount
    useEffect(() => {
        const getCSSVariable = name =>
            getComputedStyle(document.documentElement).getPropertyValue(name).trim();

        setDonutColors({
            Jobs: getCSSVariable('--color-jobs'),
            Sleeves: getCSSVariable('--color-sleeves'),
            Plates: getCSSVariable('--color-plates'),
            UnusedDonutArea: getCSSVariable('--color-unused'),
        });
        //usage further in jsx: donutColors.Jobs instead of inline css
    }, []);

    //custom tooltip
    const CustomTooltip = ({active, payload, label}) => {
        if (!active || !payload || !payload.length) return null;

        // set the correct order of tooltip values
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

    const closePopup = () => {
        setIsModalOpen(false);
        setSelectedMonth(null);
    };


    //get the job details when user selects a month in a graph
    useEffect(() => {
        if (!selectedMonth) { setJobListData([]); return; }

        const controller = new AbortController();
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/jobs/get_jobs_by_year_month?SelectedMonthYear=${encodeURIComponent(selectedMonth)}`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        },
                        signal: controller.signal,
                    }
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();

                const data = Array.isArray(json) ? json : [];
                setJobListData(data);
            } catch (e) {
                if (e.name === "AbortError") return;                                    // request was cancelled; ignore
                console.error(e);
                setError(e.message || "Unable to get data from server.");
                setJobListData([]);                                             //set an empty array so the grid won't complain
            } finally {
                setLoading(false);
            }
        })();

        // cancel in-flight fetch when selectedMonth changes or component unmounts
        return () => controller.abort();
    }, [selectedMonth]);


    // the requirement is that on desktop the page limit for CustomGrid is 12
    //on mobile it is 6 so the user is not required to scroll up/down
    useEffect(() => {
        const updatePageLimit = () => {
            const isMobile = window.innerWidth <= 768;
            setPageLimit(isMobile && isModalOpen ? 6 : 12);
        };

        updatePageLimit(); // run on mount and on modal open

        window.addEventListener('resize', updatePageLimit);
        return () => window.removeEventListener('resize', updatePageLimit);
    }, [isModalOpen]);

    //Today's Schedule
    const [dashboardData, setDashboardData] = useState(null);
    const today = dashboardData?.TodaysSchedule?.[0]; // first (and only) object in TodaysSchedule
    const donutData = today
        ? [
            { label: "Jobs", value: today.Jobs, color: donutColors.Jobs },
            { label: "Sleeves", value: today.Sleeves, color: donutColors.Sleeves },
            { label: "Plates", value: today.Plates, color: donutColors.Plates }
        ]
        : [];

    // Calculate total based on highest value, this is done for proportional rendering instead of showing 3 donuts with 100% fill, kinda meaningless
    const donutMax = Math.max(...donutData.map(item => item.value));


    //data for tomorrow and day after
    const nextTwoDays = dashboardData?.NextTwoDays?.[0]; // first (and only) object in NextTwoDays
    const combinedForecastData = nextTwoDays ?
        dashboardData.NextTwoDays.map(day => ({
            name: day.ForDate,
            Jobs: day.Jobs,
            Sleeves: day.Sleeves,
            Plates: day.Plates
        })) : [];

    //forecast section
    const nextFiveDays = dashboardData?.NextFiveDays?.[0]; // first (and only) object in NextFiveDays
    const forecastData = nextFiveDays ?
        dashboardData.NextFiveDays.map(day => ({
            name: day.ForDate,
            Jobs: day.Jobs,
            Sleeves: day.Sleeves,
            Plates: day.Plates
        })) : [];

    //summary Mtd
    const summaryMtd = dashboardData?.MountingSummary?.MTD?.[0];
    const mountingSummaryMtd = summaryMtd
        ? [
            { label: "Jobs", value: summaryMtd.Jobs, color: donutColors.Jobs },
            { label: "Sleeves", value: summaryMtd.Sleeves, color: donutColors.Sleeves },
            { label: "Plates", value: summaryMtd.Plates, color: donutColors.Plates }
        ]
        : [];

    // summary YTD
    const summaryYtd = dashboardData?.MountingSummary?.YTD?.[0];
    const mountingSummaryYtd = summaryYtd
        ? [
            { label: "Jobs", value: summaryYtd.Jobs, color: donutColors.Jobs },
            { label: "Sleeves", value: summaryYtd.Sleeves, color: donutColors.Sleeves },
            { label: "Plates", value: summaryYtd.Plates, color: donutColors.Plates }
        ]
        : [];

    //calculate max values so donuts are rendered proportionally, the MTD values are always less than YTD
    //so the YTD Plates set the stage for proportion
    const allValues = [
        ...mountingSummaryMtd.map(d => d.value),
        ...mountingSummaryYtd.map(d => d.value)
    ];
    const mountingSummaryMax = Math.max(...allValues, 0);


    //Jobs overview helper to convert the data from API to expected data for graph
    const makeChartDataForYear = (rows = [], year) =>
        (Array.isArray(rows) ? rows : [])
            .filter(data => data.SelectedYear === year)
            .sort((a, b) => a.MonthNr - b.MonthNr)
            .map(data => ({
                name: `${data.MonthName} ${data.SelectedYear}`,
                Jobs: data.Jobs ?? 0,
                Sleeves: data.Sleeves ?? 0,
                Plates: data.Plates ?? data.TotalPlates ?? 0,
                AvgTimeBetweenJobs: data.AvgTimeBetweenJobs ?? 0,
                AvgTimeBetweenSleeves: data.AvgTimeBetweenSleeves ?? 0,
            }));

    const currentYear = new Date().getFullYear();
    // pull the right array from the payload
    const jobRows = dashboardData?.JobSummary ?? [];
    const mountDataLastYear    = makeChartDataForYear(jobRows, currentYear - 1);
    const mountDataCurrentYear = makeChartDataForYear(jobRows, currentYear);





    //to display the functionality of the dashboard, for now the dashboard fetches new data from SQL every 5 seconds
    //in a real live scenario the website could use a trigger from SQL database via the API to tell the website 'there is new data' or a webhook, this is beyond the scope of this project
    useEffect(() => {
        if (!isOnline || (showJobPanel || showAvgTimeBetweenJobsPanel || showAvgTimeBetweenSleevesPanel)) {
            // Don't refresh data on dashboard if any panel is open or when internet is interrupted
            return;
        }

        let intervalId;
        let controller = new AbortController();

        async function fetchDashboard() {
            controller.abort();                     // Cancel any previous request before starting a new one
            controller = new AbortController();

            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/dashboard/get_dashboard_update`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        },
                        signal: controller.signal, // pass controller signal
                    }
                );

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setDashboardData(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error fetching dashboard counts:", err);
                }
            }
        }

        fetchDashboard();                                               // Fetch immediately on mount

        intervalId = setInterval(fetchDashboard, 5000);         // Then fetch every 5 seconds for demonstration purposes


        return () => {                                            // Cleanup when leaving Home page
            clearInterval(intervalId);
            controller.abort();                                         // cancel any in-progress request
        };
    }, [isOnline, showJobPanel, showAvgTimeBetweenJobsPanel, showAvgTimeBetweenSleevesPanel]);



    return (
        // wrapped inside a class because there is a Home button on mobile page
        // when Home is pressed the Dashboard menu disappears and the default navbar appears again
        <div className="dashboard">
            {/*on mobile the buttons needs to be replaced by a hamburger menu*/}
            {/*when any modal form is visible, hide the hamburger menu*/}
            {isMobile && !( showJobPanel || showAvgTimeBetweenJobsPanel || showAvgTimeBetweenSleevesPanel )
                && (
                <>
                    {/*create a space at top of page so content scrolls behind*/}
                    <div className="mobile-header-spacer" />

                    <div className="mobile-header-controls">
                        <button
                            className="mobile-hamburger btn-naked"
                            onClick={() => setHamburgerOpen(prev => !prev)}
                            aria-label="Toggle dashboard menu"
                        >
                            {hamburgerOpen ? '✕' : '☰'}
                        </button>

                        {selectedMachine.label && (
                            // display the selected machine between hamburger menu and home button
                            <div className="mobile-machine-name">
                                Current machine: {selectedMachine.label}
                            </div>
                        )}

                        <Button
                            className="mobile-home-btn"
                            onClick={() => window.location.href = '/'}
                        >
                            Home
                        </Button>
                    </div>

                    {hamburgerOpen && (
                        <div className="mobile-menu-panel">
                            <div className="mobile-dropdown">
                                <Label>
                                    <select
                                        value={machine}
                                        onChange={(e) => {
                                            const selectedOption = e.target.selectedOptions[0];
                                            setSelectedMachine({
                                                value: selectedOption.value,
                                                label: selectedOption.textContent,
                                            });
                                            setMachine(e.target.value);
                                            setHamburgerOpen(false);
                                        }}
                                        required
                                    >
                                        <option value="">-- Select machine --</option>
                                        <option value="machine1">FAMM 3.0</option>
                                        <option value="machine2">SAMM 2.0</option>
                                    </select>
                                </Label>
                            </div>

                            <div className="mobile-button-row">
                                <Button onClick={() => {
                                    setShowJobPanel(true);
                                    setHamburgerOpen(false);            //close the hamburgern menu when selection was made
                                }}>
                                    Jobs, Sleeves, Plates
                                </Button>

                                <Button onClick={() => {
                                    setShowAvgTimeBetweenJobsPanel(true);
                                    setHamburgerOpen(false);            //close the hamburgern menu when selection was made
                                }}>
                                    Time between Jobs
                                </Button>

                                <Button onClick={() => {
                                    setShowAvgTimeBetweenSleevesPanel(true);
                                    setHamburgerOpen(false);            //close the hamburgern menu when selection was made
                                }}>
                                    Time between Sleeves
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Main dashboard, only visible if not on mobile OR no panel is open */}
            {!(isMobile && (showJobPanel || showAvgTimeBetweenJobsPanel || showAvgTimeBetweenSleevesPanel)) && (
                <div className="dashboard-container">
                    <div className="dashboard-sidebar">
                        <Label>
                            <select value={machine} onChange={(e) => setMachine(e.target.value)} required>
                                <option value="">-- Select machine --</option>
                                <option value="machine1">FAMM 3.0</option>
                                <option value="machine2">SAMM 2.0</option>
                            </select>
                        </Label>

                        <div className="dashboard-button-row">
                            <Button onClick={() => setShowJobPanel(true)}>
                                Jobs, Sleeves, Plates
                            </Button>
                            <Button onClick={() => setShowAvgTimeBetweenJobsPanel(true)}>
                                Time between Jobs
                            </Button>
                            <Button onClick={() => setShowAvgTimeBetweenSleevesPanel(true)}>
                                Time between Sleeves
                            </Button>
                        </div>

                        <Clock className="dashboard-clock" />
                    </div>


                    <div className="dashboard-main">
                        <div className="dashboard-section">
                            <div className="today-schedule">
                                <h2>Today's Schedule:</h2>

                                <div className="schedule-multi-donuts">
                                    {donutData.map(({label, value, color}) => {
                                        const data = [
                                            {name: label, value},
                                            {name: 'Remaining', value: donutMax - value}
                                        ];

                                        return (
                                            <div className="donut-chart" key={label}>
                                                <div className="donut-label">{label}</div>

                                                <div className="responsiveContainerDonut">
                                                    <ResponsiveContainer>
                                                        <PieChart>
                                                            <Pie
                                                                data={data}
                                                                dataKey="value"
                                                                innerRadius={isMobile ? 35 : 50} //smaller on mobile
                                                                outerRadius={isMobile ? 54 : 80} //smaller on mobile
                                                                startAngle={90}
                                                                endAngle={-270}
                                                                animationDuration={500}
                                                                labelLine={false}
                                                            >
                                                                <Cell fill={color}/>
                                                                <Cell fill={donutColors.UnusedDonutArea}/>

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
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                        <div className="dashboard-section">
                            <div className="forecast">
                                <h2>Forecast up to 7 days:</h2>

                                {/*same here, some inline CSS required by Rechart*/}
                                <div className="responsiveContainerHeight300">
                                    <ResponsiveContainer>
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
                                                        <li><span className="legend-box jobs"></span> Jobs
                                                        </li>
                                                        <li><span className="legend-box sleeves"></span> Sleeves
                                                        </li>
                                                        <li><span className="legend-box plates"></span> Plates
                                                        </li>
                                                    </ul>
                                                )}
                                            />
                                            <Bar dataKey="Jobs" stackId="a" fill={donutColors.Jobs}/>
                                            <Bar dataKey="Sleeves" stackId="a" fill={donutColors.Sleeves}/>
                                            <Bar dataKey="Plates" stackId="a" fill={donutColors.Plates}/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                        <div className="dashboard-section">
                            <div className="forecast-next-days">
                                <div className="forecast-tomorrow">
                                    <h2>Next 2 Days</h2>
                                    <div className="responsiveContainerHeight400">
                                        <ResponsiveContainer>
                                            <BarChart data={combinedForecastData}>
                                                <XAxis
                                                    dataKey="name"
                                                    type="category"
                                                    tick={{className: 'forecast-bar-label'}}
                                                />
                                                <YAxis/>
                                                <Tooltip content={<CustomTooltip/>}/>
                                                <Legend
                                                    content={() => (
                                                        <ul className="custom-legend">
                                                            <li><span className="legend-box jobs"></span> Jobs
                                                            </li>
                                                            <li><span className="legend-box sleeves"></span> Sleeves
                                                            </li>
                                                            <li><span className="legend-box plates"></span> Plates
                                                            </li>
                                                        </ul>
                                                    )}
                                                />
                                                <Bar dataKey="Jobs" fill={donutColors.Jobs}/>
                                                <Bar dataKey="Sleeves" fill={donutColors.Sleeves}/>
                                                <Bar dataKey="Plates" fill={donutColors.Plates}/>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="dashboard-section">
                            <div className="mounting-summary">
                                <h2>Mounting summary:</h2>

                                <div className="mounting-donuts-row">
                                    <div className="time-period-label">MTD</div>
                                    <div className="mounting-donuts-grid">
                                        {mountingSummaryMtd.map(({label, value, color}) => {
                                            const data = [
                                                {name: label, value},
                                                {name: 'Remaining', value: mountingSummaryMax - value}
                                            ];

                                            return (
                                                <div className="donut-chart" key={label}>
                                                    <div className="donut-label">{label}</div>
                                                    <div className="responsiveContainerDonut">
                                                        <ResponsiveContainer>
                                                            <PieChart>
                                                                <Pie
                                                                    data={data}
                                                                    dataKey="value"
                                                                    innerRadius={isMobile ? 35 : 40} //smaller on mobile
                                                                    outerRadius={isMobile ? 54 : 70} //smaller on mobile
                                                                    startAngle={90}
                                                                    endAngle={-270}
                                                                    animationDuration={500}
                                                                    labelLine={false}
                                                                >
                                                                    <Cell fill={color}/>
                                                                    <Cell fill={donutColors.UnusedDonutArea}/>
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
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mounting-donuts-row">
                                    <div className="time-period-label">YTD</div>
                                    <div className="mounting-donuts-grid">
                                        {mountingSummaryYtd.map(({label, value, color}) => {
                                            const data = [
                                                {name: label, value},
                                                {name: 'Remaining', value: mountingSummaryMax - value}
                                            ];

                                            return (
                                                <div className="donut-chart" key={label}>
                                                    <div className="donut-label">{label}</div>
                                                    <div className="responsiveContainerDonut">
                                                        <ResponsiveContainer>
                                                            <PieChart>
                                                                <Pie
                                                                    data={data}
                                                                    dataKey="value"
                                                                    innerRadius={isMobile ? 35 : 40} //smaller on mobile
                                                                    outerRadius={isMobile ? 54 : 70} //smaller on mobile
                                                                    startAngle={90}
                                                                    endAngle={-270}
                                                                    animationDuration={500}
                                                                    labelLine={false}
                                                                >
                                                                    <Cell fill={color}/>
                                                                    <Cell fill={donutColors.UnusedDonutArea}/>
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
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals still render normally, below the condition */}
            {showJobPanel && (
                <div className="modal-overlay-graph-container">
                    /* this button must be disabled when 2nd modal is showing */
                    {!isModalOpen && (
                        <Button className="close-panel-btn"
                                onClick={() => setShowJobPanel(false)}
                        >
                            Close
                        </Button>
                    )}

                    <div className="modal-graph-container-content">
                        <h2>Total number of Jobs, Sleeves, Plates:</h2>
                        <div className="responsiveContainerHeight400Padding60">
                            <ResponsiveContainer>
                                <BarChart data={mountDataCurrentYear}
                                          isAnimationActive={false}
                                          onClick={(data) => {

                                              // console.log('Clicked data:', data);
                                              if (data && data.activeLabel) {
                                                  setSelectedMonth(data.activeLabel);
                                                  setIsModalOpen(true);
                                                  // console.log(data);
                                              }
                                          }}
                                >
                                    <XAxis
                                        dataKey="name"
                                        style={{ fontSize: '12px' }} //CSS doesn't work on this item
                                    />
                                    <YAxis/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend
                                        content={() => (
                                            <ul className="custom-legend centered-legend">
                                                <li><span className="legend-box jobs"></span> Jobs
                                                </li>
                                                <li><span className="legend-box sleeves"></span> Sleeves
                                                </li>
                                                <li><span className="legend-box plates"></span> Plates
                                                </li>
                                            </ul>
                                        )}
                                    />
                                    <Bar dataKey="Jobs" fill={donutColors.Jobs}/>
                                    <Bar dataKey="Sleeves" fill={donutColors.Sleeves}/>
                                    <Bar dataKey="Plates" fill={donutColors.Plates}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="responsiveContainerHeight400Padding60">
                            <ResponsiveContainer>
                                <BarChart data={mountDataLastYear}
                                          onClick={(data) => {
                                              if (data && data.activeLabel) {
                                                  setSelectedMonth(data.activeLabel);
                                                  setIsModalOpen(true);
                                                  console.log(data);
                                              }
                                          }}
                                >
                                    <XAxis
                                        dataKey="name"
                                        style={{ fontSize: '12px' }} //CSS doesn't work on this item
                                    />
                                    <YAxis/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend
                                        content={() => (
                                            <ul className="custom-legend">
                                                <li><span className="legend-box jobs"></span>
                                                    Jobs
                                                </li>
                                                <li><span className="legend-box sleeves"></span>
                                                    Sleeves
                                                </li>
                                                <li><span className="legend-box plates"></span>
                                                    Plates
                                                </li>
                                            </ul>
                                        )}
                                    />
                                    <Bar dataKey="Jobs" fill={donutColors.Jobs}/>
                                    <Bar dataKey="Sleeves" fill={donutColors.Sleeves}/>
                                    <Bar dataKey="Plates" fill={donutColors.Plates}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {isModalOpen && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    {/*close-panel-btn*/}
                                    <button className="btn-primary"
                                            onClick={closePopup}>
                                        Close
                                    </button>

                                    <h3>Sales details for {selectedMonth}</h3>
                                    <hr/>

                                    {selectedMonth && !loading && (
                                        jobListData.length ? (
                                            <CustomGrid
                                                data={jobListData}
                                                columns={[
                                                    { id: 'JobID',                name: 'JobID',          width: '120px' },
                                                    { id: 'JobName',              name: 'JobName',        width: '130px' },
                                                    { id: 'JobNumber',            name: 'JobNumber',      width: '130px' },
                                                    { id: 'TotalSleevesMounted',  name: 'Total Sleeves',    width: '130px' },
                                                    { id: 'JobCompletionMinutes', name: 'Completion in Minutes',     width: '130px',
                                                        formatter: c => (typeof c === 'number' ? c.toFixed(2) : '0.00') },
                                                ]}
                                                search
                                                sort
                                                pagination
                                                pageLimit={pageLimit}
                                            />
                                        ) : (
                                            <div className="p-4 text-sm opacity-70">No data for {selectedMonth}.</div>
                                        )
                                    )}

                                    {error && <ErrorMessage message={error} />}
                                </div>
                            </div>
                        )}
                    </div>
                    {loading && <Spinner/>}
                </div>
            )}

            {showAvgTimeBetweenJobsPanel && (
                <div className="modal-overlay-graph-container">
                    <button className="close-panel-btn" onClick={() => setShowAvgTimeBetweenJobsPanel(false)}>Close
                    </button>
                    <div className="modal-graph-container-content">
                        <h2>Avg. Time between Jobs in minutes:</h2>
                        <div className="responsiveContainerHeight400Padding60">
                            <ResponsiveContainer>
                                <BarChart data={mountDataCurrentYear}>
                                    <XAxis
                                        dataKey="name"
                                        style={{ fontSize: '12px' }} //CSS doesn't work on this item
                                    />
                                    <YAxis/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend
                                        content={() => (
                                            <ul className="custom-legend centered-legend">
                                                <li><span className="legend-box jobs"></span>
                                                    Jobs
                                                </li>
                                            </ul>
                                        )}
                                    />
                                    <Bar dataKey="AvgTimeBetweenJobs" fill={donutColors.Jobs}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="responsiveContainerHeight400Padding60">
                            <ResponsiveContainer>
                                <BarChart data={mountDataLastYear}>
                                    <XAxis
                                        dataKey="name"
                                        style={{ fontSize: '12px' }} //CSS doesn't work on this item
                                    />
                                    <YAxis/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend
                                        content={() => (
                                            <ul className="custom-legend">
                                                <li><span className="legend-box jobs"></span>
                                                    Jobs
                                                </li>
                                            </ul>
                                        )}
                                    />
                                    <Bar dataKey="AvgTimeBetweenJobs" fill={donutColors.Jobs}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {showAvgTimeBetweenSleevesPanel && (
                <div className="modal-overlay-graph-container">
                    <button className="close-panel-btn" onClick={() => setShowAvgTimeBetweenSleevesPanel(false)}>Close
                    </button>
                    <div className="modal-graph-container-content">
                        <h2>Avg. Time between Sleeves in minutes:</h2>
                        <div className="responsiveContainerHeight400Padding60">
                            <ResponsiveContainer>
                                <BarChart data={mountDataCurrentYear}>
                                    <XAxis
                                        dataKey="name"
                                        style={{ fontSize: '12px' }} //CSS doesn't work on this item
                                    />
                                    <YAxis/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend
                                        content={() => (
                                            <ul className="custom-legend centered-legend">
                                                <li><span className="legend-box sleeves"></span>
                                                    Sleeves
                                                </li>
                                            </ul>
                                        )}
                                    />
                                    <Bar dataKey="AvgTimeBetweenSleeves" fill={donutColors.Sleeves}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="responsiveContainerHeight400Padding60">
                            <ResponsiveContainer>
                                <BarChart data={mountDataLastYear}>
                                    <XAxis
                                        dataKey="name"
                                        style={{ fontSize: '12px' }} //CSS doesn't work on this item
                                    />
                                    <YAxis/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend
                                        content={() => (
                                            <ul className="custom-legend">
                                                <li><span className="legend-box sleeves"></span>
                                                    Sleeves
                                                </li>
                                            </ul>
                                        )}
                                    />
                                    <Bar dataKey="AvgTimeBetweenSleeves" fill={donutColors.Sleeves}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;