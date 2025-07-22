import React from 'react';
import './Input.css';

const Input = ({
                   type = 'text',
                   value,
                   onChange,
                   placeholder = '',
                   required = false,
                   className = '',
               }) => {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`custom-input ${className}`}
        />
    );
};

export default Input;