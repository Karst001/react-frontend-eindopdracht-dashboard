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


function Profile() {
    const { user, updateSubscription } = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsgPassword, setErrorMsgPassword] = useState('');
    const [errorMsgNewsLetter, setErrorMsgNewsLetter] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [hasTypedPassword, setHasTypedPassword] = useState(false);                /* track to see if user is typing password */
    const [passwordsMatch, setPasswordsMatch] = useState(false);                    /* track to see when new and confirmed passwords match */
    const navigate = useNavigate();


    // === Update Password Only ===
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setErrorMsgPassword('');

        setLoading(true);
        try {
            const result = await mockUpdateProfile({newPassword});
            if (result.success) {
                setPopupMessage('Your password was updated successfully.');
                setNewPassword('');
            } else {
                setErrorMsgPassword('Failed to update password.');
            }
        } catch (err) {
            setErrorMsgPassword('Server error. Please try again.' + {err});
        } finally {
            setLoading(false);
        }
    };


    // === Update Subscription Only ===
    const handleSubscriptionUpdate = async (newSubscribedValue) => {
        setErrorMsgPassword('');
        setLoading(true);

        const now = new Date();

        try {
            const result = await updateProfile({ email: user.email, newSubscribedValue, currentDate: now});
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

        console.log('user.email:', user?.email);
        console.log('subscribed:', typeof subscribed, subscribed);

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/newsletter_update`, {
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

            console.log('Raw response:', response);

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


    const mockUpdateProfile = (data) => {
        console.log('Mock sending:', data);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({success: Math.random() > 0.1}); // 90% success
            }, 1000);
        });
    };

    //this will check if the new password and confirmed password match or not
    useEffect(() => {
        if (newPassword && confirmPassword && newPassword === confirmPassword) {
            setPasswordsMatch(true);
        } else {
            setPasswordsMatch(false);
        }
    }, [newPassword, confirmPassword]);


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

                            <Button
                                type="button"
                                disabled={loading}
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



