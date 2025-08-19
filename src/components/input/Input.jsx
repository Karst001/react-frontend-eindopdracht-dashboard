import React, { useEffect, useState, forwardRef } from 'react';
import './Input.css';

//onBlur is used to trigger an action to validate email for example
const Input = forwardRef(({
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
                              autoComplete,
                          }, ref) => {
    const isTooShort = minLength && (value ?? '').length < minLength;
    const isTooLong  = maxLength && (value ?? '').length > maxLength;
    const showError  = showValidation && (isTooShort || isTooLong);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (!value) setTouched(false);
    }, [value]);

    return (
        <div className="input-wrapper">
            <input
                ref={ref}                                               // forward to native input control
                type={type}
                value={value ?? ''}
                onChange={(e) => {
                    if (!touched) setTouched(true);
                    onChange?.(e);
                }}
                onBlur={(e) => {
                    setTouched(true);
                    onBlur?.(e);
                }}
                placeholder={placeholder}
                required={required}
                className={`custom-input ${className}`}
                disabled={disabled}
                maxLength={maxLength}
                minLength={minLength}
                autoComplete={autoComplete}
            />

            {showCounter && typeof value === 'string' && maxLength && (
                <div className={`char-counter ${showError ? 'char-counter-error' : ''}`}>
                    {value.length} / {maxLength}
                </div>
            )}

            {showValidation && touched && showError && (
                <div className="input-error-message">
                    {isTooShort && `Minimum ${minLength} characters required.`}
                    {isTooLong && `Maximum ${maxLength} characters allowed.`}
                </div>
            )}
        </div>
    );
});

export default Input;

