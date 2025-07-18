import React, { useState, useEffect } from 'react';
import './Contact.css';
import PopupMessage from '../../components/popupmessage/PopupMessage';
import { useNavigate } from 'react-router-dom';
import Spinner from "../../components/loader/Spinner.jsx";
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";

const ContactUs = () => {
    const [countries, setCountries] = useState([]);
    const [area, setArea] = useState('');
    const [country, setCountry] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [yourName, setYourName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('');
    const [message, setMessage] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


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


    const mockContactUsAPI = (contactUsData) => {
        console.log('Sending Contact Us data to API:', contactUsData);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.9) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Contact form submission failed on the server.'));
                }
            }, 1000);
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const result = await mockContactUsAPI({
                area,
                country,
                companyName,
                yourName,
                email,
                phone,
                department,
                message
            });

            if (result.success) {
                setPopupMessage('Your request was submitted and you will be contacted by our department within 48 hours.');

                // Reset form after success
                setArea('');
                setCountry('');
                setCompanyName('');
                setYourName('');
                setEmail('');
                setPhone('');
                setDepartment('');
                setMessage('');
            }

        } catch (error) {
            console.error(error);
            setPopupMessage('There was a problem submitting your request. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    //This checks if all required fields are non-empty
    const canSubmit = Boolean(area.trim() && country.trim() && yourName.trim() && email.trim() && message.trim());

    return (
        <div className="contact-page">
            <h1>Contact Us</h1>
            <form className="contact-form" onSubmit={handleSubmit}>
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

                <Label label="Company name:">
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Enter company name"
                    />
                </Label>

                <Label label={<><span>Your name:</span> <span className="required">*</span></>}>
                    <input
                        type="text"
                        value={yourName}
                        onChange={(e) => setYourName(e.target.value)}
                        required
                        placeholder="Enter your name"
                    />
                </Label>

                <Label label={<><span>Email:</span> <span className="required">*</span></>}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email address"
                    />
                </Label>

                <Label label="Phone nr:">
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number including area code and extension"
                    />
                </Label>

                <Label label={<><span>Message:</span> <span className="required">*</span></>}>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        required
                        placeholder="Please describe how we can assist you"
                    />
                </Label>

                <Button text="Send Message" type="submit" disabled={!canSubmit || loading} />

                <PopupMessage
                    message={popupMessage}
                    //navigate to home page after user clicks OK
                    onClose={() => {
                        setPopupMessage('');
                        navigate('/');
                    }}
                />
                {loading && <Spinner />}
            </form>
        </div>
    );
};

export default ContactUs;
