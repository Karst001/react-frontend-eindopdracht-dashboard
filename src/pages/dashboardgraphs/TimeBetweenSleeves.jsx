import React, { useEffect, useState } from "react";
import "../dashboardgraphs/DashboardGraphs.css";
import Button from "../../components/button/Button.jsx";
import Spinner from "../../components/loader/Spinner.jsx";
import ErrorMessage from "../../components/errormessage/ErrorMessage.jsx";

import {
    ResponsiveContainer,
    BarChart,
    XAxis,
    YAxis,
    Bar,
    Tooltip,
    Legend,
} from "recharts";


export default function TimeBetweenSleeves() {

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [donutColors, setDonutColors] = useState({
        Sleeves: "",
    });

    // Load color from CSS
    useEffect(() => {
        const getCSSVariable = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

        setDonutColors({
            Sleeves: getCSSVariable("--color-sleeves"),
        });
    }, []);

    //mapping
    const makeChartDataForYear = (rows = [], year) =>
        (Array.isArray(rows) ? rows : [])
            .filter((data) => data.SelectedYear === year)
            .sort((a, b) => a.MonthNr - b.MonthNr)
            .map((data) => ({
                name: `${data.MonthName} ${data.SelectedYear}`,
                AvgTimeBetweenSleeves: data.AvgTimeBetweenSleeves ?? 0,
            }));

    const currentYear = new Date().getFullYear();
    const jobRows = dashboardData?.JobSummary ?? [];
    const mountDataLastYear = makeChartDataForYear(jobRows, currentYear - 1);
    const mountDataCurrentYear = makeChartDataForYear(jobRows, currentYear);

    //get update once
    useEffect(() => {
        const controller = new AbortController();

        async function fetchDashboard() {
            setLoading(true);
            setError(null);

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
                if (err?.name === "AbortError") {
                    return;
                }
                setError(err?.message || "Unable to load dashboard data.");
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
        return () => controller.abort();
    }, []);

    return (
        <div className="modal-overlay-graph-container">
            <Button
                className="close-panel-btn"
                onClick={() => window.close()}>Close
            </Button>

            <div className="modal-graph-container-content">
                <h2>Avg. Time between Sleeves in minutes:</h2>

                {error && <ErrorMessage message={error} />}
                {loading && <Spinner />}

                {!loading && !error && (
                    <>
                    <div className="responsiveContainerHeight400Padding60">
                        <ResponsiveContainer>
                            <BarChart data={mountDataCurrentYear} isAnimationActive={false}>
                                <XAxis dataKey="name" style={{ fontSize: "12px" }} />
                                <YAxis />
                                <Tooltip />
                                <Legend
                                    content={() => (
                                        <ul className="custom-legend centered-legend">
                                            <li>
                                                <span className="legend-box sleeves"></span> Sleeves
                                            </li>
                                        </ul>
                                    )}
                                />
                                <Bar
                                    dataKey="AvgTimeBetweenSleeves"
                                    fill={donutColors.Sleeves}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="responsiveContainerHeight400Padding60">
                        <ResponsiveContainer>
                            <BarChart data={mountDataLastYear} isAnimationActive={false}>
                                <XAxis dataKey="name" style={{ fontSize: "12px" }} />
                                <YAxis />
                                <Tooltip />
                                <Legend
                                    content={() => (
                                        <ul className="custom-legend">
                                            <li>
                                                <span className="legend-box sleeves"></span> Sleeves
                                            </li>
                                        </ul>
                                    )}
                                />
                                <Bar
                                    dataKey="AvgTimeBetweenSleeves"
                                    fill={donutColors.Sleeves}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
}
