export function checkPasswordStrength(password) {
    return {
        length: password.length >= 8,                       /* password length must be greater than 8 char*/
        upper: /[A-Z]/.test(password),                      /* enforce alpha upper/lower case*/
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),   /* enforce special chars */
    };
}