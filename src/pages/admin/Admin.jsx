import React, {useState} from 'react';
import { useRef, useEffect } from 'react';
import './Admin.css';
import Spinner from '../../components/loader/Spinner.jsx';
import PopupMessage from "../../components/popupmessage/PopupMessage.jsx";
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";
import Input from '../../components/input/Input.jsx';
import Textarea from "../../components/textarea/Textarea.jsx";
import {h} from 'gridjs'; //a helper/handle needed for checkboxes inside custom grid
import CustomGrid from '../../components/datagrid/CustomGrid.jsx';
import {validateEmail} from "../../helpers/emailvalidation/emailValidation.js";
// import { generateOTP } from '../../helpers/password/oneTimePassword.js';
import { getLocalIsoString } from '../../helpers/timeConverter/timeConverter.js';
import { useInternetStatus  } from '../../hooks/useInternetStatus.js';
import ErrorMessage from "../../components/errormessage/ErrorMessage.jsx";

const Admin = () => {
    const [activeSection, setActiveSection] = useState(null);
    const [username, setUserName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [customerID, setCustomerID] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const [productTitle, setProductTitle] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [productImagePreview, setProductImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [emailValid, setEmailValid] = useState(true);
    const [customerIDValid, setCustomerIDValid] = useState(true);
    const [usersChanged, setUsersChanged] = useState(false);
    const originalUsersRef = useRef([]); //store original value from users in a useRef to compare later
    const [error, setError] = useState('');
    const isOnline = useInternetStatus();

    //user to track if username and email do not exist yest in database
    const [usernameValid, setUsernameValid] = useState(true);
    const [usernameCheckMessage, setUsernameCheckMessage] = useState('');
    const [userEmailValid, setUserEmailValid] = useState(true);
    const [userEmailCheckMessage, setUserEmailCheckMessage] = useState('');

    //data state for users
    const [users, setUsers] = useState([]);

    //handles the toggle when user clicks on the checkbox inside the grid
    const handleToggleAdmin = (id) => {
        setUsers(prev => {
            const updated = prev.map(user =>
                user.id === id ? { ...user, admin: !user.admin } : user
            );

            // Check if something actually changed compared to originalUsersRef
            setUsersChanged(JSON.stringify(updated) !== JSON.stringify(originalUsersRef.current));

            return updated;
        });
    };

    const handleToggleActive = (id) => {
        setUsers(prev => {
            const updated = prev.map(user =>
                user.id === id ? { ...user, enabled: !user.enabled } : user
            );

            // Check if something actually changed compared to originalUsersRef
            setUsersChanged(JSON.stringify(updated) !== JSON.stringify(originalUsersRef.current));

            return updated;
        });
    };

    const handleToggleIsNew = (id) => {
        setUsers(prev => {
            const updated = prev.map(user =>
                user.id === id ? { ...user, isNew: !user.isNew } : user
            );

            // Check if something actually changed compared to originalUsersRef
            setUsersChanged(JSON.stringify(updated) !== JSON.stringify(originalUsersRef.current));

            return updated;
        });
    };

    //build array
    //const tableData = users.map(user => [
    const tableData = (users || []).map(user => [
        user.userName,
        user.fullName,
        user.email,
        h('input', {
            type: 'checkbox',
            checked: user.admin,
            onChange: () => handleToggleAdmin(user.id),
            className: 'toggle-switch'
        }),
        h('input', {
            type: 'checkbox',
            checked: user.enabled,
            onChange: () => handleToggleActive(user.id),
            className: 'toggle-switch'
        }),
        h('input', {
            type: 'checkbox',
            checked: user.isNew,
            onChange: () => handleToggleIsNew(user.id),
            className: 'toggle-switch'
        })
        //the onChange event triggers handleToggle
    ]);

    const ResetForm = () => {
        setUserName('');
        setFirstName('');
        setLastName('');
        setEmail('');
        setCustomerID('0');
        setIsAdmin(false);
        setProductTitle('');
        setProductDescription('');
        setProductImage(null);
        setProductImagePreview(null);
    };


    const AddNewUser = async (userData) => {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(import.meta.env.VITE_API_KEY)}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        return await response.json();
    };


    const handleUpdateUsers = async () => {
        setLoading(true);

        try {
            const result = await updateUsers(users);  // 🔁 Use the real function

            if (result.success) {
                setPopupMessage('User was updated successfully.');
                originalUsersRef.current = users;
                setUsersChanged(false);
            } else {
                setPopupMessage(result.message || 'Update failed.');
            }
        } catch (error) {
            console.error(error);
            setPopupMessage('There was a problem updating the users. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    const updateUsers = async (updatedUsers) => {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/update_users`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(import.meta.env.VITE_API_KEY)}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUsers.map(user => ({
                UserID: user.id,
                UserIsAdmin: user.admin,
                UserEnabled: user.enabled,
                UserIsNew: user.isNew
            })))
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    };


    const mockAddedProducts = (addedProducts) => {
        console.log('Sending new product to API:', addedProducts);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% chance of success
                if (Math.random() < 0.9) {
                    resolve({success: true});
                } else {
                    reject(new Error('Failed to update users on the server.'));
                }
            }, 1000); // Simulate network delay
        });
    };


    //validate the username with records in the database, there can never be a duplicate username
    const CheckUserNameExists = async () => {
        if (!username.trim()) return;

        if (isOnline) {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/validate_username?username=${encodeURIComponent(username)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${btoa(import.meta.env.VITE_API_KEY)}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.resultCode  === 1) {
                    // Username is available
                    setUsernameValid(true);
                    setUsernameCheckMessage('');
                } else {
                    // Username already exists
                    setUsernameValid(false);
                    setUsernameCheckMessage('This username is already in use.');
                }
            } catch (err) {
                console.error("Username validation failed:", err);
                setUsernameValid(false);
                setUsernameCheckMessage("Could not validate username.");
            }
        } else {
            setError('Internet connection not available.');
        }
    };


    //validate the email with records in the database, there can never be a duplicate email
    const CheckEmailExists = async () => {
        if (!username.trim()) return;

        if (isOnline) {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/validate_email_new_user?email=${encodeURIComponent(email)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${btoa(import.meta.env.VITE_API_KEY)}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.resultCode  === 1) {
                    // Email is not in database yet
                    setUserEmailValid(true);
                    setUserEmailCheckMessage('');
                } else {
                    // Email already exists
                    setUserEmailValid(false);
                    setUserEmailCheckMessage('This email is already in use.');
                }
            } catch (err) {
                console.error("Email validation failed:", err);
                setUserEmailValid(false);
                setUserEmailCheckMessage("Could not validate email.");
            }
        } else {
            setError('Internet connection not available.');
        }
    };

    //This checks if all required fields are non-empty
    const canSubmitNewUser = Boolean(username.trim() && firstName.trim() && lastName.trim() && email.trim() && customerID.trim());
    const canSubmitEditUser = Boolean(usersChanged);
    const canSubmitNewProduct = Boolean(productTitle.trim() !== '' && productDescription.trim() !== '' && productImage !== null);

    //used for onetime password (OTP)
    // const [otp, setOtp] = useState('');
    // const handleGenerate = () => {
    //     const newOtp = generateOTP(10, { digits: true, upperCase: true, lowerCase: true });                  // generate a random OTP
    //     setOtp(newOtp);
    // };
    //when logic is written for API, send OTP with the request, using: handleGenerate
    //this OTP is stored in the database, user will get email with login details


    useEffect(() => {
        const hasChanged = JSON.stringify(users) !== JSON.stringify(originalUsersRef.current);
        setUsersChanged(hasChanged);
    }, [users]);


    useEffect(() => {
        if (isOnline) {
            setError('');
        } else
        {
            setError('Internet connection not available.');
        }
    }, [isOnline]);


    //get the users from API
    const fetchUsers = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/get_all_users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${btoa(import.meta.env.VITE_API_KEY)}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            const allUsers = data.map((user) => ({
                id: user.UserID,
                userName: user.UserName,
                fullName: user.FullName,
                email: user.Email,
                admin: user.Admin ?? false,
                enabled: user.Enabled ?? false,
                isNew: user.IsNew ?? false,
            }));

            setUsers(allUsers);
            originalUsersRef.current = allUsers;
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    //load user table on page mount
    useEffect(() => {
        fetchUsers();
    }, []);


    return (
        <div className="admin-page">
            <div className="admin-layout-wrapper">
                <h1>Administrator</h1>

                <div className="admin-layout">
                    <aside className="admin-sidebar">
                        <Button onClick={() => setActiveSection('addUser')}>
                            Add User
                        </Button>
                        <Button
                            onClick={() => {
                                setActiveSection('editUser');
                                fetchUsers();
                            }}
                        >
                            Edit User
                        </Button>
                        <Button onClick={() => setActiveSection('addProduct')}>
                            Add Product
                        </Button>
                    </aside>

                    <main className="admin-content">
                        {activeSection === 'addUser' && (
                            <section className="add-user-section">
                                <h2>Add a new user:</h2>
                                <form className="admin-form" onSubmit={async (e) => {
                                    e.preventDefault();

                                    setLoading(true);
                                    const localTime = getLocalIsoString();

                                    if (isOnline) {
                                        try {
                                            const result = await AddNewUser({
                                                UserName: username,
                                                UserFirstName: firstName,
                                                UserLastName: lastName,
                                                UserEmailAddress: email,
                                                UserIsAdmin: isAdmin,
                                                UserCreatedDate: localTime,
                                            });

                                            if (result.success === 1) {
                                                setPopupMessage('User was added successfully.');
                                                ResetForm();
                                            } else {
                                                setPopupMessage(result.message || 'User creation failed.');
                                            }
                                        } catch (error) {
                                            console.error(error);
                                            setPopupMessage('There was a problem adding the user. Please try again.');
                                        } finally {
                                            setLoading(false);
                                        }
                                    } else {
                                        setError('Internet connection not available.');
                                    }
                                }}>

                                    {/*onBlur is fired when the email text field loses focus, then the CheckUserNameExists is called*/}
                                    <fieldset className="admin-form">
                                        <Label label={<><span>User name:</span> <span className="required">*</span></>}>
                                            <Input
                                                value={username}
                                                onChange={(e) => setUserName(e.target.value)}
                                                onBlur={CheckUserNameExists}
                                                required
                                                placeholder="Enter the user name for this account"
                                            />
                                            {!usernameValid && <p className="error-text">{usernameCheckMessage}</p>}
                                        </Label>

                                        <Label label={<><span>First name:</span> <span className="required">*</span></>}>
                                            <Input
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                required
                                                placeholder="Enter the first name for this user"
                                            />
                                        </Label>

                                        <Label label={<><span>Last name:</span> <span className="required">*</span></>}>
                                            <Input
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                required
                                                placeholder="Enter the last name for this user"
                                            />
                                        </Label>

                                        {/*Validate email on blur, when user leaves the field*/}
                                        {/*onBlur is fired when the email text field loses focus, then the CheckEmailExists is called*/}
                                        <Label label={<><span>E-mail:</span> <span className="required">*</span></>}>
                                            <Input
                                                value={email}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setEmail(value);
                                                    setEmailValid(validateEmail(value));            // continuous validation while typing
                                                }}
                                                onBlur={CheckEmailExists}
                                                required
                                                placeholder="Enter the email address for this user"
                                            />
                                            {!emailValid && <p className="error-text">Invalid email address</p>}
                                            {!userEmailValid && <p className="error-text">{userEmailCheckMessage}</p>}
                                        </Label>

                                        <Label label={<><span>Customer ID:</span> <span className="required">*</span></>}>
                                            <Input
                                                type="text"
                                                value={customerID}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setCustomerID(value);
                                                    setCustomerIDValid(/^\d{6,}$/.test(value)); // 6 or more digits only
                                                }}
                                                onBlur={(e) => {
                                                    const value = e.target.value;
                                                    setCustomerIDValid(/^\d{6,}$/.test(value));
                                                }}
                                                required
                                                placeholder="Enter the customer ID for this account (6 digits long)"
                                            />
                                            {!customerIDValid && <p className="error-text">Customer ID must be at least 6 digits, text is not allowed</p>}
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

                                        {/* button only enabled when there are no errors and email is valid and customerIDis valid */}
                                        <Button type="submit" disabled={!canSubmitNewUser || loading || !emailValid || !customerIDValid || !usernameValid || !userEmailValid || !isOnline}>
                                            Add User
                                        </Button>

                                        <PopupMessage
                                            message={popupMessage}
                                            //navigate to home page after user clicks OK
                                            onClose={() => {
                                                setPopupMessage('');
                                                ResetForm();
                                            }}
                                        />
                                        {loading && <Spinner/>}
                                    </fieldset>
                                </form>
                            </section>
                        )}


                        {activeSection === 'editUser' && (
                            <section className="admin-section">
                                <h2>Edit users:</h2>

                                <CustomGrid
                                    data={tableData}
                                    columns={[
                                        { id: 'userName', name: 'User name', width: '100px' },
                                        { id: 'fullName', name: 'Full name', width: '120px' },
                                        { id: 'email', name: 'Email', width: '160px' },
                                        { id: 'admin', name: 'Admin?', width: '70px' },
                                        { id: 'active', name: 'Active?', width: '70px' },
                                        { id: 'isNew', name: 'New?', width: '70px' },
                                    ]}
                                    search={true}
                                    pagination={true}
                                    pageLimit={6}
                                    sort={false}
                                />

                                {error && <ErrorMessage message={error} />}
                                {/*button disabled when there are no changes*/}

                                <Button onClick={handleUpdateUsers} disabled={!canSubmitEditUser || !isOnline}>
                                    Update User
                                </Button>

                                <PopupMessage
                                    message={popupMessage}
                                    //navigate to home page after user clicks OK
                                    onClose={() => {
                                        setPopupMessage('');
                                        ResetForm();
                                    }}
                                />
                                {loading && <Spinner/>}
                            </section>
                        )}


                        {activeSection === 'addProduct' && (
                            <section className="admin-section">
                                <div className="add-product-section">
                                    <h2>Add Product:</h2>

                                    <form className="admin-form" onSubmit={async (e) => {
                                        e.preventDefault();
                                        setLoading(true);

                                        try {
                                            const result = await mockAddedProducts({
                                                productTitle,
                                                productDescription,
                                                productImage,
                                            });

                                            if (result.success) {
                                                setPopupMessage('Product was added successfully.');
                                                ResetForm();
                                            }
                                        } catch (error) {
                                            console.error(error);
                                            setPopupMessage('There was a problem adding the user. Please try again.');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}>

                                        <fieldset className="admin-form">
                                            <Label label={<><span>Title:</span> <span className="required">*</span></>}>
                                                <Input
                                                    value={productTitle}
                                                    onChange={(e) => setProductTitle(e.target.value)}
                                                    required
                                                    placeholder="Enter the product title"
                                                />
                                            </Label>

                                            <Label label={<><span>Description:</span> <span className="required">*</span></>}>
                                                <Textarea
                                                    value={productDescription}
                                                    onChange={(e) => setProductDescription(e.target.value)}
                                                    rows={5}
                                                    required
                                                    placeholder="Enter the description for this product"
                                                    minLength={300}
                                                    maxLength={750}
                                                    showValidation={true}
                                                />
                                            </Label>

                                            <Label label={<><span>Product image:</span> <span className="required">*</span></>}>
                                                <div
                                                    className="image-uploader"
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        const file = e.dataTransfer.files[0];
                                                        if (file) {
                                                            setProductImage(file);
                                                            setProductImagePreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                >
                                                    <p>Drag and drop an image here, or click to select</p>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setProductImage(file);
                                                                setProductImagePreview(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </div>

                                                {productImagePreview && (
                                                    <div className="image-preview">
                                                        <img src={productImagePreview} alt="Product Preview"/>
                                                        <p>{productImage.name}</p>
                                                    </div>
                                                )}
                                            </Label>

                                            {error && <ErrorMessage message={error} />}
                                            <Button type="submit" disabled={!canSubmitNewProduct || loading || !isOnline}>
                                                Create Product
                                            </Button>

                                            <PopupMessage
                                                message={popupMessage}
                                                //navigate to home page after user clicks OK
                                                onClose={() => {
                                                    setPopupMessage('');
                                                    ResetForm();
                                                }}
                                            />

                                            {loading && <Spinner/>}
                                        </fieldset>
                                    </form>
                                </div>
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}

export default Admin;
