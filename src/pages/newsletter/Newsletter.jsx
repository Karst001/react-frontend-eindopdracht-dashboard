import React, {useContext, useEffect, useState} from 'react';
import './NewsLetter.css'; // We'll define some styles
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/loader/Spinner.jsx';
import PopupMessage from "../../components/popupmessage/PopupMessage.jsx";
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";
import Input from "../../components/input/Input.jsx";
import {validateEmail} from "../../helpers/emailvalidation/emailValidation.js";
import { useInternetStatus  } from '../../hooks/useInternetStatus.js';
import ErrorMessage from "../../components/errormessage/ErrorMessage.jsx";
import {AuthContext} from "../../context/AuthContext.jsx";
import { getLocalIsoString } from '../../helpers/timeConverter/timeConverter.js';


const NewsLetter = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [emailValid, setEmailValid] = useState(true);
    const [error, setError] = useState('');
    const isOnline = useInternetStatus();
    const { updateSubscription } = useContext(AuthContext);
    const auth = useContext(AuthContext);
    const [success, setSuccess] = useState(false);

    //make the product_fetch call
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!agreed) {
            setPopupMessage('You must agree to the Terms and Conditions to subscribe.');
            return;
        }

        setLoading(true);
        const localTime = getLocalIsoString();

        if (isOnline) {
            const controller = new AbortController();
            setSuccess(false);        //reset value

            try {
                const bodyContent = JSON.stringify({
                    email,
                    fullName,
                    Subscribed: true,
                    CurrentDate: localTime,
                });

                const response = await fetch(
                    `${import.meta.env.VITE_BASE_URL}/newsletter/newsletter_create`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: bodyContent,
                        signal: controller.signal,
                    }
                );

                const result = await response.json();

                if (result.success === 1) {
                    console.log('Newsletter: ', bodyContent);

                    //send email to customer as confirmation
                    const emailHandler = await fetch(`${import.meta.env.VITE_BASE_URL}/email/send_automated_email_newsletter_subscription`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            to: email,
                            emailType: 2,                   //type = 2: send NewsLetter subscription template via API to user
                        })
                    });

                    if (emailHandler.ok) {
                        setPopupMessage('Email was sent successfully to ' + email);
                    } else {
                        setPopupMessage('There was a problem sending the email. Please try again.');
                    }

                    //cleanup
                    updateSubscription(true);           // update context, this triggers a re-render everywhere
                    setFullName('');
                    setEmail('');
                    setAgreed(false);
                    setSuccess(false);
                    setPopupMessage( 'Thank you for subscribing to our newsletter.');
                } else if (result.success === -1) {
                    setSuccess(true);
                    setPopupMessage('This email address is already subscribed.');
                } else {
                    setPopupMessage('Subscription failed. Please try again later.');
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error(error);
                    setPopupMessage(
                        'There was a problem subscribing. Please try again later.'
                    );
                }
            } finally {
                setLoading(false);
            }
        } else {
            setError('Internet connection not available.');
            setLoading(false);
        }
    };



    useEffect(() => {
        if (isOnline) {
            setError('');
        } else
        {
            setError('Internet connection not available.');
        }
    }, [isOnline]);



    useEffect(() => {
        if (auth.user) {
            setEmail(auth.user.email || ''); // fallback to empty string not null, prefill the email address when user is logged in
        }
    }, [auth.user]);


    //This checks if all required fields are non-empty
    const canSubmit = Boolean(fullName.trim() && email.trim() && agreed);

    return (
        <section className="newsletter-page">
            <h1>Subscribe to Our Newsletter</h1>

            <h2>What is in it for you!</h2>
            <p>
                We aim to send out a monthly newsletters with product updates, new product announcements, software updates for your equipment, service bulletins and much more.
            </p>
            <p>
                Please subscribe here, you can unsubscribe at anytime using your <Link to="/profile">profile</Link> page.
            </p>

            <form className="newsletter-form" onSubmit={handleSubmit}>
                <fieldset className="newsletter-form">
                    <Label label={<><span>Full name:</span> <span className="required">*</span></>}>
                        <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="Enter your name"
                            minLength={5}
                            maxLength={50}
                            showValidation={true}
                        />
                    </Label>

                    {/*Validate email on blur, when user leaves the field*/}
                    {/*onBlur is fired when the email text field loses focus, then the validateEmail is called*/}
                    <Label label={<><span>E-mail:</span> <span className="required">*</span></>}>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEmail(value);
                                setEmailValid(validateEmail(value));            // continuous validation while typing
                            }}
                            required
                            placeholder="Enter your email address"
                            disabled={auth.user && email === auth.user.email}   // disable entry when user is logged in, email field is prefilled when user is logged in
                        />
                        {!emailValid && <p className="error-text">Invalid email address</p>}
                    </Label>

                    <Label className="checkbox-label">
                        <Input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />

                        I agree with the Terms and Conditions<span className="required"> *</span>
                    </Label>

                    {/* button only enabled when there are no errors and email is valid */}
                    {error && <ErrorMessage message={error} />}

                    <Button
                        type="submit" disabled={!canSubmit || loading || !emailValid ||!isOnline} >
                        Subscribe
                    </Button>

                    <PopupMessage
                        message={popupMessage}

                        // navigate to home page after user clicks OK only if email is not a duplicate subscription
                        onClose={() => {
                            setPopupMessage('');
                            if (!success) {
                                navigate('/');
                            }
                        }}
                    />
                    {loading && <Spinner/>}
                </fieldset>
            </form>
        </section>
    );
};

export default NewsLetter;