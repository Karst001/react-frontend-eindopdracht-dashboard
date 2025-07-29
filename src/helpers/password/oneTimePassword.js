//this is a helper that generates a onetime password, this application does not allow user to create an account themselves.
//Since there is data from various customers, the account must be setup by an Admin who assigned an customerID to an account so the correct data is retrieved

export function generateOTP(length = 6, options = { digits: true, upperCase: false, lowerCase: false }) { //default use 8 digits, from the jsx you can set upper/lowercase letters also
    const { digits, upperCase, lowerCase } = options;

    let characters = '';
    if (digits) characters += '0123456789';
    if (upperCase) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowerCase) characters += 'abcdefghijklmnopqrstuvwxyz';

    if (!characters) {
        throw new Error('At least one character type must be enabled');
    }

    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return otp;
}