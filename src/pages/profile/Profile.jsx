import React, {useContext, useEffect, useState} from 'react';
import './Profile.css';
import {AuthContext} from '../../context/AuthContext';
import Spinner from '../../components/loader/Spinner.jsx';
import PopupMessage from '../../components/popupmessage/PopupMessage';
import {NavLink, useNavigate} from 'react-router-dom';
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";
import Input from "../../components/input/Input.jsx";
import { usePasswordStrength } from '../../hooks/usePasswordStrength';
import ErrorMessage from "../../components/errormessage/ErrorMessage.jsx";                                 //use a hook to check password strength
import { useInternetStatus  } from '../../hooks/useInternetStatus.js';
import { getLocalIsoString } from '../../helpers/timeConverter/timeConverter.js';
import {hashPasswordToHex} from "../../helpers/password/passwordEncryption.js";                      //helper to encrypt the password

function Profile() {
    const { user, updateSubscription } = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorMsgPassword, setErrorMsgPassword] = useState('');
    const [errorMsgNewsLetter, setErrorMsgNewsLetter] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [hasTypedPassword, setHasTypedPassword] = useState(false);                /* track to see if user is typing password */
    const [passwordsMatch, setPasswordsMatch] = useState(false);                    /* track to see when new and confirmed passwords match */
    const navigate = useNavigate();
    const isOnline = useInternetStatus();


    // Update subscription only
    const handleSubscriptionUpdate = async (newSubscribedValue) => {
        setErrorMsgPassword('');
        setLoading(true);

        if (isOnline) {
            const localTime = getLocalIsoString();

            try {
                const result = await updateProfile({
                    email: user.email,
                    newSubscribedValue,
                    currentDate: localTime
                });

                if (result.success) {
                    // since the user unsubscribed, now re-enable to navbar menu NewsLetter in case the user changes their mind
                    updateSubscription(newSubscribedValue); // update context, this triggers a re-render everywhere

                    setPopupMessage('Your subscription setting has been updated.');
                } else {
                    setErrorMsgNewsLetter('Failed to update subscription.');
                }
            } catch (err) {
                setErrorMsgNewsLetter('Server error. Please try again. ' + (err.message || err.toString()));
            } finally {
                setLoading(false);
            }
        } else {
            setErrorMsgNewsLetter('Internet connection not available.');
        }
    };

    //make the call to the backend
    const updateProfile = async ({email, subscribed, currentDate }) => {
        const encoded = btoa(import.meta.env.VITE_API_KEY);

        console.log('Sending request to API:', {
            email,
            subscribed,
            currentDate,
            url: `${import.meta.env.VITE_BASE_URL}/user/newsletter_update`
        });

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/newsletter/newsletter_update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${encoded}`,
                },
                body: JSON.stringify({
                    email,
                    subscribed,
                    currentDate,
                }),
            });

            // console.log('Raw response:', response);

            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }

            const json = await response.json();
            console.log('Parsed JSON response:', json);
            return json;
        } catch (fetchErr) {
            console.error('Fetch failed:', fetchErr);
            throw fetchErr;
        }
    };


    // Update password only
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setErrorMsgPassword('');
        setLoading(true);

        // check if New Password is not equal to the Current Password
        if (currentPassword === newPassword) {
            setErrorMsgPassword('The new password cannot be the same as the current password')
            setLoading(false);
            return;
        }

        try {
            const result = await updatePassword({
                userId: user.userId,
                currentPassword,
                newPassword
            });

            if (result.resultCode === 0) {
                setPopupMessage('Your password was updated successfully.');

                // reset various states
                setNewPassword('');
                setCurrentPassword('');
                setConfirmPassword('');
                setHasTypedPassword(false);
            } else if (result.resultCode === 2) {
                setErrorMsgPassword(result.message || 'Incorrect current password.');
            } else {
                setErrorMsgPassword(result.message || 'Failed to update password.');
            }
        } catch (err) {
            setErrorMsgPassword('Server error. Please try again. ' + (err.message || err.toString()));
        } finally {
            setLoading(false);
        }
    };

    // API call to update password
    const updatePassword = async ({ userId, currentPassword, newPassword }) => {
        const encoded = btoa(import.meta.env.VITE_API_KEY);

        console.log('Sending to API:', {
            userId: user.userId,
            currentPassword,
            newPassword,
        });

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/password_update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${encoded}`,
                },
                body: JSON.stringify({
                    UserID: userId,
                    CurrentPasswordHash: await hashPasswordToHex(currentPassword),
                    NewPasswordHash: await hashPasswordToHex(newPassword),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();

        } catch (err) {
            console.error('Password update failed:', err);
            throw err;
        }
    };

    //this will check if the new password and confirmed password match or not
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


    //call the hook to check password for validity and strength
    //passwordStrength and isPasswordStrong are the returned values
    const { strength: passwordStrength, isStrong: isPasswordStrong } = usePasswordStrength(newPassword);

    return (
        <section className="profile-page">
            <h1>Your profile</h1>

            {/* === Section 1: Details === */}
            <form className="profile-form" onSubmit={handlePasswordUpdate}>
                <fieldset className="profile-form">
                    <h2>Change password:</h2>
                    <Label label={<><span>Current password:</span> <span className="required">*</span></>}>
                        <Input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            placeholder="Enter your current password"
                        />
                    </Label>

                    <Label label={<><span>New password:</span> <span className="required">*</span></>}>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                setHasTypedPassword(true);
                            }}
                            onBlur={() => {
                                setErrorMsgPassword('');
                            }}
                            required
                            placeholder="Enter your new password"
                        />
                    </Label>

                    <Label label={<><span>Confirm new password:</span> <span className="required">*</span></>}>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                const value = e.target.value;
                                setConfirmPassword(value);
                                setPasswordsMatch(newPassword === value); // check if password match while typing, when they match the warning goes away and button enabled right away
                                setHasTypedPassword(true);
                            }}
                            onBlur={() => {
                                setPasswordsMatch(newPassword === confirmPassword); // fallback to make sure it is checked
                            }}
                            required
                            placeholder="Repeat your new password"
                        />

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
                    </Label>

                    {error && <ErrorMessage message={error} />}
                    {errorMsgPassword && <ErrorMessage message={errorMsgPassword} />}

                    {/*user can only update password to database once password is strong and both match*/}
                    {passwordsMatch && isPasswordStrong && (
                        <Button type="submit">
                            Update Password
                        </Button>
                    )}
                </fieldset>
            </form>

            <form className="profile-form" onSubmit={handleSubscriptionUpdate}>
                <fieldset className="profile-form">
                    <section>
                        <h2>Newsletter:</h2>

                        {!user.newsletter ? (
                            <p className="newsletter-message">
                                Interested in our newsletter? Click{' '}
                                <span
                                    onClick={() => navigate('/newsletter')}
                                    className="newsletter-link"
                                >
                                  here
                                </span>{' '}
                                to sign up.
                            </p>
                        ) : (
                            <>
                                <p>You are subscribed to our newsletter.</p>

                                {error && <ErrorMessage message={error} />}
                                {errorMsgNewsLetter && <ErrorMessage message={errorMsgNewsLetter} />}

                                <Button
                                    type="button"
                                    disabled={loading || !isOnline}
                                    onClick={() => {
                                        handleSubscriptionUpdate(false);           // now call the API to unsubscribe
                                    }}
                                >
                                    Unsubscribe
                                </Button>
                            </>
                        )}

                        {errorMsgNewsLetter && <ErrorMessage message={errorMsgNewsLetter} />}
                    </section>
                </fieldset>
            </form>

            {loading && <Spinner/>}

            <PopupMessage
                message={popupMessage}
                onClose={() => {
                    setPopupMessage('');
                    navigate('/');
                }}
            />
        </section>
    );
}

export default Profile;



