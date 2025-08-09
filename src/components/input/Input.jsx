import React, {useEffect, useState} from 'react';
import './Input.css';

//onBlur is used to trigger an action to validate email for example
// const Input = ({
//                    type = 'text',
//                    value,
//                    onChange,
//                    onBlur,
//                    placeholder = '',
//                    required = false,
//                    className = '',
//                    disabled = false,
//                }) => {
//     return (
//         <input
//             type={type}
//             value={value}
//             onChange={onChange}
//             onBlur={onBlur}
//             placeholder={placeholder}
//             required={required}
//             className={`custom-input ${className}`}
//             disabled={disabled}
//         />
//     );
// };

const Input = ({
                   type = 'text',
                   value,
                   onChange,
                   onBlur,
                   placeholder = '',
                   required = false,
                   className = '',
                   disabled = false,
                   maxLength,
                   minLength,
                   showCounter = false,
                   showValidation = false,
               }) => {

    const isTooShort = minLength && value.length < minLength;
    const isTooLong = maxLength && value.length > maxLength;
    const showError = showValidation && (isTooShort || isTooLong);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (!value) setTouched(false);
    }, [value]);

    return (
        <div className="input-wrapper">
            <input
                type={type}
                value={value}
                onChange={(e) => {
                    if (!touched) setTouched(true);
                    onChange(e);
                }}
                onBlur={(e) => {
                    setTouched(true);
                    if (onBlur) onBlur(e);
                }}
                placeholder={placeholder}
                required={required}
                className={`custom-input ${className}`}
                disabled={disabled}
                maxLength={maxLength}
                minLength={minLength}
            />
            {/* Character counter */}
            {showCounter && typeof value === 'string' && maxLength && (
                <div className={`char-counter ${showError ? 'char-counter-error' : ''}`}>
                    {value.length} / {maxLength}
                </div>
            )}

            {/* Validation message */}
            {showValidation && touched && isTooShort && showError && (

                <div className="input-error-message">
                    {isTooShort && `Minimum ${minLength} characters required.`}
                    {isTooLong && `Maximum ${maxLength} characters allowed.`}
                </div>
            )}
        </div>
    );
};

export default Input;