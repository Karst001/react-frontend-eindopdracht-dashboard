import React, {useContext, useEffect, useRef, useState} from 'react';
import './SignIn.css';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from '../../context/AuthContext';
import Spinner from "../../components/loader/Spinner.jsx";
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";
import {validateEmail} from "../../helpers/emailvalidation/emailValidation.js";
import { usePasswordStrength } from '../../hooks/usePasswordStrength';                                  //use a hook to check password strength
import {hashPasswordToHex} from "../../helpers/password/passwordEncryption.js";                      //helper to encrypt the password
import ErrorMessage from '../../components/errormessage/ErrorMessage.jsx';
import { useInternetStatus  } from '../../hooks/useInternetStatus.js';                                   //helper to check if there is a internet connection


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
    const [showWelcomePopup, setShowWelcomePopup] = useState(false);                /* used to track if modal 'welcome' form is displayed */
    const tokenRef = useRef('');                                         /* used to track if th url has a token or not */

    //navigation / authentication
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    //make a reference to the email field, I want it to focus by default so it's more user friendly
    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const newPasswordRef = useRef(null);
    // const isNewUser = new URLSearchParams(location.search).get('newUser') === 'true';

    //call the hook to check password for validity and strength
    //passwordStrength and isPasswordStrong are the returned values
    const { strength: passwordStrength, isStrong: isPasswordStrong } = usePasswordStrength(newPassword);
    const isOnline = useInternetStatus();                                                 /* check if we have internet connection, used for better error handling */


    //this form is a two step login, first enter email and check against server with API call
    async function checkEmail(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await checkEmailExists(email);

        if (!result) {
            setLoading(false);
            return;                 // prevent destructuring if result is null
        }

        const { resultCode, isNewUser } = result;

        switch (resultCode) {
            case -1:
                setError('Unknown email.');
                break;
            case 0:
                if (isNewUser) {
                    setStep(3); // new user, enforce setting password
                } else {
                    setError('This email address is not registered yet.');
                }
                break;
            case 1:
                //used in a profile and enable so allowed to go to step 2 for password verification
                setStep(2); // regular login for a registered user
                break;
        }

        setLoading(false);
    }


    async function checkEmailExists(email ) {
        if (isOnline) {
            //extract the email and userNew code from the url
            let isNewUserFromToken = false;

            if (tokenRef.current !== null) {
                try {
                    const decoded = atob(tokenRef.current); // Base64 decode
                    const params = new URLSearchParams(decoded);

                    isNewUserFromToken = params.get('newUser') === 'true';
                    const encodedEmail = params.get('email');
                    const emailFromToken = atob(encodedEmail);

                    //check to see if email === emailFromToken, if not abort registration process
                    if (email !== emailFromToken) {
                        setError(`The email address you entered is not correct.`);
                        return null;
                    } else {
                        email=emailFromToken
                    }
                } catch (err) {
                    console.error("Invalid token format", err);
                }
            }

            try {
                let route= '';

                //this function is used for existing and new users hence the if statement to filter what api route to take as back-end logic is different for each route
                //using different flags like 'UserIsNew'
                if (isNewUserFromToken) {
                    route = '/user/validate_email_new_user?email=';
                } else
                {
                    route = '/user/validate_email?email=';
                }

                const response = await fetch(`${import.meta.env.VITE_BASE_URL}${route}${encodeURIComponent(email)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${btoa(import.meta.env.VITE_API_KEY)}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.resultCode) {
                    if (isNewUserFromToken) {
                        setStep(3); // new user, enforce setting password
                    } else {
                        setStep(2); // regular login for a registered
                    }
                }

                const data = await response.json();

                //extra security check, if the url string is modified and IsNewUser in the url is set to True, the value in the database may be false
                //if database = true and isNewUserFromToken = true only then to proceed with new user registration
                if (data.IsNewUser === isNewUserFromToken) {
                    return {
                        resultCode: data.resultCode,
                        isNewUser: data.IsNewUser
                    };
                } else {
                    return {
                        resultCode: data.resultCode,
                        isNewUser: false,
                    };
                }
            } catch (err) {
                setError(`A critical error occurred: "${err.message || err}"\nPlease contact your website developer.`);
                setLoading(false);
                return null;
            }
        } else {
            setError('Internet connection not available.');
        }
    }


    //2nd step to enter password and check against server with API call
    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const rawCredentials = import.meta.env.VITE_API_KEY;
        const encoded = btoa(rawCredentials);                   // convert to base64

        if (isOnline) {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${encoded}`
                    },
                    body: JSON.stringify({
                        email,
                        passwordHash: await hashPasswordToHex(password)
                    })
                });

                const result = await response.json();

                if (!response.ok || !result.token) {
                    setError('Login failed. Please check credentials.');
                    setLoading(false);
                    return;
                }

                auth.userLogIn(result);                                         // calls context provider and register result
                setLoading(false);

                if (result.user.UserIsAdmin) {
                    navigate('/admin');                                         // admin user has access to Admin functions + dashboard
                } else {
                    navigate('/dashboard');                                     // any other registered user only has access to dashboard
                }

            } catch (err) {
                setError(`A critical error occurred: "${err.message || err}"\nPlease contact your website developer.`);
                setLoading(false);
            }
        } else {
            setError('Internet connection not available.');
        }
    }


    //when admin sends a link, it will be like : https://your-app.com/signin?newUser=true
    //for this project that is fine, in product better to send a secure token from the server, inside that token is the value 'newUser=true' and the 'email address' it is intended for
    //this page can extract and recognize
    //for now to test this logic, url to http://localhost:5173/signin?newUser=true this works because it is a valid route
    async function handleNewPasswordSubmit(e) {
        e.preventDefault();
        setError('');

        setLoading(true);

        //await handleFirstTimePasswordSubmit(email, newPassword);
        await handleFirstTimePasswordSubmit();

        auth.userLogIn(email);
        setLoading(false);
    }


    async function handleFirstTimePasswordSubmit() {
        // e.preventDefault();
        setError('');
        setLoading(true);

        const encoded = btoa(import.meta.env.VITE_API_KEY);

        if (isOnline) {
            try {
                const psw = await hashPasswordToHex(confirmPassword)
                // Send request to set password using email as unique key to lookup records in database, this is always unique
                const newUserResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/user/set_first_password`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${encoded}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        UserEmailAddress: email,
                        UserPasswordHashed: psw
                    })
                });

                const result = await newUserResponse.json();

                if (!newUserResponse.ok || !result.token) {
                    setError('Login failed. Please check credentials.');
                    setLoading(false);
                    return;
                }

                auth.userLogIn(result);                                         // calls context provider and register result
                setLoading(false);

                setShowWelcomePopup(true);                                      /* show 'Welcome' popup and wait for user to continue */
            } catch (err) {
                setError(`A critical error occurred: "${err.message || err}".`);
            } finally {
                setLoading(false);
            }
        } else {
            setError('Internet connection not available.');
        }
    }


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


    useEffect(() => {
        if (isOnline) {
            setError('');
        } else
        {
            setError('Internet connection not available.');
        }
    }, [isOnline]);


    //check if the url contains a token, if so, register inside tokenRef so it can be used after a re-render
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        tokenRef.current = urlParams.get('token');
    }, []);

    return (
        <main className="signin-main">
            {loading && <Spinner />}
            <div className="signin-container">
                {!showWelcomePopup && (                                 /* hide all steps at login once showWelcomePopup = true */
                    <section className="signin-box">
                        {step === 1 && (
                            <form onSubmit={checkEmail}>
                                <div className="signin-header">
                                    {tokenRef.current ? (
                                        <h1>Complete your registration</h1>
                                    ) : (
                                        <h1>Login</h1>
                                    )}
                                    <img
                                        src="/src/assets/logo.png"
                                        alt="Logo"
                                        className="signin-logo"
                                    />
                                </div>

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
                                            setError((prev) =>                                      // if the error is other then 'internet connection error, clear the error' while retyping
                                                prev?.startsWith('Unknown email') || prev?.startsWith('This email address is not registered yet.')
                                                    ? ''
                                                    : prev
                                            );
                                        }}
                                        required
                                        placeholder="Please enter your email address"
                                        ref={emailInputRef}
                                    />
                                    {hasTypedEmail && !emailValid && <p className="error-text">Invalid email format.</p>}
                                </Label>

                                {error && <ErrorMessage message={error} />}

                                <Button type="submit" disabled={!emailValid || !isOnline}>
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

                                {/*<h1>Login</h1>*/}

                                <div className="signin-header">
                                    <h1>Login</h1>
                                    <img
                                        src="/src/assets/logo.png"
                                        alt="Logo"
                                        className="signin-logo"
                                    />
                                </div>

                                <Label label="Enter your password to continue:">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                        }}
                                        required
                                        placeholder="Please enter your password"
                                        ref={passwordInputRef}
                                    />
                                </Label>

                                {error && <ErrorMessage message={error} />}

                                <Button type="submit" disabled={!password}>
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

                                {error && <ErrorMessage message={error} />}
                                {/*user can only set password once password is strong and both match*/}
                                {passwordsMatch && isPasswordStrong && (
                                    <Button type="submit">
                                        Set Password
                                    </Button>
                                )}
                            </form>
                        )}
                    </section>
                )}
            </div>

            {/*overlay of Welcome message only when a new user registers successfully*/}
            {showWelcomePopup && (
                <div className="welcome-popup">
                    <div className="welcome-content">
                        <h2>Welcome!</h2>
                        <p>You have successfully completed your registration.</p>
                        <Button onClick={() => {
                            setShowWelcomePopup(false);
                            if (auth?.user?.UserIsAdmin) {
                                navigate('/admin');
                            } else {
                                navigate('/dashboard');
                            }
                        }}>
                            Continue to your dashboard
                        </Button>
                    </div>
                </div>
            )}
        </main>
    );
}

export default SignIn;

