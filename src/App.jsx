import React from 'react';
import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';

import Home from './pages/home/Home.jsx';
import NewsLetter from './pages/newsletter/NewsLetter.jsx';
import Contact from './pages/contact/Contact.jsx';
import SignIn from './pages/signin/SignIn.jsx';
import NotFound from './pages/notfound/NotFound.jsx';
import Navigation from "./components/navigation/Navigation.jsx";
import PrivateRoute from "./components/privateroute/PrivateRoute.jsx";
import Profile from "./pages/profile/Profile.jsx";
import SignOut from "./pages/signout/SignOut.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Admin from "./pages/admin/Admin.jsx";


function App() {
    //track the location as in what page is the active page
    const location = useLocation();

    return (
        <>
            {/* <Navigation />  sits outside the <Routes> to ensure a nav bar shows up at the top*/}
            <Navigation/>
            <main>
                <Routes>
                    <Route path="/" element={<Home/>}/>

                    {/*wrap the <Profile/> component inside the <PrivateRoute/> component to protect it from tampering like browser Back button or manual entry un the URL*/}
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile/>
                            </PrivateRoute>
                        }
                    />

                    {/*wrap the <Dashboard/> component inside the <PrivateRoute/> component to protect it from tampering like browser Back button or manual entry un the URL*/}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard/>
                            </PrivateRoute>
                        }
                    />

                    {/*wrap the <Admin/> component inside the <PrivateRoute/> component to protect it from tampering like browser Back button or manual entry un the URL*/}
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute>
                                <Admin/>
                            </PrivateRoute>
                        }
                    />

                    <Route path="/newsletter" element={<NewsLetter/>}/>
                    <Route path="/contact" element={<Contact/>}/>
                    <Route path="/signin" element={<SignIn/>}/>
                    <Route path="/signout" element={<SignOut/>}/>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/admin" element={<Admin/>}/>
                    <Route path="*" element={<NotFound/>}/> {/* fallback route */}
                </Routes>
            </main>

            {/* footer applied here so it shows up on all pages throughout the website except dashboard as i want graphs to show as large as possible*/}
            {location.pathname !== "/dashboard" && (
                <footer className="footer">
                    <div className="footer-inner">
                        <span>ISO 9001:2015 Certification</span>
                        <span>2025 AV Flexologic ALL Rights Reserved</span>
                    </div>
                </footer>
            )}
        </>
    );
}

export default App;
