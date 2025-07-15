import React, { useContext } from 'react';
import {Navigate} from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';

function PrivateRoute({ children }) {
    const { userIsAuthenticated } = useContext(AuthContext);

    if (!userIsAuthenticated) {
        // Redirect to sign-in page in case the user is not authenticated
        //you can test this for example by entering http://localhost:5173/profile, it will redirect to the signin page so manually tampering with the url is blocked
        return <Navigate to="/signin" replace />;
    }

    // Only render the protected component when authenticated
    return children;
}

export default PrivateRoute;