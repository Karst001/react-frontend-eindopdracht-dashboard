import React from 'react';
import './Navigation.css';
import AnimatedNavigation from "../../helpers/animations/AnimatedNavigation.jsx";


function Navigation() {

    return (
        <AnimatedNavigation/> //this contains the navigation elements and logic to make the selected NavLink jump up a few times
    );
}

export default Navigation;