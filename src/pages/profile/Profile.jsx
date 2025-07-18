import React, {useContext, useState} from 'react';
import './Profile.css';
import {AuthContext} from '../../context/AuthContext';
import Spinner from '../../components/loader/Spinner.jsx';
import PopupMessage from '../../components/popupmessage/PopupMessage';
import {NavLink, useNavigate} from 'react-router-dom';
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";

function Profile() {
    const {user} = useContext(AuthContext);

    const [currentPassword, setCurrentPassword] = useState('');

    const [newPassword, setNewPassword] = useState('');
    const [subscribed, setSubscribed] = useState(user?.newsletter ?? true)

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [popupMessage, setPopupMessage] = useState('');

    const navigate = useNavigate();

    const isPasswordWeak = (password) => password.length < 6;

    // === Update Password Only ===
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!newPassword || isPasswordWeak(newPassword)) {
            setErrorMsg('Password is too weak. Please choose at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            const result = await mockUpdateProfile({newPassword});
            if (result.success) {
                setPopupMessage('Your password was updated successfully.');
                setNewPassword('');
            } else {
                setErrorMsg('Failed to update password.');
            }
        } catch (err) {
            setErrorMsg('Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // === Update Subscription Only ===
    const handleSubscriptionUpdate = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            const result = await mockUpdateProfile({subscribed});
            if (result.success) {
                setPopupMessage('Your subscription setting has been updated.');
            } else {
                setErrorMsg('Failed to update subscription.');
            }
        } catch (err) {
            setErrorMsg('Server error. Please try again.');
        } finally {
            setLoading(false);
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

    //This checks if all required fields are non-empty
    const canSubmitPassword = Boolean(currentPassword.trim() && newPassword.trim());

    return (
        <div className="profile-page">
            <h1>Your profile:</h1>

            {/* === Section 1: Details === */}
            <form className="profile-form" onSubmit={handlePasswordUpdate}>
                <section>
                    <h2>Change password:</h2>
                    <Label label="Current password:">
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </Label>

                    <Label label="New password:">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </Label>
                </section>

                <Button text="Update Password" type="submit" disabled={!canSubmitPassword || loading}/>
            </form>

            <form className="profile-form" onSubmit={handleSubscriptionUpdate}>
                <section>
                    <h2>Newsletter:</h2>

                    {!subscribed ? (
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
                            <p>You’re subscribed to our newsletter.</p>
                            <Button
                                text="Unsubscribe"
                                type="submit"
                                disabled={loading}
                            />
                        </>
                    )}
                </section>
            </form>

            {/* === Shared Messages === */}
            {errorMsg && <p className="error">{errorMsg}</p>}
            {loading && <Spinner/>}

            <PopupMessage
                message={popupMessage}
                onClose={() => {
                    setPopupMessage('');
                    navigate('/');
                }}
            />
        </div>
    );
}

export default Profile;



