import React from 'react';
import './Input.css';

//onBlur is used to trigger an action to validate email for example
const Input = ({
                   type = 'text',
                   value,
                   onChange,
                   onBlur,
                   placeholder = '',
                   required = false,
                   className = '',
               }) => {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            className={`custom-input ${className}`}
        />
    );
};

export default Input;