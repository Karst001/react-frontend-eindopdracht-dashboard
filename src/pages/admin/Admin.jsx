import React, {useState} from 'react';
import './Admin.css';
import Spinner from '../../components/loader/Spinner.jsx';
import PopupMessage from "../../components/popupmessage/PopupMessage.jsx";
import Button from "../../components/button/Button.jsx";
import Label from "../../components/label/Label.jsx";

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

    const [users, setUsers] = useState([
        {id: 1, username: 'jdoe', firstName: 'John', lastName: 'Doe', email: 'jdoe@test.com', active: true},
        {id: 2, username: 'asmith', firstName: 'Anna', lastName: 'Smith', email: 'asmith@test.com', active: false},
        {id: 3, username: 'bjones', firstName: 'Bob', lastName: 'Jones', email: 'bjones@test.com', active: true},
        {id: 4, username: 'akarsten', firstName: 'Ad', lastName: 'Karsten', email: 'ad@test.com', active: true},
    ]);

    const toggleUserActive = (id) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === id ? {...user, active: !user.active} : user
            )
        );
    };

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
                        <Button text="Add User" onClick={() => setActiveSection('addUser')}/>
                        <Button text="Edit User" onClick={() => setActiveSection('deactivateUser')}/>
                        <Button text="Add Product" onClick={() => setActiveSection('addProduct')}/>
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
                                        <input type="text" value={username}
                                               onChange={(e) => setUserName(e.target.value)} required
                                               placeholder="Enter the user-name for this account"
                                        />
                                    </Label>

                                    <Label label="First name:">
                                        <input type="text" value={firstName}
                                               onChange={(e) => setFirstName(e.target.value)} required
                                               placeholder="Enter the first name for this user"
                                        />
                                    </Label>

                                    <Label label="Last name:">
                                        <input type="text" value={lastName}
                                               onChange={(e) => setLastName(e.target.value)} required
                                               placeholder="Enter the last name for this user"
                                        />
                                    </Label>

                                    <Label label="Email:">
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                               required
                                               placeholder="Enter the email address for this user"
                                        />
                                    </Label>

                                    <Label label="Customer ID:">
                                        <input type="number" value={customerID}
                                               onChange={(e) => setCustomerID(e.target.value)} required
                                               placeholder="Enter the customer ID for this account (6 digits long)"
                                        />
                                    </Label>

                                    <Label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={isAdmin}
                                            onChange={(e) => setIsAdmin(e.target.checked)}
                                        />
                                        This user has administrator rights
                                    </Label>

                                    <Button text="Add User" type="submit" disabled={!canSubmitNewUser || loading}/>

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

                                {/*used a html table for now, want to change using a grid */}
                                <table className="admin-user-table">
                                    <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        <th>Active?</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} onClick={() => toggleUserActive(user.id)}>
                                            <td>{user.username}</td>
                                            <td>{user.firstName}</td>
                                            <td>{user.lastName}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={user.active}
                                                    onChange={(e) => e.stopPropagation()} // prevent double toggle
                                                    readOnly
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                                <Button text="Update User" onClick={handleUpdateUsers}/>

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
                                            <input type="text" value={productTitle}
                                                   onChange={(e) => setProductTitle(e.target.value)} required
                                                   placeholder="Enter the product title"
                                            />
                                        </Label>

                                        <Label label="Description:">
                                        <textarea
                                            value={productDescription}
                                            onChange={(e) => setProductDescription(e.target.value)}
                                            rows={5}
                                            required
                                            placeholder="Enter the description for this product"
                                        />
                                        </Label>

                                        <label>
                                            Product Image:
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
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setProductImage(file);
                                                            setProductImagePreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                />
                                            </div>

                                            {productImagePreview && (
                                                <div className="image-preview">
                                                    <img src={productImagePreview} alt="Product Preview"/>
                                                    <p>{productImage.name}</p>
                                                </div>
                                            )}
                                        </label>

                                        <Button text="Create Product" type="submit"
                                                disabled={!canSubmitNewProduct || loading}/>

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
