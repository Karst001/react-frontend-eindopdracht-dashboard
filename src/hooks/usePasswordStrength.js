import { useEffect, useState } from 'react';
import { checkPasswordStrength } from '../helpers/password/passwordStrength.js';

//custom hook that uses the helper passwordStrength
export function usePasswordStrength(password) {
    const [strength, setStrength] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false,
    });

    useEffect(() => {
        const result = checkPasswordStrength(password); //call the helper and pass the password to determine the strength
        setStrength(result);
    }, [password]);

    const isStrong = Object.values(strength).every(Boolean);

    return { strength, isStrong };  //return the strength of the password and what values did not meet the requirements like length, upper case, etc
}