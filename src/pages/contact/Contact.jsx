import React, { useState, useEffect } from 'react';
import './Contact.css';
import PopupMessage from '../../components/popupmessage/PopupMessage';
import { useNavigate } from 'react-router-dom';
import Spinner from "../../components/loader/Spinner.jsx";
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";
import Input from "../../components/input/Input.jsx";
import Textarea from "../../components/textarea/Textarea.jsx";
import {validateEmail} from "../../helpers/emailvalidation/emailValidation.js";
import { useInternetStatus  } from '../../hooks/useInternetStatus.js';
import { getLocalIsoString } from '../../helpers/timeConverter/timeConverter.js';
import ErrorMessage from "../../components/errormessage/ErrorMessage.jsx";

const ContactUs = () => {
    const [countries, setCountries] = useState([]);
    const [area, setArea] = useState('');
    const [country, setCountry] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [yourName, setYourName] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [message, setMessage] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [emailValid, setEmailValid] = useState(true);
    const isOnline = useInternetStatus();
    const [error, setError] = useState('');


    //load the list of countries on page mount
    useEffect(() => {
        // Fetch countries from a public API
        fetch('https://restcountries.com/v3.1/all?fields=name')
            .then((res) => res.json())
            .then((data) => {
                const countryNames = data
                    .map((c) => c.name.common)
                    .sort((a, b) => a.localeCompare(b));
                setCountries(countryNames);
            })
            .catch((err) => {
                console.error('Error fetching countries:', err);
            });
    }, []);

    useEffect(() => {
        if (isOnline) {
            setError('');
        } else
        {
            setError('Internet connection not available.');
        }
    }, [isOnline]);

    //call the API to add data
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isOnline) {
            setLoading(true);
            const localTime = getLocalIsoString();

            try {
                const encoded = btoa(import.meta.env.VITE_API_KEY);

                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/contact/contactus_create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${encoded}`,
                    },
                    body: JSON.stringify({
                        AreaOfInquiry: area,
                        RequestFromCountry: country,
                        CompanyName: companyName,
                        RequestersName: yourName,
                        RequestersEmail: email,
                        Message: message,
                        RequestSendDate: localTime,
                    }),
                });

                const result = await response.json();

                if (response.ok && result.success === 1) {
                    setPopupMessage('Your request was submitted and you will be contacted by our department within 48 hours.');

                    // Reset form
                    setArea('');
                    setCountry('');
                    setCompanyName('');
                    setYourName('');
                    setEmail('');
                    setDepartment('');
                    setMessage('');
                } else {
                    setPopupMessage(result.message || 'There was a problem submitting your request. Please try again later.');
                }

            } catch (error) {
                console.error('Error submitting contact form:', error);
                setPopupMessage('There was a problem submitting your request. Please try again later.');
            } finally {
                setLoading(false);
            }
        } else {
            setError('Internet connection not available.');
            setLoading(false);
        }
    };


    //This checks if all required fields are non-empty
    const canSubmit = Boolean(area.trim() && country.trim() && yourName.trim() && email.trim() && message.trim());

    return (
        <section className="contact-page">
            <h1>Contact AV Flexologic</h1>
            <form className="contact-form" onSubmit={handleSubmit}>
                <fieldset className="contact-form">
                    <Label label={<><span>Select an area we can help you with:</span> <span className="required">*</span></>}>
                        <select value={area} onChange={(e) => setArea(e.target.value)} required>
                            <option value="">-- Please choose an option --</option>
                            <option value="support">Support</option>
                            <option value="sales">Sales</option>
                            <option value="billing">Billing</option>
                            <option value="other">Other</option>
                        </select>
                    </Label>

                    <Label label={<><span>Select a country:</span> <span className="required">*</span></>}>
                        <select value={country} onChange={(e) => setCountry(e.target.value)} required>
                            <option value="">-- Select your country --</option>
                            {countries.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </Label>

                    <Label label={<><span>Company name:</span> <span className="required">*</span></>}>
                        <Input
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Enter company name"
                        />
                    </Label>

                    <Label label={<><span>Your name:</span> <span className="required">*</span></>}>
                        <Input
                            value={yourName}
                            onChange={(e) => setYourName(e.target.value)}
                            required
                            placeholder="Enter your name"
                        />
                    </Label>

                    {/*Validate email on blur, when user leaves the field*/}
                    {/*onBlur is fired when the email text field loses focus, then the validateEmail is called*/}
                    <Label label={<><span>Email:</span> <span className="required">*</span></>}>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEmail(value);
                                setEmailValid(validateEmail(value));        // continuous validation while typing
                            }}
                            required
                            placeholder="Enter your email address"
                        />
                        {!emailValid && <p className="error-text">Invalid email address</p>}
                    </Label>

                    <Label label={<><span>Message:</span> <span className="required">*</span></>}>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            required
                            placeholder="Please describe how we can assist you"
                            minLength={20}
                            maxLength={500}
                            showValidation={true}
                        />
                    </Label>

                    {error && <ErrorMessage message={error} />}

                    <Button
                        type="submit" disabled={!canSubmit || loading || !emailValid || !isOnline}>
                        Send Message
                    </Button>

                    <PopupMessage
                        message={popupMessage}
                        //navigate to home page after user clicks OK
                        onClose={() => {
                            setPopupMessage('');
                            navigate('/');
                        }}
                    />
                    {loading && <Spinner />}
                </fieldset>
            </form>
        </section>
    );
};

export default ContactUs;
