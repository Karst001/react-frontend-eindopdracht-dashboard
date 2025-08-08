import React from 'react';

//this is a reusable Image component to display images
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