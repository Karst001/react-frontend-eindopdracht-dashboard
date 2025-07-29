import React, {useContext, useEffect, useRef, useState} from 'react';
import './SignIn.css';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from '../../context/AuthContext';
import Spinner from "../../components/loader/Spinner.jsx";
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";
import {validateEmail} from "../../helpers/emailvalidation/emailValidation.js";
import { usePasswordStrength } from '../../hooks/usePasswordStrength';                                  //use a hook to check password strength


function SignIn() {
    //define states
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailValid, setEmailValid] = useState(false);
    const [hasTypedEmail, setHasTypedEmail] = useState(false);                      /* track to see if user is typing email */
    const [hasTypedPassword, setHasTypedPassword] = useState(false);                /* track to see if user is typing password */
    const [passwordsMatch, setPasswordsMatch] = useState(false);                    /* track to see when new and confirmed passwords match */

    //navigation / authentication
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    //make a reference to the email field, I want it to focus by default so it's more user friendly
    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const newPasswordRef = useRef(null);
    const isNewUser = new URLSearchParams(location.search).get('newUser') === 'true';

    useEffect(() => {
        if (step === 1 && emailInputRef.current) {
            //on state update set the focus to the email field
            emailInputRef.current.focus();
        }

        if (step === 2 && passwordInputRef.current) {
            //on state update set the focus to the password field
            passwordInputRef.current.focus();
        }

        if (step === 3 && newPasswordRef.current) {
            //on state update set the focus to the newPasswordRef field
            newPasswordRef.current.focus();
        }

    }, [step]);


    //this will check if the new password and confirmed password in step 3 match or not
    useEffect(() => {
        if (newPassword && confirmPassword && newPassword === confirmPassword) {
            setPasswordsMatch(true);
        } else {
            setPasswordsMatch(false);
        }
    }, [newPassword, confirmPassword]);


    //this form is a two step login, first enter email and check against server with API call
    async function checkEmail(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Replace with real API
        const emailExists = await fakeCheckEmail(email);
        if (emailExists) {
            if (isNewUser) {
                setStep(3); // new user, enforce setting password
            } else {
                setStep(2); // regular login for a registered
            }
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


    //when admin sends a link, it will be like : https://your-app.com/signin?newUser=true
    //for this project that is fine, in product better to send a secure token from the server, inside that token is the value 'newUser=true' and the 'email address' it is intended for
    //this page can extract and recognize
    //for now to test this logic, url to http://localhost:5173/signin?newUser=true this works because it is a valid route
    async function handleNewPasswordSubmit(e) {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        // Replace with real registration logic
        await fakeSetPassword(email, newPassword);

        auth.userLogIn(email);
        localStorage.setItem('token', import.meta.env.VITE_API_KEY);
        setLoading(false);
        navigate('/dashboard');
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

    function fakeSetPassword(email, password) {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Set new password for ${email}: ${password}`);
                resolve(true);
            }, 500);
        });
    }

    //call the hook to check password for validity and strength
    //passwordStrength and isPasswordStrong are the returned values
    const { strength: passwordStrength, isStrong: isPasswordStrong } = usePasswordStrength(newPassword);

    return (
        <main className="signin-main">
            {loading && <Spinner />}
            <div className="signin-container">
                <section className="signin-box">
                    {step === 1 && (
                        <form onSubmit={checkEmail}>
                            <h1>Login</h1>

                            <p>Welcome to our Partner Portal</p>

                            {/*Validate email on blur, when user leaves the field*/}
                            {/*onBlur is fired when the email text field loses focus, then the validateEmail is called*/}
                            <Label label="Enter your e-mail:">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setEmail(value);
                                        setEmailValid(validateEmail(value));                                        // validation while typing
                                        if (!hasTypedEmail) setHasTypedEmail(true);                           // user is typing email
                                    }}
                                    required
                                    placeholder="Please enter your email address"
                                    ref={emailInputRef}
                                />
                                {hasTypedEmail && !emailValid && <p className="error-text">Invalid email address</p>}
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

                            <h1>Login</h1>

                            <p>Welcome to our Partner Portal</p>
                            <p>Login to continue</p>

                            <Label label="Enter your password:">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (!hasTypedPassword) setHasTypedPassword(true);                           // user is typing password
                                    }}
                                    required
                                    placeholder="Please enter your password"
                                    ref={passwordInputRef}
                                />
                            </Label>

                            {error && <p className="error-text">{error}</p>}

                            <Button type="submit" disabled={!hasTypedPassword} >
                                Continue
                            </Button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleNewPasswordSubmit}>
                            <Button type="button" onClick={() => { setStep(1); setError(''); }}>◀ Back</Button>
                            <h1>Set New Password</h1>
                            <p>Welcome! Please create your password to continue.</p>

                            <Label label="New password:">
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setHasTypedPassword(true);
                                    }}
                                    required
                                    placeholder="Enter your new password"
                                    ref={newPasswordRef}
                                />
                            </Label>

                            <Label label="Confirm password:">
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Confirm your new password"
                                />
                            </Label>

                            {confirmPassword && !passwordsMatch && (
                                <p className="error-text">Passwords do not match</p>
                            )}


                            {/*show the password policy and updates live while typing, as soon as password is strong the warnings should hide */}
                            {!isPasswordStrong && hasTypedPassword && (
                                <div className="password-rules">
                                    <p className={passwordStrength.length ? "valid" : "invalid"}>• At least 8 characters</p>
                                    <p className={passwordStrength.upper ? "valid" : "invalid"}>• At least one uppercase letter</p>
                                    <p className={passwordStrength.lower ? "valid" : "invalid"}>• At least one lowercase letter</p>
                                    <p className={passwordStrength.number ? "valid" : "invalid"}>• At least one number</p>
                                    <p className={passwordStrength.special ? "valid" : "invalid"}>• At least one special character</p>
                                </div>
                            )}


                            {/*user can only set password once password is strong and both match*/}
                            {passwordsMatch && isPasswordStrong && (
                                <Button type="submit">
                                    Set Password
                                </Button>
                            )}
                        </form>
                    )}
                </section>
            </div>
        </main>
    );
}

export default SignIn;

