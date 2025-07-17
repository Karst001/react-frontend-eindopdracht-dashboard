import React, {useContext, useEffect} from 'react';
import './SignOut.css';
import {AuthContext} from "../../context/AuthContext";

function SignedOut() {
    // const navigate = useNavigate();

    const auth = useContext(AuthContext);

    //trigger userLogout on mounting page, only then toggle the state so user is logged out again
    //even when user uses the Back button on the browser the logged-in state does not show up again as the state remains 'not logged in'
    useEffect(() => {
        auth.userLogOut(); //set the state to userLogOut inside AuthContextProvider

        //clear token
        localStorage.removeItem('token');
    }, []);


    return (
        <div className="SignOut">
            <h1>U bent nu uitgelogd</h1>
            <p>Tot ziens, u mag de browser nu afsluiten.</p>
        </div>
    );
}

export default SignedOut;