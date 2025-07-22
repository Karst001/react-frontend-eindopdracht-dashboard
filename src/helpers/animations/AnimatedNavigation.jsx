import React, {useEffect, useState} from "react";
import {NavLink, useLocation} from "react-router-dom";
import './AnimatedNavigation.css';
import logo from '../../assets/logo.png';
import {useContext} from "react";
import {AuthContext} from "../../context/AuthContext.jsx";
import Button from "../../components/button/Button.jsx";

//This is a component that contains the logic to animate the NavLink when user clicks on it
//It is made into a component so it can be called from the main website entry and also when a <Button> or <Lnk> a page is clicked
//When user clicks a nav link it sets the useState and then in this component it triggers the animation, jumping a few times
const AnimatedNavigation = () => {
    const location = useLocation();
    const auth = useContext(AuthContext);

    // Manage states for the NavLink that is active, pass default 'null'
    const [jumpingPath, setJumpingPath] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Detect navigation state and trigger the animation
    useEffect(() => {
        if (location.state?.jump) {
            setJumpingPath(location.pathname);

            // Cleanup after animation
            const timeout = setTimeout(() => setJumpingPath(null), 500);
            return () => clearTimeout(timeout);
        }
    }, [location]);

    // this helper is called from the NavLink element to apply jump CSS class to the element
    const getLinkClass = (path, isActive) => {
        let baseClass = isActive ? 'default-menu-link' : 'active-menu-link';  //this is the base class to underline an active link
        if (path === jumpingPath) {
            baseClass += ' jump';   //concatenate the baseClass + jump CSS class to make the animation happen
        }
        return baseClass;
    };

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(prev => !prev);
    };

    const handleNavClick = () => {
        //when app is running mobile the hamburger menu should close  as soon as the user selected a menu item, on desktop the 'jump' animation is completed, then the dropdown closes after 1 second
        if (window.innerWidth <= 768) {
            setMobileMenuOpen(false);
            setDropdownOpen(false);
        } else {
            //close dropdown after 1 second
            setTimeout(() => {
                setDropdownOpen(false);
            }, 1000);
        }
    };

    // Optionally close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.dropdown')) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <nav className="navbar">
            <div className="nav-inner">
                {/* Logo on the left */}
                <div className="logo">
                    <img src={logo} alt="Flexologic logo" />
                </div>

                {/* Hamburger for mobile */}
                <button className="hamburger" onClick={toggleMobileMenu}>
                    ☰
                </button>

                {/* Nav links in center */}
                <div className="nav-center">
                    <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                        <li>
                            <NavLink to="/" onClick={handleNavClick} state={{ jump: true }} className={({ isActive }) => getLinkClass('/', isActive)}>
                                Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/newsletter" onClick={handleNavClick} state={{ jump: true }} className={({ isActive }) => getLinkClass('/newsletter', isActive)}>
                                Our Newsletter
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/contact" onClick={handleNavClick} state={{ jump: true }} className={({ isActive }) => getLinkClass('/contact', isActive)}>
                                Contact Us
                            </NavLink>
                        </li>

                        {/*not authenticated, show 'Client Portal' button*/}
                        {!auth.userIsAuthenticated ? (
                            <li className="dropdown">
                                <a className="dropdown-toggle" onClick={toggleDropdown}>
                                    Client Portal <span className={`arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
                                </a>
                                {dropdownOpen && (
                                    <ul className="dropdown-menu">
                                        <li>
                                            <NavLink to="/signin" onClick={handleNavClick} state={{ jump: true }} className={({ isActive }) => getLinkClass('/signin', isActive)}>
                                                Sign in
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        ) : (
                            // authenticated, show dashboard button
                            <>
                                <li>
                                    <NavLink to="/dashboard" onClick={handleNavClick} state={{ jump: true }} className={({ isActive }) => getLinkClass('/dashboard', isActive)}>
                                        Dashboard
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                {/*when user is authenticated, show a dropdown with links*/}
                {auth.userIsAuthenticated && (
                    <div className="nav-username dropdown">
                        <a className="dropdown-toggle" onClick={toggleDropdown}>
                            Hello! <span className="nav-username-highlight">{auth.user?.username || 'User'}</span>
                            <span className={`arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
                        </a>

                        {dropdownOpen && (
                            <ul className="dropdown-menu">
                                {auth.user?.isAdmin && (
                                    <li>
                                        <NavLink
                                            to="/admin"
                                            onClick={handleNavClick}
                                            state={{ jump: true }}
                                            className={({ isActive }) => getLinkClass('/admin', isActive)}
                                        >
                                            Administrator
                                        </NavLink>
                                    </li>
                                )}
                                <li>
                                    <NavLink
                                        to="/profile"
                                        onClick={handleNavClick}
                                        state={{ jump: true }}
                                        className={({ isActive }) => getLinkClass('/profile', isActive)}
                                    >
                                        Profile
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/signout"
                                        onClick={handleNavClick}
                                        state={{ jump: true }}
                                        className={({ isActive }) => getLinkClass('/signout', isActive)}
                                    >
                                        Sign out
                                    </NavLink>
                                </li>
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default AnimatedNavigation;
