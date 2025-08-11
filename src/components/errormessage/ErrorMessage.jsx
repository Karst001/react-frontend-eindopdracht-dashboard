import React from 'react';
import './ErrorMessage.css';

// below code splits the string into segments and then uses line wrap to better display the error
// instead of A critical error occurred: "Failed to fetch" Please contact your website developer.
//
//it will be like
//A critical error occurred: "Failed to fetch"
//
// Please contact your website developer.

function ErrorMessage({ message }) {
    if (!message) return null;

    //error messages don't as it may not be user friendly UI, for internet connection
    //failure this is an exception
    const isOfflineError =
        message.toLowerCase().includes('internet connection');

    return (
        <p className={`error-text ${isOfflineError ? 'blink' : ''}`}>
            {message.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                    {line}
                    <br />
                </React.Fragment>
            ))}
        </p>
    );
}

export default ErrorMessage;