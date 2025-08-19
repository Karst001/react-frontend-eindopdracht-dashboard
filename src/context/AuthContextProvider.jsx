import React, { useEffect, useState, useRef, useCallback } from 'react';
import './AuthContextProvider.css';
import Spinner from "../components/loader/Spinner.jsx";
import { AuthContext } from "./AuthContext";
import { useNavigate } from 'react-router-dom';
import { startTokenAutoRefresh } from "../helpers/token/autoRefresh.js";                //used for starting and stopping token refresh

const auto_logout_time = 15 * 60 * 1000;                                        // Auto logout after 15 minutes of inactivity
const warning_before_sign_out = 10 * 1000;                                        // Show warning 10s before logout

function AuthContextProvider({ children }) {
    const stopAutoRefreshRef = useRef(null);

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
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        if (import.meta.env.VITE_SHOW_JWT_CONSOLE_LOGS === 'true') {
            console.log('stopAutoRefreshRef = stopped');
        }

        stopAutoRefreshRef.current = null;                                          // stop the token refresh process

        setAuthState({
            isAuth: false,
            user: null,
            status: 'done',
        });

        clearTimeout(logoutTimerRef.current);
        clearTimeout(warningTimerRef.current);
        setShowWarning(false);

        if (import.meta.env.VITE_SHOW_JWT_CONSOLE_LOGS === 'true') {
            console.log(auto ? 'User logged out due to inactivity' : 'User logged out manually');
        }

        navigate('/signin');
    }, [navigate]);



    // registers login and saves user/token to localStorage
    const login = useCallback((result) => {
        const fetchedUser = {
            userId: result.user.UserID,
            username: result.user.UserName,
            email: result.user.UserEmailAddress,
            isAdmin: result.user.UserIsAdmin,
            newsletter: result.user.UserHasNewsLetter || false,                 //set a false value if no newsletter was found in database for this user
        };


        // Store credentials locally, we need those to test onscreen refresh event
        localStorage.setItem('access_token', result.token);
        localStorage.setItem('user', JSON.stringify(fetchedUser));

        // Update context state
        setAuthState({
            isAuth: true,
            user: fetchedUser,
            status: 'done',
        });

        // start auto refresh, in the API the JWT token is only valid for 2 minutes, here we check every 35 seconds
        stopAutoRefreshRef.current?.();                                         // clear just in case
        stopAutoRefreshRef.current = startTokenAutoRefresh({
            baseUrl: import.meta.env.VITE_BASE_URL,
            // userName: fetchedUser.username,
            // email: fetchedUser.email,
            // intervalMs: 90000,                                                  // check every 90ec
            thresholdSeconds: 25,                                               // refresh if less than 25s left in current token
            onRefreshed: () => {
                if (import.meta.env.VITE_SHOW_JWT_CONSOLE_LOGS === 'true') {
                    console.log('[AuthContextProvide.jsx] - token refreshed')
                }
            },
            onError: (error) => console.warn('refresh failed', error),
        });

        if (import.meta.env.VITE_SHOW_JWT_CONSOLE_LOGS === 'true') {
            console.log('[AuthContextProvide.jsx] - User is logged in as:', fetchedUser.username);
        }
    }, []);


    // Checks localStorage to restore session if available, this is done on page mount / refresh
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user');

        if (import.meta.env.VITE_SHOW_JWT_CONSOLE_LOGS === 'true') {
            console.log('[AuthContextProvide.jsx] - useEffect refresh');
        }

        if (token && user) {
            const localUser = JSON.parse(user);
            setAuthState({
                isAuth: true,
                user: localUser,
                status: 'done',
            });

            // start auto refresh token for restored or new session
            stopAutoRefreshRef.current?.();
            stopAutoRefreshRef.current = startTokenAutoRefresh({
                baseUrl: import.meta.env.VITE_BASE_URL,
                // intervalMs: 90000,
                thresholdSeconds: 25,
                // runImmediately: true,
                onRefreshed: () => {
                    if (import.meta.env.VITE_SHOW_JWT_CONSOLE_LOGS === 'true') {
                        console.log('[AuthContextProvide.jsx -> startTokenAutoRefresh] - Refreshed page');
                    }
                },
                onError: (error) => {
                    console.warn('[AuthContextProvide.jsx -> startTokenAutoRefresh - refresh failed', error);
                    // my API rejects expired tokens (401) for renew, if that case happens logout
                    if (String(error?.message || '').includes('401')) {
                        logout(true); // force sign out to avoid a broken session
                    }
                },
            });

        } else {
            setAuthState({
                isAuth: false,
                user: null,
                status: 'done',
            });
        }

        // just for peace of mind, stop auto-refresh if the provider ever unmounts for whatever reason
        return () => {
            stopAutoRefreshRef.current?.();
            stopAutoRefreshRef.current = null;
        };
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
            }, auto_logout_time - warning_before_sign_out);


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
