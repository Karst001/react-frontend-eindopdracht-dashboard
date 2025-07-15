import React from 'react';
import './PopupMessage.css';
import Button from "../../components/button/Button.jsx";

// reusable PopupMessage component that displays a message in a modal-style popup, modal means the background is somewhat greyed out
const PopupMessage = ({ message, onClose }) => {
    // If no message is provided, render nothing
    if (!message) return null;

    return (
        // Overlay that covers the screen and closes the popup when clicked
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>  {/* stopPropagation prevents closing when clicking inside */}
                <p>{message}</p>
                <Button text="OK" onClick={onClose} />
            </div>
        </div>
    );
};

export default PopupMessage;