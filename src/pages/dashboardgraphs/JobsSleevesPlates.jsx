//this Jsx uses dynamic routing
import React, { useEffect, useState } from "react";
import "../dashboardgraphs/DashboardGraphs.css";
import Button from "../../components/button/Button.jsx";

import {
    ResponsiveContainer,
    BarChart,
    XAxis,
    YAxis,
    Bar,
    Tooltip,
    Legend,
} from "recharts";

import CustomGrid from "../../components/datagrid/CustomGrid.jsx";
import Spinner from "../../components/loader/Spinner.jsx";
import ErrorMessage from "../../components/errormessage/ErrorMessage.jsx";

import { useNavigate, useParams } from "react-router-dom";

export default function JobsSleevesPlates() {
    const navigate = useNavigate();
    const { monthKey } = useParams(); // dynamic route param

    const [dashboardData, setDashboardData] = useState(null);

    const [donutColors, setDonutColors] = useState({
        Jobs: "",
        Sleeves: "",
        Plates: "",
        UnusedDonutArea: "",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(null);

    const [jobListData, setJobListData] = useState([]);
    const [pageLimit, setPageLimit] = useState(12);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // load the color values from CSS upon mount (same as Dashboard.jsx)
    useEffect(() => {
        const getCSSVariable = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

        setDonutColors({
            Jobs: getCSSVariable("--color-jobs"),
            Sleeves: getCSSVariable("--color-sleeves"),
            Plates: getCSSVariable("--color-plates"),
            UnusedDonutArea: getCSSVariable("--color-unused"),
        });
    }, []);

    // custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) {
            return null;
        }

        const order = ["Jobs", "Sleeves", "Plates"];
        const orderedPayload = order
            .map((key) => payload.find((item) => item.name === key))
            .filter(Boolean);

        return (
            <div className="custom-tooltip">
                <strong>{label}</strong>
                <ul>
                    {orderedPayload.map((entry, index) => (
                        <li key={index}>
                            <span
                                className="tooltip-color-box"
                                style={{ backgroundColor: entry.color }}
                            ></span>
                                {entry.name}: {entry.value}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    // get dashboard update
    useEffect(() => {
        const controller = new AbortController();

        async function fetchDashboard() {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/dashboard/get_dashboard_update`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        },
                        signal: controller.signal,
                    }
                );

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = await res.json();
                setDashboardData(data);
            } catch (err) {
                if (err?.name !== "AbortError") {
                    console.error("Error fetching dashboard counts:", err);
                }
            }
        }

        fetchDashboard();
        return () => controller.abort();
    }, []);

    // mapping helper
    const makeChartDataForYear = (rows, year) =>
        (Array.isArray(rows) ? rows : [])
            .filter((data) => data.SelectedYear === year)
            .sort((a, b) => a.MonthNr - b.MonthNr)
            .map((data) => ({
                name: `${data.MonthName} ${data.SelectedYear}`,
                Jobs: data.Jobs ?? 0,
                Sleeves: data.Sleeves ?? 0,
                Plates: data.Plates ?? data.TotalPlates ?? 0,
            }));

    const currentYear = new Date().getFullYear();
    const jobRows = dashboardData?.JobSummary ?? [];

    const mountDataLastYear = makeChartDataForYear(jobRows, currentYear - 1);
    const mountDataCurrentYear = makeChartDataForYear(jobRows, currentYear);

    // desktop page limit 12, mobile 6
    useEffect(() => {
        const updatePageLimit = () => {
            const isMobile = window.innerWidth <= 768;
            setPageLimit(isMobile ? 6 : 12);
        };
        updatePageLimit();
        window.addEventListener("resize", updatePageLimit);
        return () => window.removeEventListener("resize", updatePageLimit);
    }, []);

    // when monthKey is present in the URL, open the modal and get details
    useEffect(() => {
        if (!monthKey) {
            setIsModalOpen(false);
            setSelectedMonth(null);
            setJobListData([]);
            setError(null);
            setLoading(false);
            return;
        }

        const decoded = decodeURIComponent(monthKey);
        setSelectedMonth(decoded);
        setIsModalOpen(true);
    }, [monthKey]);

    // get job details for the selected month
    useEffect(() => {
        if (!selectedMonth) {
            setJobListData([]);
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/jobs/get_jobs_by_year_month?SelectedMonthYear=${encodeURIComponent(
                        selectedMonth
                    )}`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        },
                        signal: controller.signal,
                    }
                );

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const json = await res.json();
                const data = Array.isArray(json) ? json : [];
                setJobListData(data);
            } catch (e) {
                if (e?.name === "AbortError") {
                    return;
                }
                console.error(e);
                setError(e?.message || "Unable to get data from server.");
                setJobListData([]);
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [selectedMonth]);

    const openMonth = (label) => {
        // label is like "Feb 2025" from the chart
        navigate(`/dashboard/jobs-sleeves-plates/${encodeURIComponent(label)}`);
    };

    const closeMonthPopup = () => {
        // go back to base page for this graph
        navigate("/dashboard/jobs-sleeves-plates");
    };

    return (
        <div className="modal-overlay-graph-container">
            <Button
                className="close-panel-btn"
                onClick={() => window.close()}>Close
            </Button>

            <div className="modal-graph-container-content">
                <h2>Total number of Jobs, Sleeves, Plates:</h2>

                {/* Current year */}
                <div className="responsiveContainerHeight400Padding60">
                    <ResponsiveContainer>
                        <BarChart
                            data={mountDataCurrentYear}
                            isAnimationActive={false}
                            onClick={(data) => {
                                if (data && data.activeLabel) {
                                    openMonth(data.activeLabel);
                                }
                            }}
                        >
                            <XAxis dataKey="name" style={{ fontSize: "12px" }} />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                content={() => (
                                    <ul className="custom-legend centered-legend">
                                        <li>
                                            <span className="legend-box jobs"></span> Jobs
                                        </li>
                                        <li>
                                            <span className="legend-box sleeves"></span> Sleeves
                                        </li>
                                        <li>
                                            <span className="legend-box plates"></span> Plates
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

                {/* Last year */}
                <div className="responsiveContainerHeight400Padding60">
                    <ResponsiveContainer>
                        <BarChart
                            data={mountDataLastYear}
                            isAnimationActive={false}
                            onClick={(data) => {
                                if (data && data.activeLabel) {
                                    openMonth(data.activeLabel);
                                }
                            }}
                        >
                            <XAxis dataKey="name" style={{ fontSize: "12px" }} />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                content={() => (
                                    <ul className="custom-legend">
                                        <li>
                                            <span className="legend-box jobs"></span> Jobs
                                        </li>
                                        <li>
                                            <span className="legend-box sleeves"></span> Sleeves
                                        </li>
                                        <li>
                                            <span className="legend-box plates"></span> Plates
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

                {/*Month details popup by :monthKey */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="btn-primary" onClick={closeMonthPopup}>
                                Close
                            </button>

                            <h3>Sales details for {selectedMonth}</h3>
                            <hr />

                            {selectedMonth && !loading && (
                                jobListData.length ? (
                                    <CustomGrid
                                        data={jobListData}
                                        columns={[
                                            { id: "JobID", name: "JobID", width: "120px" },
                                            { id: "JobName", name: "JobName", width: "130px" },
                                            { id: "JobNumber", name: "JobNumber", width: "130px" },
                                            {
                                                id: "TotalSleevesMounted",
                                                name: "Total Sleeves",
                                                width: "130px",
                                            },
                                            {
                                                id: "JobCompletionMinutes",
                                                name: "Completion in Minutes",
                                                width: "130px",
                                                formatter: (c) =>
                                                    typeof c === "number" ? c.toFixed(2) : "0.00",
                                            },
                                        ]}
                                        search
                                        sort
                                        pagination
                                        pageLimit={pageLimit}
                                    />
                                ) : (
                                    <div className="p-4 text-sm opacity-70">
                                        No data for {selectedMonth}.
                                    </div>
                                )
                            )}

                            {error && <ErrorMessage message={error} />}
                            {loading && <Spinner />}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

