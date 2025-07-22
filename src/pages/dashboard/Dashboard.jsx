import React, {useState} from "react";
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

// to display a grid with data I am using an open source component from 'ag-grid'
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([ AllCommunityModule ]);
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Clock from "../../components/clock/Clock.jsx";


const Dashboard = () => {
    const [machine, setMachine] = useState('');
    const [showJobPanel, setShowJobPanel] = useState(false);
    const [showAvgTimeBetweenJobsPanel, setShowAvgTimeBetweenJobsPanel] = useState(false);
    const [showAvgTimeBetweenSleevesPanel, setShowAvgTimeBetweenSleevesPanel] = useState(false);

    //used to track which month was selected and if a modal form was opened, this is used as drilldown function on the graphs
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


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

    //data for Mounting Summary Ytd
    const mountingSummaryYtd = [
        {label: 'Jobs', value: 325, color: donutColors.Jobs},
        {label: 'Sleeves', value: 752, color: donutColors.Sleeves},
        {label: 'Plates', value: 1840, color: donutColors.Plates},
    ];

    //same for Mtd
    const mountingSummaryMtd = [
        {label: 'Jobs', value: 68, color: donutColors.Jobs},
        {label: 'Sleeves', value: 268, color: donutColors.Sleeves},
        {label: 'Plates', value: 512, color: donutColors.Plates},
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
        {name: 'Juli 19', Jobs: 322, Sleeves: 840, Plates: 1150},
        {name: 'Juli 20', Jobs: 299, Sleeves: 750, Plates: 1550}
    ];


    //data set for popup graph
    const mountData2023 = [
        {name: 'Jan 2023', Jobs: 350, Sleeves: 801, Plates: 1540},
        {name: 'Feb 2023', Jobs: 299, Sleeves: 601, Plates: 2540},
        {name: 'Mar 2023', Jobs: 210, Sleeves: 501, Plates: 1940},
        {name: 'Apr 2023', Jobs: 205, Sleeves: 901, Plates: 1240},
        {name: 'May 2023', Jobs: 260, Sleeves: 201, Plates: 1340},
        {name: 'Jun 2023', Jobs: 290, Sleeves: 401, Plates: 1840},
        {name: 'Jul 2023', Jobs: 399, Sleeves: 601, Plates: 1240},
        {name: 'Aug 2023', Jobs: 400, Sleeves: 1000, Plates: 270},
        {name: 'Sept 2023', Jobs: 450, Sleeves: 1200, Plates: 2400},
        {name: 'Oct 2023', Jobs: 460, Sleeves: 1100, Plates: 2200},
        {name: 'Nov 2023', Jobs: 560, Sleeves: 900, Plates: 1800},
        {name: 'Dec 2023', Jobs: 700, Sleeves: 800, Plates: 1200}
    ];

    const mountData2024 = [
        {name: 'Jan 2024', Jobs: 450, Sleeves: 801, Plates: 1540},
        {name: 'Feb 2024', Jobs: 299, Sleeves: 601, Plates: 2540},
        {name: 'Mar 2024', Jobs: 310, Sleeves: 501, Plates: 1940},
        {name: 'Apr 2024', Jobs: 305, Sleeves: 901, Plates: 1240},
        {name: 'May 2024', Jobs: 360, Sleeves: 201, Plates: 1340},
        {name: 'Jun 2024', Jobs: 390, Sleeves: 401, Plates: 1840},
        {name: 'Jul 2024', Jobs: 299, Sleeves: 601, Plates: 1240},
        {name: 'Aug 2024', Jobs: 30, Sleeves: 90, Plates: 270},
        {name: 'Sept 2024', Jobs: 0, Sleeves: 0, Plates: 0},
        {name: 'Oct 2024', Jobs: 0, Sleeves: 0, Plates: 0},
        {name: 'Nov 2024', Jobs: 0, Sleeves: 0, Plates: 0},
        {name: 'Dec 2024', Jobs: 0, Sleeves: 0, Plates: 0}
    ];


    const closePopup = () => {
        setIsModalOpen(false);
        setSelectedMonth(null);
    };

    const columnDefs = [
        { field: "make", sortable: true, filter: true },
        { field: "model", sortable: true, filter: true },
        { field: "price", sortable: true, filter: true }
    ];

    const defaultColDef = {
        resizable: true,
        flex: 1,
        minWidth: 100
    };


    //datasource for the drilldown details
    const drilldownData = {
        'Jan 2024': [
            { make: "Toyota", model: "Corolla", price: 20000 },
            { make: "Mazda", model: "3", price: 18000 }
        ],
        'Feb 2024': [
            { make: "Ford", model: "Focus", price: 22000 }
        ],
        'DEFAULT': [
            { make: 'No data', model: '—', price: 0 }
        ]
    };

    //filter based on selectedMonth, not found? shows Default value
    const drilldownGridData = drilldownData[selectedMonth] || drilldownData['DEFAULT'];

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

                {/*buttons to set toggle state that show a hidden div as overlay */}
                <Button onClick={() => setShowJobPanel(true)}>
                    Total Jobs, Sleeves, Plates
                </Button>
                <Button onClick={() => setShowAvgTimeBetweenJobsPanel(true)}>
                    Avg. Time between Jobs
                </Button>
                <Button onClick={() => setShowAvgTimeBetweenSleevesPanel(true)}>
                    Avg. Time between Sleeves
                </Button>

                <Clock />
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
                                    <div className="donut-chart" key={label}>
                                        <div className="donut-label">{label}</div>

                                        <div className="responsiveContainerDonut">
                                            <ResponsiveContainer>
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
                                    </div>
                                );
                            })}
                        </div>
                    </div>

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
                </div>

                {/* Row 2: Mounting Summary + next 2 days */}
                <div className="dashboard-row">
                    <div className="forecast-next-days">
                        <div className="forecast-tomorrow"> {/* You can rename class later if needed */}
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
                                        <Bar dataKey="Jobs" fill={donutColors.Jobs}/>
                                        <Bar dataKey="Sleeves" fill={donutColors.Sleeves}/>
                                        <Bar dataKey="Plates" fill={donutColors.Plates}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

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
                                                            innerRadius={40}
                                                            outerRadius={70}
                                                            startAngle={90}
                                                            endAngle={-270}
                                                            animationDuration={500}
                                                            labelLine={false}
                                                        >
                                                            <Cell fill={color}/>
                                                            <Cell fill="#f0f0f0"/>
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
                                                            innerRadius={40}
                                                            outerRadius={70}
                                                            startAngle={90}
                                                            endAngle={-270}
                                                            animationDuration={500}
                                                            labelLine={false}
                                                        >
                                                            <Cell fill={color}/>
                                                            <Cell fill="#f0f0f0"/>
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

            {/*when user clicks on Total Jobs, the modal overlay with a graph is shown*/}
            {showJobPanel && (
                <div className="modal-overlay-graph-container">
                    /* this button must be disabled when 2nd modal is showing */
                    <Button className="close-panel-btn"
                            onClick={() => setShowJobPanel(false)}
                            disabled={isModalOpen}>
                        Close
                    </Button>

                    <div className="modal-graph-container-content">
                        <h2>Total number of Jobs, Sleeves, Plates:</h2>
                        <div className="responsiveContainerHeight400Padding60">
                            <ResponsiveContainer>
                                <BarChart data={mountData2024}
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
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend
                                        content={() => (
                                            <ul className="custom-legend centered-legend">
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

                        <div className="responsiveContainerHeight400Padding60">
                            <ResponsiveContainer>
                                <BarChart data={mountData2023}
                                      onClick={(data) => {
                                          if (data && data.activeLabel) {
                                              setSelectedMonth(data.activeLabel);
                                              setIsModalOpen(true);
                                              console.log(data);
                                          }
                                      }}
                                >
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
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

                        {isModalOpen && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    {/*close-panel-btn*/}
                                    <button className="btn-primary" onClick={closePopup}>Close</button>

                                    <h3>Sales details voor {selectedMonth}</h3>
                                    <hr/>

                                    {/*80vh is max height of the modal, 70vh fits within w/o scroll bars*/}
                                    <div className="ag-theme-alpine custom-ag-grid" style={{ height: '68vh', width: 1400 }}>
                                        {/*{console.log("Selected Month:", selectedMonth)}*/}

                                        <AgGridReact
                                            rowData={drilldownGridData}
                                            columnDefs={columnDefs}
                                            defaultColDef={defaultColDef}
                                            rowHeight={35}
                                        />

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
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
                                <BarChart data={mountData2024}>
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend
                                        content={() => (
                                            <ul className="custom-legend centered-legend">
                                                <li><span className="legend-box"
                                                          style={{backgroundColor: '#0088FE'}}></span> Jobs
                                                </li>
                                            </ul>
                                        )}
                                    />
                                    <Bar dataKey="Jobs" fill={donutColors.Jobs}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="responsiveContainerHeight400Padding60">
                            <ResponsiveContainer>
                                <BarChart data={mountData2023}>
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend
                                        content={() => (
                                            <ul className="custom-legend">
                                                <li><span className="legend-box"
                                                          style={{backgroundColor: '#0088FE'}}></span> Jobs
                                                </li>
                                            </ul>
                                        )}
                                    />
                                    <Bar dataKey="Jobs" fill={donutColors.Jobs}/>
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
                                <BarChart data={mountData2024}>
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend
                                        content={() => (
                                            <ul className="custom-legend centered-legend">
                                                <li><span className="legend-box"
                                                          style={{backgroundColor: '#00C49F'}}></span> Sleeves
                                                </li>
                                            </ul>
                                        )}
                                    />
                                    <Bar dataKey="Sleeves" fill={donutColors.Sleeves}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="responsiveContainerHeight400Padding60">
                            <ResponsiveContainer>
                                <BarChart data={mountData2023}>
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend
                                        content={() => (
                                            <ul className="custom-legend">
                                                <li><span className="legend-box"
                                                          style={{backgroundColor: '#00C49F'}}></span> Sleeves
                                                </li>
                                            </ul>
                                        )}
                                    />
                                    <Bar dataKey="Sleeves" fill={donutColors.Sleeves}/>
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
