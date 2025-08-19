//helper to convert a text string to a hashed password and convert to binary64, a value that can be stored directly into SQL
//encoding the string password to
export async function hashPasswordToHex(password) {
    //hash the string password to a Base64 string is not an encryption, using SHA-256 is the safe way of transporting a password to an API

    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert ArrayBuffer to hex string prefixed with 0x for SQL databases
    return (
        '0x' +
        Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
    );
}