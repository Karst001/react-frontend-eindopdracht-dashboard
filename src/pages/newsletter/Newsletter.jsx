import React, { useState } from 'react';
import './NewsLetter.css'; // We'll define some styles
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/loader/Spinner.jsx';
import PopupMessage from "../../components/popupmessage/PopupMessage.jsx";
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";
import Input from "../../components/input/Input.jsx";
import {validateEmail} from "../../helpers/emailvalidation/EmailValidation.jsx";


const NewsLetter = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [emailValid, setEmailValid] = useState(true);

    const mockSubscribeAPI = (subscriberData) => {
        console.log('Sending newsletter data to API:', subscriberData);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.9) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Subscription failed on the server.'));
                }
            }, 1000); // Simulate network delay
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!agreed) {
            setPopupMessage('You must agree to the Terms and Conditions to subscribe.');
            return;
        }

        setLoading(true);

        try {
            const result = await mockSubscribeAPI({ name, email });
            if (result.success) {
                setPopupMessage('Thank you for subscribing to our newsletter.');
                setName('');
                setEmail('');
                setAgreed(false);
            }
        } catch (error) {
            console.error(error);
            setPopupMessage('There was a problem subscribing. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    //This checks if all required fields are non-empty
    const canSubmit = Boolean(name.trim() && email.trim() && agreed);

    return (
        <div className="newsletter-page">
            <h1>Subscribe to Our Newsletter</h1>

            <h4>
                We aim to send out a monthly newsletters with product updates, new product announcements, software updates for your equipment, service bulletins and much more.
            </h4>
            <p>
                Please subscribe here, you can unsubscribe at anytime using your <Link to="/profile">profile</Link> page.
            </p>

            <form className="newsletter-form" onSubmit={handleSubmit}>
                <Label label="Name:">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Enter your name"
                    />
                </Label>

                {/*Validate email on blur, when user leaves the field*/}
                {/*onBlur is fired when the email text field loses focus, then the validateEmail is called*/}
                <Label label="Email:">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={(e) => { setEmailValid(validateEmail(e.target.value)); }}
                        required
                        placeholder="Enter your email address"
                    />
                    {!emailValid && <p className="error-text">Invalid email address</p>}
                </Label>

                <Label className="checkbox-label">
                    <Input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                    />

                    I agree with the Terms and Conditions
                </Label>

                {/* button only enabled when there are no errors and email is valid */}
                <Button
                    type="submit" disabled={!canSubmit || loading || !emailValid} >
                    Subscribe
                </Button>

                <PopupMessage
                    message={popupMessage}
                    //navigate to home page after user clicks OK
                    onClose={() => {
                        setPopupMessage('');
                        navigate('/');
                    }}
                />
                {loading && <Spinner/>}
            </form>
        </div>
    );
};

export default NewsLetter;