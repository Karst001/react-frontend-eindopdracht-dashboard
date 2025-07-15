import React from 'react';
// import './Image.css';

//this is a reusable Image component
const Image = ({ src, alt, className = ''}) => {
    return (
        <img
            src={src}
            alt={alt || 'Image'}
            className={className}
            loading="lazy"
        />
    );
};


export default Image;