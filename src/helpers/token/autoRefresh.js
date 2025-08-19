import { jwtDecode } from "jwt-decode";
//credits to Google and other sources of inspiration

//get/set the token
const getToken = () => localStorage.getItem("access_token");
const setToken = (t) => localStorage.setItem("access_token", t);

// Starts an auto-refresh routine for short-lived JWT access tokens

// Instead of polling every X seconds, this schedules a timer that fires just before the token is getting close to expiry.
// This ensures that there are:
// - No excessive or wasted network calls
// - No risk of "too late, token already expired scenarios"

// baseUrl             - API base URL
// intervalMs          - how often to check
// thresholdSeconds    - refresh when expiry less than a value
// onRefreshed         - callback(newToken)
// onError             - callback(error)
// runImmediately      - immediately check once on start
// Returns a cleanup function to stop the auto-refresh

// flowchart of this token refresh process
// A[Start: startTokenAutoRefresh()] --> B[getToken() from localStorage]
// B -->|No token| Z[Stop / do nothing]
// B -->|Token present| C[Decode JWT → exp]
//
// C -->|Decode fails or no exp| D[refreshNow()]
// C -->|Decoded OK| E[Compute fireIn = exp - now - threshold - safety]
// E --> F[setTimeout(checkAndMaybeRefresh, fireIn)]
// D --> G[fetch /token/renew]
// G --> H{Response OK & token present?}
// H --> |No| I[onError(err); scheduleNext()]
// H --> |Yes| J[setToken(newToken)]
// J --> K[scheduleNext() based on new exp]
// F --> L[Timer fires → checkAndMaybeRefresh()]
// L --> M[secondsLeft = exp - now]
// M --> |<= threshold + safety| D
// M --> |> threshold + safety| K
//
// Event wake-ups:
// - Browser events
// - V[visibilitychange: visible] --> L
// - O[online] --> L
//
// Guards:
// - subgraph Concurrency guard
// - X[inflight?] -->|Yes| L
// - X -->|No| D

//called from authContextProvider on login or page refresh
export function startTokenAutoRefresh({
                                          baseUrl,
                                          thresholdSeconds,
                                          safetySeconds = 5,             // covers network/clock jitter
                                          onRefreshed,
                                          onError,
                                          runImmediately = true,
                                      } = {}) {

    console.log('[autoRefresh.js] - startTokenAutoRefresh called')
    let stopped = false;                                                // flag for tracking cleanup
    let timerId = null;                                                    // holds the scheduled timeout
    let inflight = null;                                                   // holds a promise if a refresh is already running and prevents overlaps

    //clear the timer
    //Clears any active timer so we don’t end up with multiple pending timeouts firing at unexpected times
    const clearTimer = () => {
        if (timerId) {
            console.log('[autoRefresh.js] - clearTimer');
            clearTimeout(timerId);
            timerId = null;
        }
    };

    //define when to check next time to validate current token
    // Figures out the *next best time* to check the token.
    // - Reads `exp` claim from the token
    // - Calculates how many seconds are left
    // - Schedules a timeout for "expiry - threshold - safety"
    // - If token cannot be decoded, we refresh immediately as a fallback to prevent token expiration issues
    const scheduleNext = () => {
        console.log('[autoRefresh.js] - scheduleNext');

        clearTimer();
        if (stopped) {
            return;
        }

        //validate token in local storage, if no token nothing to schedule ore timer to start
        const token = getToken();
        if (!token) {
            return;                                                                  // nothing to schedule
        }

        let expSec;
        try {
            const { exp } = jwtDecode(token) || {};
            if (!exp || Number.isNaN(Number(exp))) {                                // if it can't read exp – try to refresh right away
                return void refreshNow();
            }
            expSec = Number(exp);
        } catch {
            // Couldn’t decode do a refresh right away
            return void refreshNow();
        }

        //where are we at right now
        const nowSec = Math.floor(Date.now() / 1000);

        //determine when to fire a refresh next
        const fireInSec = Math.max(0, expSec - nowSec - thresholdSeconds - safetySeconds);
        const fireInMs = fireInSec * 1000;
        console.log('[autoRefresh.js] - fireInSec', fireInSec);

        // Use setTimeout for a single fire, this is not a interval
        timerId = setTimeout(checkAndMaybeRefresh, fireInMs);
        console.log('[autoRefresh.js] - timerId', timerId);
    };


    // Executes a refresh request immediately
    // - Prevents multiple overlapping calls (via `inflight`)
    // - Gets a new token from API and stores it
    // - Reschedules the next refresh based on the new expiry from new token value
    const refreshNow = async () => {
        if (stopped || inflight) {
            console.log('[autoRefresh.js] - stopped/inflight', inflight);
            return inflight;
        }

        inflight = (async () => {
            try {
                //grab new token from API
                const newToken = await fetchNewToken(baseUrl);

                //set the new token into local storage
                setToken(newToken);
                onRefreshed?.(newToken);
            } finally {
                inflight = null;

                // schedule based on the NEW token
                console.log('[autoRefresh.js] - scheduleNext');
                scheduleNext();                         // reschedule using the new token’s exp
            }
        })().catch((err) => { onError?.(err); });
        return inflight;
    };



    // Checks if the token is close enough to expiry to refresh 'now', otherwise, reschedules the timer.
    // This gets called when:
    // - The scheduled timer fires
    // - The tab regains focus (visibilitychange)
    // - The browser comes back online
    const checkAndMaybeRefresh = () => {
        console.log('[autoRefresh.js] - checkAndMaybeRefresh');
        if (stopped) {
            return;
        }

        //read current token from local storage
        const token = getToken();
        if (!token) {
            return;
        }

        //check current token and decide if a refresh is required now
        try {
            const { exp } = jwtDecode(token) || {};
            const nowSec = Math.floor(Date.now() / 1000);
            const secondsLeft = (Number(exp) || 0) - nowSec;

            if (secondsLeft <= thresholdSeconds + safetySeconds) {
                console.log('[autoRefresh.js] - refreshNow: ', true)

                //refresh now before it is expired
                refreshNow();
            } else {
                // reschedule for next time to check
                scheduleNext();
            }
        } catch {
            //safety net, refresh now before it is expired
            refreshNow();
        }
    };


    // Also check when the tab regains focus or comes back online
    // Handle browser events that can 'pause' timers:
    // - In background tabs, setTimeout can be throttled badly, different browsers also respond differently to timers
    // - When the user comes back, we immediately check again.
    const onVisible = () => {
        if (document.visibilityState === "visible") {
            checkAndMaybeRefresh();
        }
    };

    const onOnline = () => checkAndMaybeRefresh();
    window.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);

    // Kick start the timer process
    if (runImmediately) {
        checkAndMaybeRefresh();
    }
    else {
        scheduleNext();
    }

    // Return cleanup function for when user logs out or component unmounts
    return () => {
        stopped = true;
        clearTimer();
        window.removeEventListener("visibilitychange", onVisible);
        window.removeEventListener("online", onOnline);
    };
}

//make the call to the product_fetch and send current valid token, never send an expired token, if I can do this to get a new valid token, so can a hacker
//using cookies is a safer method but exceeds the scope of this project
// Actually performs the token renewal call to the API.
// - Uses the current valid token in `Authorization`
// - Fails if the token is already expired, this is why we check early to refresh, having an expired token is bad practise
// - Aborts after 10s to avoid hanging requests

//NOTE for future improvement: In production, a safer design is to use refresh tokens (in secure httpOnly cookies) instead of reusing access tokens

async function fetchNewToken(baseUrl) {
    const controller = new AbortController();

    const id = setTimeout(() => controller.abort(), 10000); // 10s timeout
    try {
        const res = await fetch(`${baseUrl}/token/renew`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            signal: controller.signal,
        });

        if (!res.ok) {
            throw new Error(`renew failed: ${res.status}`);
        }

        const data = await res.json();
        if (!data?.token) {
            throw new Error("no token in response");
        }

        console.log('[autoRefresh.js] - fetchNewToken: ', data.token)
        return data.token;
    } finally {
        clearTimeout(id);
    }
}

