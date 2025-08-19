// this helper checks the email address submitted by a user.

// An email address is valid when;
// - the @ symbol is present
// - there cannot be a comma in the string
// - there cannot be a dot at the end of the email address, dus hotmail.com is valid, just like outlook.nl, maar outlooknl. is not

//expected results:
// validateEmail("n.eeken@novi.nl") result is true
// validateEmail("tessmellink@novi.nl") result is true
// validateEmail("n.eekenanovi.nl") result is false - missing @ symbol
// validateEmail("n.eeken@novinl.") result is false - no dot allowed at the end of string
// validateEmail("tessmellink@novi,nl") result is false - no comma allowed in string

export function validateEmail(emailAddress) {
    //Step 1: if no @ sign found, return False, the rest don't matter
    if (emailAddress.indexOf("@") === -1) {
        return false;
    }

    //Step 2: if "," sign found, return False, the rest don't matter
    if (emailAddress.indexOf(",") >= 0) {
        return false;
    }

    //Step 3: split the email address by using the '@' sign
    const emailSplit = emailAddress.split("@");
    if (emailSplit[1].includes(".")) {
        //part after @ contains a "." which is good, now check where the dot is, if it is at the end of the email address, it fails
        const notTheLastDot = emailSplit[1].substring(emailSplit[1].length - 1);
        if (notTheLastDot === ".") {
            return false;
        }
    } else {
        return false;
    }

    //step 4, final check if for any special characters except for @, for example if user enter a / inside the email address it fails
    const validCharsRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    if (!validCharsRegex.test(emailAddress)) {
        return false;
    }

    //no errors found, return true
    return true;
}