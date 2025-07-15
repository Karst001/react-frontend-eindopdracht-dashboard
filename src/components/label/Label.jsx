import React from 'react';

//this is a reusable Label component
const Label = ({ children, label, className = '' }) => {
    return (
        <label className={className}>
            {label && <span>{label}</span>}
            {children}
        </label>
    );
};

export default Label;