import React, {useContext, useEffect, useRef, useState} from 'react';
import './SignIn.css';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from '../../context/AuthContext';
import Spinner from "../../components/loader/Spinner.jsx";
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";
import {validateEmail} from "../../helpers/emailvalidation/EmailValidation.jsx";


function SignIn() {
    //define states
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailValid, setEmailValid] = useState(true);

    //navigation / authentication
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    //make a reference to the email field, I want it to focus by default so it's more user frienely
    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);


    useEffect(() => {
        if (step === 1 && emailInputRef.current) {
            //on state update set the focus to the email field
            emailInputRef.current.focus();
        }
        if (step === 2 && passwordInputRef.current) {
            //on state update set the focus to the password field
            passwordInputRef.current.focus();
        }

    }, [step]);


    //this form is a two step login, first enter email and check against server with API call
    async function checkEmail(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Replace with real API
        const emailExists = await fakeCheckEmail(email);
        if (emailExists) {
            //email was found, proceed to step 2
            setStep(2);
        } else {
            //email was not found
            setError('Email not found');
        }
        setLoading(false);
    }

    //2nd step to enter password and check against server with API call
    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const validLogin = await fakeCheckPassword(email, password);
        if (validLogin) {
            auth.userLogIn(email);

            localStorage.setItem('token', import.meta.env.VITE_API_KEY);

            setLoading(false);  // stop spinner

            if (email === 'admin@test.com') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }

        } else {
            setError('Incorrect password');
            setLoading(false);  // stop spinner
        }
    }


    function fakeCheckEmail(email) {
        const validEmails = ['ad@test.com', 'admin@test.com'];
        return new Promise(resolve => {
            setTimeout(() => resolve(validEmails.includes(email)), 500);
        });
    }

    function fakeCheckPassword(email, password) {
        return new Promise(resolve => {
            setTimeout(() => {
                if (email === 'ad@test.com' && password === '123') {
                    resolve(true);
                } else if (email === 'admin@test.com' && password === '456') {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 500);
        });
    }

    return (
        <main className="signin-main">
            {loading && <Spinner />}
            <div className="signin-container">
                <div className="signin-box">
                    {step === 1 && (
                        <form onSubmit={checkEmail}>
                            <h2>Login</h2>

                            <p>Welcome to our Partner Portal</p>

                            {/*Validate email on blur, when user leaves the field*/}
                            {/*onBlur is fired when the email text field loses focus, then the validateEmail is called*/}
                            <Label label="Enter your e-mail:">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={(e) => { setEmailValid(validateEmail(e.target.value)); }}
                                    required
                                    ref={emailInputRef}
                                />
                                {!emailValid && <p className="error-text">Invalid email address</p>}
                            </Label>
                            {error && <p className="error-text">{error}</p>}

                            <Button type="submit" disabled={!emailValid}>
                                Next
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleLogin}>
                            <Button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setError('');
                                }}
                                >
                                ◀ Back
                            </Button>

                            <h2>Login</h2>

                            <p>Welcome to our Partner Portal</p>
                            <p>Login to continue</p>

                            <Label label="Enter your password:">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    ref={passwordInputRef}
                                />
                            </Label>

                            {error && <p className="error-text">{error}</p>}

                            <Button type="submit" >
                                Continue
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}

export default SignIn;

