import React, {useContext, useState} from 'react';
import './Profile.css';
import {AuthContext} from '../../context/AuthContext';
import Spinner from '../../components/loader/Spinner.jsx';
import PopupMessage from '../../components/popupmessage/PopupMessage';
import {NavLink, useNavigate} from 'react-router-dom';
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";
import Input from "../../components/input/Input.jsx";

function Profile() {
    const {user} = useContext(AuthContext);

    const [currentPassword, setCurrentPassword] = useState('');

    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
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

        if (newPassword !== repeatNewPassword) {
            setErrorMsg('Please check your new password with the value for repeat password; They must be the same..!');
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
    const canSubmitPassword = Boolean(currentPassword.trim() && newPassword.trim() && repeatNewPassword.trim());

    return (
        <div className="profile-page">
            <h1>Your profile:</h1>

            {/* === Section 1: Details === */}
            <form className="profile-form" onSubmit={handlePasswordUpdate}>
                <section>
                    <h2>Change password:</h2>
                    <Label label="Current password:">
                        <Input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            placeholder="Enter your current password"
                        />
                    </Label>

                    <Label label="New password:">
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Enter your new password"
                        />
                    </Label>

                    <Label label="Repeat new password:">
                        <Input
                            type="password"
                            value={repeatNewPassword}
                            onChange={(e) => setRepeatNewPassword(e.target.value)}
                            required
                            placeholder="Repeat your new password"
                        />
                    </Label>
                </section>

                <Button type="submit" disabled={!canSubmitPassword || loading}>
                    Update Password
                </Button>
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
                            <Button type="submit" disabled={loading}>
                                Unsubscribe
                            </Button>
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



