import React from 'react';
// import './Button.css';

//this is a reusable Button component
const Button = ({ text, onClick, type = "button", className = "", disabled  }) => {
    return (
        <button
            type={type}                             // specifies the button type like button, submit or reset
            className={`btn-primary ${className}`}  // takes 'btn-primary' as default unless overwritten by prop className
            onClick={onClick}
            disabled={disabled}
        >
            {text}                                  {/* displays the text on the button */}
        </button>
    );
};

export default Button;