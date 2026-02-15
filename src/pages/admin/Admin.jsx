import React, {useState} from 'react';
import { useRef, useEffect } from 'react';
import './Admin.css';
import Spinner from '../../components/loader/Spinner.jsx';
import Button from "../../components/button/Button.jsx";
import {h} from 'gridjs'; //a helper/handle needed for checkboxes inside custom grid and capture button click inside grid like the Editbutton
// import { generateOTP } from '../../helpers/password/oneTimePassword.js';                 //future development
import { getLocalIsoString } from '../../helpers/timeConverter/timeConverter.js';
import { useInternetStatus  } from '../../hooks/useInternetStatus.js';
import { resizeAndCropImage } from '../../helpers/images/imageCropResize.js';               // Credits to Google and StackOverflow
import ImageCropper from "../../components/imagecrop/ImageCropper.jsx";                     // Credits to Google and StackOverflow
import {fetchProductsFromApi} from "../../helpers/product_fetch/product.js";                // Credits to Google and StackOverflow

//4 components that are used in this form to keep the Admin.jsx code leaner and cleaner
import AddUserSection from './components/AddUserSection.jsx';
import EditUserSection from './components/EditUserSection.jsx';
import AddProductSection from './components/AddProductSection.jsx';
import EditProductSection from './components/EditProductSection.jsx';

const showLogs = import.meta.env.VITE_SHOW_CONSOLE_LOGS === 'true'

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
    const fileInputRef = useRef(null);

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

            //check if something actually changed compared to originalUsersRef state
            setUsersChanged(JSON.stringify(updated) !== JSON.stringify(originalUsersRef.current));

            return updated;
        });
    };

    //build array, const tableData = users.map(user => [
    const userData = (users || []).map(user => [
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
        user.isSuperuser ? '🔒 Yes' : ''
    ]);

    const resetForm = () => {
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


    const addNewUser = async (userData, signal) => {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            signal,
        });

        return await response.json();
    };


    //logic to prevent the last Admin user to be deleted or demoted to a non admin user
    //important because if there is no admin user left, users cannot be edited/added and login fails
    const getUserKey = (u) => u.userId ?? u.email ?? u.userName;

    const isAdminEnabled = (u) => Boolean(u.admin) && Boolean(u.enabled);

    const didUserChange = (before, after) =>
        Boolean(before.admin) !== Boolean(after.admin) ||
        Boolean(before.enabled) !== Boolean(after.enabled);

    const findChangedUsers = (beforeList, afterList) => {
        const beforeMap = new Map(beforeList.map(u => [getUserKey(u), u]));
        const changed = [];
        for (const after of afterList) {
            const before = beforeMap.get(getUserKey(after));
            if (!before) continue;
            if (didUserChange(before, after)) changed.push({ before, after });
        }
        return changed;
    };

    const handleUpdateUsers = async () => {
        setLoading(true);
        const controller = new AbortController();

        try {
            const originalUsers = originalUsersRef.current || [];
            const changed = findChangedUsers(originalUsers, users);

            //superuser cannot be demoted/disabled
            for (const { before, after } of changed) {
                const isSuper = Boolean(before.isSuperuser ?? after.isSuperuser);
                if (!isSuper) continue;

                const demote = Boolean(before.admin) && !after.admin;
                const disable = Boolean(before.enabled) && !after.enabled;

                if (demote || disable) {
                    setPopupMessage('Superuser is protected and cannot be disabled or demoted.');

                    const key = before.id ?? before.email ?? before.userName;

                    setUsers((prev) =>
                        prev.map((u) => {
                            const uKey = u.id ?? u.email ?? u.userName;
                            if (uKey !== key) return u;

                            // revert only fields you want to protect
                            return {
                                ...u,
                                admin: before.admin,
                                enabled: before.enabled,
                            };
                        })
                    );

                    setLoading(false);
                    return;
                }
            }


            //at least one enabled admin after changes is required
            const enabledAdminsAfter = users.filter(isAdminEnabled).length;
            if (enabledAdminsAfter < 1) {
                setPopupMessage('You cannot apply this update because it would remove the last enabled admin.');
                setLoading(false);
                return;
            }

            const result = await updateUsers(users, controller.signal);

            if (result.success) {
                setPopupMessage('User was updated successfully.');
                originalUsersRef.current = users;
                setUsersChanged(false);
            } else {
                setPopupMessage(result.message || 'Update failed.');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                if (showLogs) console.error(error);
                setPopupMessage('There was a problem updating the users. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateUsers = async (updatedUsers, signal) => {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/update_users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUsers.map(user => ({
                UserID: user.id,
                UserIsAdmin: user.admin,
                UserEnabled: user.enabled,
                // UserIsNew: user.isNew
            }))),
            signal
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    };


    //product uploader using multipart/form-data for large files
    const uploadNewProduct = async (product) => {
        const formData = new FormData();
        formData.append("ProductHeaderDescription", product.title);
        formData.append("ProductDetailDescription", product.description);
        formData.append("ProductImage", product.image);  // This must be the raw File object
        formData.append("ProductAlt", product.image.name);

        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/product/product_create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                //No need to set 'Content-Type': it will be set automatically to multipart/form-data
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return await response.json();
    };


    //product uploader using multipart/form-data for large files
    const uploadEditedProduct = async (product) => {
        const formData = new FormData();
        formData.append("ProductID", String(product.id));
        formData.append("ProductHeaderDescription", product.title ?? '');
        formData.append("ProductDetailDescription", product.description ?? '');
        formData.append("ProductDiscontinued", String(!!product.discontinued));

        // Only include a new image if user selected/cropped one (File)
        if (product.newFile instanceof File) {
            formData.append("ProductImage", product.newFile, product.newFile.name || 'upload');
            formData.append("ProductAlt", product.newFile.name || 'upload');
        }

        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/product/product_update`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                // DO NOT set Content-Type here; let the browser set multipart boundary
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return await response.json();
    };


    //validate the username with records in the database, there can never be a duplicate username
    const checkUserNameExists = async () => {
        if (!username.trim()) return;

        if (isOnline) {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/validate_username?username=${encodeURIComponent(username)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.resultCode  === 1) {
                    //username is available
                    setUsernameValid(true);
                    setUsernameCheckMessage('');
                } else {
                    setUsernameValid(false);
                    setUsernameCheckMessage('This username is already in use.');
                }
            } catch (err) {
                if (showLogs) {
                    console.error("Username validation failed:", err);
                }
                setUsernameValid(false);
                setUsernameCheckMessage("Could not validate username.");
            }
        } else {
            setError('Internet connection not available.');
        }
    };


    //validate the email with records in the database, there can never be a duplicate email
    const checkEmailExists = async () => {
        if (!username.trim()) return;

        if (isOnline) {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/validate_email_new_user?email=${encodeURIComponent(email)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();
                if (showLogs) {
                    console.log('New user', result);
                }

                switch (result.resultCode) {
                    case -1:
                        //email is not in database yet
                        setUserEmailValid(true);
                        setUserEmailCheckMessage('');
                        break;
                    case 0:
                        //ok to proceed
                        break;
                    case 1:
                        setUserEmailValid(false);
                        setUserEmailCheckMessage('This email is already in use.');
                        break;
                    default:
                        setError('An unknown error occurred.');
                        break;
                }
            } catch (err) {
                if (showLogs) {
                    console.error("Email validation failed:", err);
                }
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
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
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
                isSuperuser: user.IsSuperuser === true || user.IsSuperuser === 1 || user.IsSuperuser === '1',
            }));

            setUsers(allUsers);
            originalUsersRef.current = allUsers;
        } catch (error) {
            if (showLogs) {
                console.error('Failed to fetch users:', error);
            }
        }
    };

    //load user table on page mount
    useEffect(() => {
        fetchUsers();
    }, []);


    //handler to reduce file size, no need to store very large imagecrop and would be a performance issue anyway
    const [cropSrc, setCropSrc] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [originalFileName, setOriginalFileName] = useState('');


    //Below useEffect will prevent the entire page from scrolling behind when the cropper modal is open, restore once it is closed
    useEffect(() => {
        if (showCropper) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('remove-no-scroll');
        }

        return () => {
            // Clean up both classes to ensure a clean state
            document.body.classList.remove('no-scroll');
            document.body.classList.remove('remove-no-scroll');
        };
    }, [showCropper]);


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setOriginalFileName(file.name);                         //save the original file name so the cropped file name maintains the same name

        const reader = new FileReader();
        reader.onloadend = () => {
            setCropSrc(reader.result); // base64 for Cropper
            setShowCropper(true);
        };
        reader.readAsDataURL(file);
    };


    // helper
    const toFile = (blob, name = 'upload.png') =>
        new File([blob], name, { type: blob.type || 'image/png' });

    // triggered after cropping
    const handleCroppedImage = async (croppedFile) => {
        if (!croppedFile) {
            setShowCropper(false);
            return;
        }

        try {
            const resized = await resizeAndCropImage(croppedFile, 900, 600);

            // Ensure we store a File (with a .name) not just a Blob
            const file =
                resized instanceof File
                    ? resized
                    : toFile(resized, originalFileName || 'upload.png');

            setProductImage(file);                              // <-- File
            setProductImagePreview(URL.createObjectURL(file));  // preview uses the new File
        } catch (error) {
            if (showLogs) {
                console.error("Image resizing failed:", error);
            }
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
            setShowCropper(false);
        }
    };

    //below is for the products
    const [productData, setProductData] = useState([]);
    const [productToEdit, setProductToEdit] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);


    //loads products from database only when user wants to edit them
    useEffect(() => {
        if (activeSection !== 'editProduct') return;

        const controller = new AbortController();
        setLoading(true); // show spinner while loading

        (async () => {
            try {
                const products = await fetchProductsFromApi(true, controller.signal); // pass signal
                setProductData(products);
            } catch (e) {
                if (e.name !== 'AbortError') {
                    setError('Failed to load products.');
                    if (showLogs) {
                        console.error(e);
                    }
                }
            } finally {
                setLoading(false); // hide spinner
            }
        })();

        return () => {
            controller.abort(); // cancel pending request
        };
    }, [activeSection]);


    //capture the Edit button clicks in editProduct section
    const allProductData = productData.map(product => [
        product.title,
        product.description,
        product.discontinued ? 'Yes' : 'No',
        product.imageBase64
            ? h('img', { src: product.imageBase64, alt: 'preview', style: 'max-width: 100px;' })
            : 'No Image',
        h(
            'button',
            {
                className: 'btn-primary',
                onClick: () => {
                    // show existing image by default
                    setProductImage({ name: 'current-image' });
                    setProductImagePreview(product.imageBase64 || null);

                    setProductToEdit(product);
                    setShowEditModal(true);
                },
                disabled: !isOnline
            },
            'Edit'
        )
    ]);


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
                            Edit Users
                        </Button>

                        <hr className="admin-sidebar" />

                        <Button onClick={() => setActiveSection('addProduct')}>
                            Add Product
                        </Button>

                        <Button onClick={() => setActiveSection('editProduct')}>
                            Edit Products
                        </Button>
                    </aside>

                    <main className="admin-content">
                        {activeSection === 'addUser' && (
                            <AddUserSection
                                // state
                                username={username}
                                setUserName={setUserName}
                                firstName={firstName}
                                setFirstName={setFirstName}
                                lastName={lastName}
                                setLastName={setLastName}
                                email={email}
                                setEmail={setEmail}
                                customerID={customerID}
                                setCustomerID={setCustomerID}
                                isAdmin={isAdmin}
                                setIsAdmin={setIsAdmin}

                                //validation and user interface
                                emailValid={emailValid}
                                setEmailValid={setEmailValid}
                                customerIDValid={customerIDValid}
                                setCustomerIDValid={setCustomerIDValid}
                                usernameValid={usernameValid}
                                usernameCheckMessage={usernameCheckMessage}
                                userEmailValid={userEmailValid}
                                userEmailCheckMessage={userEmailCheckMessage}

                                //some  shared flags
                                canSubmitNewUser={canSubmitNewUser}
                                loading={loading}
                                isOnline={isOnline}
                                error={error}
                                popupMessage={popupMessage}

                                // various actions
                                setLoading={setLoading}
                                setError={setError}
                                setPopupMessage={setPopupMessage}
                                resetForm={resetForm}
                                setActiveSection={setActiveSection}
                                fetchUsers={fetchUsers}
                                addNewUser={addNewUser}
                                checkUserNameExists={checkUserNameExists}
                                checkEmailExists={checkEmailExists}
                                getLocalIsoString={getLocalIsoString}
                            />
                        )}

                        {activeSection === 'editUser' && (
                            <EditUserSection
                                userData={userData}
                                error={error}
                                popupMessage={popupMessage}
                                canSubmitEditUser={canSubmitEditUser}
                                isOnline={isOnline}
                                handleUpdateUsers={handleUpdateUsers}
                                resetForm={resetForm}
                                setPopupMessage={setPopupMessage}
                            />
                        )}

                        {activeSection === 'addProduct' && (
                            <AddProductSection
                                productTitle={productTitle}
                                setProductTitle={setProductTitle}
                                productDescription={productDescription}
                                setProductDescription={setProductDescription}
                                productImage={productImage}
                                productImagePreview={productImagePreview}
                                setProductImage={setProductImage}
                                setProductImagePreview={setProductImagePreview}
                                fileInputRef={fileInputRef}
                                handleImageChange={handleImageChange}
                                uploadNewProduct={uploadNewProduct}
                                canSubmitNewProduct={canSubmitNewProduct}
                                loading={loading}
                                isOnline={isOnline}
                                error={error}
                                popupMessage={popupMessage}
                                setLoading={setLoading}
                                setPopupMessage={setPopupMessage}
                                resetForm={resetForm}
                            />
                        )}

                        {activeSection === 'editProduct' && (
                            <EditProductSection
                                allProductData={allProductData}
                                productData={productData}
                                error={error}
                                popupMessage={popupMessage}
                                resetForm={resetForm}
                                setPopupMessage={setPopupMessage}

                                // modal
                                showEditModal={showEditModal}
                                setShowEditModal={setShowEditModal}
                                productToEdit={productToEdit}
                                setProductToEdit={setProductToEdit}

                                //edit actions
                                uploadEditedProduct={uploadEditedProduct}
                                setLoading={setLoading}
                                loading={loading}
                                isOnline={isOnline}
                                setError={setError}

                                //image relatd
                                fileInputRef={fileInputRef}
                                productImage={productImage}
                                productImagePreview={productImagePreview}
                                setProductImage={setProductImage}
                                setProductImagePreview={setProductImagePreview}
                                handleImageChange={handleImageChange}

                                // refresh
                                setProductData={setProductData}
                            />
                        )}

                        {/* this cropper is used for Adding and Editing products */}
                        {showCropper && cropSrc && (
                            <ImageCropper
                                image={cropSrc}
                                fileName={originalFileName}
                                onComplete={handleCroppedImage}
                            />
                        )}
                    </main>
                </div>

                {loading && <Spinner/>}
            </div>
        </div>
    )
}

export default Admin;


