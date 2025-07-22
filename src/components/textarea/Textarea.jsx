import React, { useState, useEffect } from 'react';
import './Textarea.css';

const Textarea = ({
                      value,
                      onChange,
                      rows = 1,
                      placeholder = '',
                      required = false,
                      minLength = 0,
                      maxLength = 1000,
                      className = '',
                      showValidation = true, // toggle validation display
                  }) => {
    const [touched, setTouched] = useState(false);

    const isTooShort = value.length < minLength;
    // const isTooLong = value.length > maxLength;

    useEffect(() => {
        if (!value) setTouched(false);
    }, [value]);

    return (
        <div className="textarea-wrapper">
          <textarea
              value={value}
              onChange={(e) => {
                  onChange(e);
                  if (!touched) setTouched(true);
              }}
              rows={rows}
              placeholder={placeholder}
              required={required}
              minLength={minLength}
              maxLength={maxLength}
              className={`custom-textarea ${className} ${touched && isTooShort ? 'textarea-error' : ''}`}
          />

            <div className="textarea-meta">
                {showValidation && touched && isTooShort && (
                    <span className="error-message">Minimum {minLength} characters required</span>
                )}
                <span className="char-counter">
                  {value.length}/{maxLength}
                </span>
            </div>
        </div>
    );
};

export default Textarea;
