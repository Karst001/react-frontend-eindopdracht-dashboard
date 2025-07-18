import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


const useAutoLogout = (logoutFn, timeout = 10 * 60 * 1000) => {
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
        const events = ['mousemove', 'keydown', 'scroll', 'click'];

        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        resetTimer(); // Start the timer initially

        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
            if (timer.current) clearTimeout(timer.current);
        };
    }, [logoutFn, timeout, navigate]);
};

export default useAutoLogout;