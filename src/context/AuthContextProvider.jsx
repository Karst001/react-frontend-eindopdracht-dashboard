import React, { useEffect, useState, useRef, useCallback } from 'react';
import './AuthContextProvider.css';
import Spinner from "../components/loader/Spinner.jsx";
import { AuthContext } from "./AuthContext";
import { useNavigate } from 'react-router-dom';


const auto_logout_time = 15 * 60 * 1000;                                        // Auto logout after 15 minutes of inactivity
const warning_before_signout = 10 * 1000;                                        // Show warning 10s before logout


function AuthContextProvider({ children }) {
    // Initial authentication state
    const [authState, setAuthState] = useState({
        isAuth: false,
        user: '',
        status: 'pending',                                                             // used to control loading/spinner visibility
    });

    const [showWarning, setShowWarning] = useState(false);        // warning popup state
    const navigate = useNavigate();
    const logoutTimerRef = useRef(null);                    // track inactivity timeout
    const warningTimerRef = useRef(null);
    const warningShownRef = useRef(false);                  // false prevents repeated warnings


    // Clears user data and redirects to login (used for both manual & auto logout )
    const logout = useCallback((auto = false) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setAuthState({
            isAuth: false,
            user: null,
            status: 'done',
        });

        clearTimeout(logoutTimerRef.current);
        clearTimeout(warningTimerRef.current);
        setShowWarning(false);

        console.log(auto ? 'User logged out due to inactivity' : 'User logged out manually');
        navigate('/signin');
    }, [navigate]);



    // registers login and saves user/token to localStorage
    const login = useCallback((result) => {

        const fetchedUser = {
            username: result.user.UserName,
            email: result.user.UserEmailAddress,
            isAdmin: result.user.UserIsAdmin,
            newsletter: result.user.UserHasNewsLetter || false,                 //set a false value of no value set in database
        };

        console.log(fetchedUser);

        // Store credentials locally, we need those to test on screen refresh event
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(fetchedUser));

        // Update context state
        setAuthState({
            isAuth: true,
            user: fetchedUser,
            status: 'done',
        });

        console.log('User is logged in as:', fetchedUser.username);
    }, []);


    // Checks localStorage to restore session if available, this is done on page mount / refresh
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            setAuthState({
                isAuth: true,
                user: JSON.parse(user),
                status: 'done',
            });
        } else {
            setAuthState({
                isAuth: false,
                user: null,
                status: 'done',
            });
        }
    }, []);



    // Called on any user interaction (mouse, key, etc.)
    // Resets timer and logs out after the set inactivity time
    const resetInactivityTimer = useCallback(() => {
        clearTimeout(logoutTimerRef.current);
        clearTimeout(warningTimerRef.current);
        setShowWarning(false);
        warningShownRef.current = false;                                // reset the warning trigger

        if (authState.isAuth) {
            // Set timer for showing warning
            warningTimerRef.current = setTimeout(() => {
                if (!warningShownRef.current) {
                    setShowWarning(true);
                    warningShownRef.current = true;                     // mark it as shown
                }
            }, auto_logout_time - warning_before_signout);


            // Set timer for actual logout
            logoutTimerRef.current = setTimeout(() => {
                logout(true);                                       // auto logout
            }, auto_logout_time);
        }
    }, [authState.isAuth, logout]);



    // Tracks activity via a listener and resets the timer on interaction
    useEffect(() => {
        const events = ['mousemove', 'keydown', 'click', 'scroll']; //register activity on any of these events

        events.forEach((event) => {
            window.addEventListener(event, resetInactivityTimer);
        });

        resetInactivityTimer();                                             // Start the inactivity timer

        // Cleanup listeners and timer on unmount
        return () => {
            events.forEach((event) =>
                window.removeEventListener(event, resetInactivityTimer)
            );
            clearTimeout(logoutTimerRef.current);
            clearTimeout(warningTimerRef.current);
        };
    }, [resetInactivityTimer]);


    // this function is needed to be called from Profile.jsx when user unsubscribes this state changes so the navbar then shows 'Our Newletter again'
    //in case user decided to change their mind after unsubscribing
    const updateSubscription = (subscribed) => {
        setAuthState((prevState) => ({
            ...prevState,
            user: {
                ...prevState.user,
                newsletter: subscribed,
            },
        }));
    };

    // update context values
    const data = {
        ...authState,
        userIsAuthenticated: authState.isAuth,
        user: authState.user,
        userLogIn: login,
        userLogOut: logout,
        updateSubscription,
    };



    // provide context upon authentication
    return (
        <AuthContext.Provider value={data}>
            {authState.status === 'pending' && <Spinner />}

            {authState.status === 'done' && (
                <>
                    {children}

                    {showWarning && (
                        <div className="inactivity-warning">
                            <p>⚠️ You’ll be logged out in 10 seconds due to inactivity.</p>
                        </div>
                    )}
                </>
            )}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;
