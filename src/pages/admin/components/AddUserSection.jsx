import React from 'react';
import PopupMessage from "../../../components/popupmessage/PopupMessage.jsx";
import Button from "../../../components/button/Button.jsx";
import Label from "../../../components/label/Label.jsx";
import Input from '../../../components/input/Input.jsx';
import ErrorMessage from "../../../components/errormessage/ErrorMessage.jsx";
import { validateEmail } from "../../../helpers/emailvalidation/emailValidation.js";

const showLogs = import.meta.env.VITE_SHOW_CONSOLE_LOGS === 'true';

const AddUserSection = ({
        //states
        username, setUserName, firstName, setFirstName, lastName, setLastName, email, setEmail, customerID, setCustomerID, isAdmin, setIsAdmin,

        //validation and user interface
        emailValid, setEmailValid, customerIDValid, setCustomerIDValid, usernameValid, usernameCheckMessage, userEmailValid, userEmailCheckMessage,

        //some  shared flags
        canSubmitNewUser, loading, isOnline, error, popupMessage,

        // various actions
        setLoading, setError, setPopupMessage, resetForm, setActiveSection, fetchUsers, addNewUser, checkUserNameExists, checkEmailExists, getLocalIsoString, }) => {
    return (
        <section className="add-user-section">
            <h2>Add a new user:</h2>

            <form
                className="admin-form"
                onSubmit={async (e) => {
                    e.preventDefault();

                    setLoading(true);
                    const localTime = getLocalIsoString();

                    let result;
                    if (isOnline) {
                        try {
                            const controller = new AbortController();

                            result = await addNewUser(
                                {
                                    UserName: username,
                                    UserFirstName: firstName,
                                    UserLastName: lastName,
                                    UserEmailAddress: email,
                                    UserIsAdmin: isAdmin,
                                    UserCreatedDate: localTime,
                                },
                                controller.signal
                            );

                            if (result.success === 1) {
                                resetForm();
                                setPopupMessage('User was added successfully.');
                            } else {
                                setPopupMessage(result.message || 'User creation failed.');
                            }
                        } catch (err) {
                            if (err.name !== 'AbortError') {
                                if (showLogs) {
                                    console.error(err);
                                }
                                setPopupMessage('There was a problem adding the user. Please try again.');
                            }
                        } finally {
                            setLoading(false);
                        }
                    } else {
                        setError('Internet connection not available.');
                    }

                    //user was added successfully, now send email invite link to customer
                    if (result?.success === 1) {
                        const emailHandler = await fetch(
                            `${import.meta.env.VITE_BASE_URL}/email/send_automated_email_user_invite`,
                            {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    to: email,
                                    emailType: 1,
                                }),
                            }
                        );

                        if (emailHandler.ok) {
                            setPopupMessage('Email was sent successfully to ' + email);

                            //trigger the button behaviour for Edit User
                            setActiveSection('editUser');
                            await fetchUsers();
                        } else {
                            setPopupMessage('There was a problem sending the email. Please try again.');
                        }
                    }
                }}
            >
                <fieldset className="admin-form">
                    <Label label={<> <span>User name:</span> <span className="required">*</span> </>}>
                        <Input
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                            onBlur={checkUserNameExists}
                            required
                            placeholder="Enter the user name for this account"
                            minLength={6}
                            maxLength={10}
                            showValidation={true}
                        />
                        {!usernameValid && <p className="error-text">{usernameCheckMessage}</p>}
                    </Label>

                    <Label label={<> <span>First name:</span> <span className="required">*</span> </>}>
                        <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            placeholder="Enter the first name for this user"
                            minLength={2}
                            maxLength={30}
                            showValidation={true}
                        />
                    </Label>

                    <Label label={<> <span>Last name:</span> <span className="required">*</span> </>}>
                        <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            placeholder="Enter the last name for this user"
                            minLength={5}
                            maxLength={50}
                            showValidation={true}
                        />
                    </Label>

                    <Label label={<> <span>E-mail:</span> <span className="required">*</span> </>}>
                        <Input
                            value={email}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEmail(value);
                                setEmailValid(validateEmail(value));
                            }}
                            onBlur={checkEmailExists}
                            required
                            placeholder="Enter the email address for this user"
                        />
                        {!emailValid && <p className="error-text">Invalid email address</p>}
                        {!userEmailValid && <p className="error-text">{userEmailCheckMessage}</p>}
                    </Label>

                    <Label label={<> <span>Customer ID:</span> <span className="required">*</span> </>}>
                        <Input
                            type="text"
                            value={customerID}
                            onChange={(e) => {
                                const value = e.target.value;
                                setCustomerID(value);
                                setCustomerIDValid(/^\d{6,}$/.test(value));
                            }}
                            onBlur={(e) => {
                                const value = e.target.value;
                                setCustomerIDValid(/^\d{6,}$/.test(value));
                            }}
                            required
                            placeholder="Enter the customer ID for this account (6 digits long)"
                            minLength={6}
                            maxLength={6}
                            showValidation={true}
                        />
                        {!customerIDValid && (
                            <p className="error-text">Customer ID must be at least 6 digits, text is not allowed</p>
                        )}
                    </Label>

                    <Label className="checkbox-label">
                        <Input
                            type="checkbox"
                            checked={isAdmin}
                            onChange={(e) => setIsAdmin(e.target.checked)}
                        />
                        This user has administrator rights
                    </Label>

                    {error && <ErrorMessage message={error} />}

                    <Button
                        type="submit"
                        disabled={
                            !canSubmitNewUser ||
                            loading ||
                            !emailValid ||
                            !customerIDValid ||
                            !usernameValid ||
                            !userEmailValid ||
                            !isOnline
                        }
                    >
                        Add User
                    </Button>

                    <PopupMessage
                        message={popupMessage}
                        onClose={() => {
                            setPopupMessage('');
                            resetForm();
                        }}
                    />
                </fieldset>
            </form>
        </section>
    );
};

export default AddUserSection;
