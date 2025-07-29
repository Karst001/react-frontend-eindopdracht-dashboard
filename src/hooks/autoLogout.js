import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

//this is a hook that is called from AuthContextProvider
//if there is no user activity for a set amount of time, the app will logout
const useAutoLogout = (logoutFn, timeout = timeout) => {
    const timer = useRef(null);
    const navigate = useNavigate();

    const resetTimer = () => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            logoutFn();           // Your logout function (clears auth, etc.)
            navigate('/signout');   // Redirect to login page
        }, timeout);
    };

    useEffect(() => {
        //define the events it needs to track for user activity
        const events = ['mousemove', 'keydown', 'scroll', 'click'];

        events.forEach((event) => {
            window.addEventListener(event, resetTimer); //add listener for each event
        });

        resetTimer();

        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer); //return the active event(s)
            });
            if (timer.current) clearTimeout(timer.current);
        };
    }, [logoutFn, timeout, navigate]);
};

export default useAutoLogout;