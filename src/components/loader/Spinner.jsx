import React from 'react';
import './Spinner.css';

//show a user-friendly spinner while loading data or updating
function Spinner() {
    return (
        <div className="loader-container">
            <div className="spinner"></div>
        </div>
    );
}

export default Spinner;