import React, { useEffect, useState } from 'react';
import './Admin.css';
import Spinner from '../../components/loader/Spinner.jsx';
import PopupMessage from "../../components/popupmessage/PopupMessage.jsx";
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";
import Input from '../../components/input/Input.jsx';
import Textarea from "../../components/textarea/Textarea.jsx";
import {h} from 'gridjs'; //a helper/handle needed for checkboxes inside custom grid
import CustomGrid from '../../components/datagrid/CustomGrid.jsx';
import {validateEmail} from "../../helpers/emailvalidation/EmailValidation.jsx";


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


    const [users, setUsers] = useState([
        {id: 1, username: 'jdoe', firstName: 'John', lastName: 'Doe', email: 'jdoe@test.com', active: true},
        {id: 2, username: 'asmith', firstName: 'Anna', lastName: 'Smith', email: 'asmith@test.com', active: false},
        {id: 3, username: 'bjones', firstName: 'Bob', lastName: 'Jones', email: 'bjones@test.com', active: true},
        {id: 4, username: 'akarsten', firstName: 'Ad', lastName: 'Karsten', email: 'ad@test.com', active: true},
        {id: 5, username: 'gbisschop', firstName: 'Geert', lastName: 'Bottens', email: 'geert@bottens.nl', active: true},
    ]);


    //handles the toggle when user clicks on the checkbox inside the grid
    const handleToggle = (id) => {
        setUsers(prev =>
            prev.map(user =>
                user.id === id ? {...user, active: !user.active} : user
            )
        );

    };

    //build array
    const tableData = users.map(user => [
        user.username,
        user.firstName,
        user.lastName,
        user.email,
        h('input', {
            type: 'checkbox',
            checked: user.active,
            onClick: () => handleToggle(user.id),
            className: 'toggle-switch'
        })
    ]);

    //need useEffect to store state after it was commited, update it later with api call
    useEffect(() => {
        console.log("Updated users:", users);
    }, [users]);




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


    const mockAddUser = (userData) => {
        console.log('Sending user to API:', userData);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.9) {
                    resolve({success: true});
                } else {
                    reject(new Error('Failed to add user on the server.'));
                }
            }, 1000);  // Simulate network delay
        });
    };


    const handleUpdateUsers = async () => {
        setLoading(true);

        try {
            const result = await mockUpdateUsers(users);
            if (result.success) {
                setPopupMessage('User was updated successfully.');
            }
        } catch (error) {
            console.error(error);
            setPopupMessage('There was a problem updating the users. Please try again.');
        } finally {
            setLoading(false); //make sure to stop the spinner
        }
    };


    const mockUpdateUsers = (updatedUsers) => {
        console.log('Sending updated users to API:', updatedUsers);
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


    //This checks if all required fields are non-empty
    const canSubmitNewUser = Boolean(username.trim() && firstName.trim() && lastName.trim() && email.trim() && customerID.trim());
    const canSubmitNewProduct = Boolean(productTitle.trim() !== '' && productDescription.trim() !== '' && productImage !== null);

    return (
        <div className="admin-page">
            <div className="admin-layout-wrapper">
                <h1>Administrator</h1>

                <div className="admin-layout">
                    <aside className="admin-sidebar">
                        <Button onClick={() => setActiveSection('addUser')}>
                            Add User
                        </Button>
                        <Button onClick={() => setActiveSection('deactivateUser')}>
                            Edit User
                        </Button>
                        <Button onClick={() => setActiveSection('addProduct')}>
                            Add Product
                        </Button>
                    </aside>

                    <main className="admin-content">
                        {activeSection === 'addUser' && (
                            <div className="add-user-section">
                                <h2>Add a new user:</h2>
                                <form className="admin-form" onSubmit={async (e) => {
                                    e.preventDefault();

                                    setLoading(true);

                                    try {
                                        const result = await mockAddUser({
                                            username,
                                            firstName,
                                            lastName,
                                            email,
                                            customerID,
                                            isAdmin
                                        });

                                        if (result.success) {
                                            setPopupMessage('User was added successfully.');
                                            ResetForm();
                                        }
                                    } catch (error) {
                                        console.error(error);
                                        setPopupMessage('There was a problem adding the user. Please try again.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}>

                                    <Label label="User name:">
                                        <Input
                                            value={username}
                                            onChange={(e) => setUserName(e.target.value)}
                                            required
                                            placeholder="Enter the user name for this account"
                                        />
                                    </Label>

                                    <Label label="First name:">
                                        <Input
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            placeholder="Enter the first name for this user"
                                        />
                                    </Label>

                                    <Label label="Last name:">
                                        <Input
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                            placeholder="Enter the last name for this user"
                                        />
                                    </Label>

                                    {/*Validate email on blur, when user leaves the field*/}
                                    {/*onBlur is fired when the email text field loses focus, then the validateEmail is called*/}
                                    <Label label="Email:">
                                        <Input
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onBlur={(e) => { setEmailValid(validateEmail(e.target.value)); }}
                                            required
                                            placeholder="Enter the email address for this user"
                                        />
                                        {!emailValid && <p className="error-text">Invalid email address</p>}
                                    </Label>

                                    <Label label="Customer ID:">
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

                                    {/* button only enabled when there are no errors and email is valid and customerIDis valid */}
                                    <Button type="submit" disabled={!canSubmitNewUser || loading || !emailValid || !customerIDValid}>
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
                                </form>
                            </div>
                        )}


                        {activeSection === 'deactivateUser' && (
                            <div className="admin-section">
                                <h2>Edit users:</h2>

                                <CustomGrid
                                    data={tableData}
                                    columns={[
                                        { id: 'userName', name: 'User name', width: '120px' },
                                        { id: 'firstName', name: 'First name', width: '130px' },
                                        { id: 'lastName', name: 'Last name', width: '130px' },
                                        { id: 'email', name: 'Email', width: '250px' },
                                        { id: 'active', name: 'Active?', width: '110px' },
                                    ]}
                                    search={true}
                                    pagination={true}
                                    pageLimit={6}
                                    sort={false}
                                />

                                <Button onClick={handleUpdateUsers}>
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

                            </div>
                        )}


                        {activeSection === 'addProduct' && (

                            // <div className="add-product-section">
                            <div className="admin-section">
                                <div className="add-product-section">
                                    <h2>Add Product:</h2>

                                    <form className="admin-form" onSubmit={async (e) => {
                                        e.preventDefault();
                                        setLoading(true);

                                        try {
                                            const result = await mockAddedProducts({
                                                username,
                                                firstName,
                                                lastName,
                                                email,
                                                customerID,
                                                isAdmin
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

                                        <Label label="Title:">
                                            <Input
                                                value={productTitle}
                                                onChange={(e) => setProductTitle(e.target.value)}
                                                required
                                                placeholder="Enter the product title"
                                            />
                                        </Label>

                                        <Label label="Description:">
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

                                        <Label label="Product Image:">
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

                                        <Button type="submit" disabled={!canSubmitNewProduct || loading}>
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
                                    </form>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}

export default Admin;
