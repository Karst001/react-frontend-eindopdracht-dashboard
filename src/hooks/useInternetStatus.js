
import { useEffect, useState } from 'react';

// this is a hook that checks to see if the app is online or not, meaning do we have internet connection or not?
//this helps creating a clear error message when internet connection has failed


// Checks internet connectivity by pinging a reliable resource like Google
// If google is blocked, can also use the API server, for testing Google is fine for now
async function verifyInternetAccess(timeoutMs = 2000) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch('https://clients3.google.com/generate_204', {
            method: 'GET',
            cache: 'no-cache',
            mode: 'no-cors',                            // prevent CORS error
            signal: controller.signal
        });

        clearTimeout(timeout);                          // reset the timeout for next try
        // Even if we can't read the response due to `no-cors`, fetch success is enough
        return true;
    } catch {
        return false;
    }
}


// hook to check if internet access is actually available, checks every 4 seconds
export function useInternetStatus(pollInterval = 4000) {
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function updateStatus() {
            const result = await verifyInternetAccess();
            if (mounted) setIsOnline(result);
        }

        updateStatus(); // check immediately

        const interval = setInterval(updateStatus, pollInterval);                       // check every 4seconds

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        return () => {
            mounted = false;
            clearInterval(interval);                                                            // clear interval so it keeps checking
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
        };
    }, [pollInterval]);

    return isOnline;
}
