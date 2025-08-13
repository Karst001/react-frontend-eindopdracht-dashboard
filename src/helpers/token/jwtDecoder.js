import jwt_decode from "jwt-decode";

//check if the time stamp inside the existing token in local storage is expired or not
export default function isTokenExpired() {
    try {
        const token = localStorage.getItem("access_token");
        if (!token) return true; // no token = "expired"

        const decoded = jwt_decode(token);

        if (!decoded.exp) return true; // no expiration claim, treat as expired

        const currentTime = Math.floor(Date.now() / 1000); // in seconds
        return decoded.exp < currentTime;
    } catch (err) {
        console.log(err); // invalid token format
        return true;
    }
}