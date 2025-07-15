
import React, { useEffect, useState } from 'react';
import Spinner from "../components/loader/Spinner.jsx";
import { AuthContext } from "./AuthContext";

// Reusable context provider component that wraps children with authentication related logic
function AuthContextProvider({ children }) {
    // Initialize authentication state
    const [authState, setAuthState] = useState({
        isAuth: false,                                              // user is not authenticated by default
        user: '',
        status: 'pending',                                          // Used to control loading state (e.g. show spinner)
    });

    // on mount: check if user is already logged in by checking localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            // if user data is found, log them in automatically, this happens on page refresh
            setAuthState({
                isAuth: true,
                user: JSON.parse(storedUser),
                status: 'done',
            });
        } else {
            // no data found, set state to indicate no active user
            setAuthState({
                isAuth: false,
                user: null,
                status: 'done',
            });
        }
    }, []);

    // Login function to simulate user authentication
    function login(email) {
        const fetchedUser = {
            username: 'Karst002',
            email: email,
            // id: 99,
            isAdmin: email === 'admin@test.com', // Temporary admin check
            newsletter: true,
        };

        // Store credentials and user info locally
        localStorage.setItem('token', import.meta.env.VITE_API_KEY);
        localStorage.setItem('user', JSON.stringify(fetchedUser));

        // Update auth state with user info
        setAuthState({
            isAuth: true,
            user: fetchedUser,
            status: 'done',
        });

        console.log('User is logged in as:', fetchedUser);
    }

    // Logout function to clear auth data
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setAuthState({
            isAuth: false,
            user: null,
            status: 'done',
        });

        console.log('User is logged out');
    }

    // build the value passed to context consumers
    const data = {
        ...authState,                                   // spread the current auth state
        userIsAuthenticated: authState.isAuth,          // alias for isAuth (semantic naming)
        user: authState.user,
        userLogIn: login,                               // expose login method
        userLogOut: logout,                             // expose logout method
    };

    return (
        // Wrap children in the AuthContext provider
        <AuthContext.Provider value={data}>
            {authState.status === 'pending' && <Spinner />}     {/* show spinner while checking auth status */}

            {authState.status === 'done' && children}           {/* render children once auth check is complete */}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;
