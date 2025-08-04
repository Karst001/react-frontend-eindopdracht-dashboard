//helper to convert a text string to a hashed password and convert to binary64, a value that can be stored directly into SQL

// export async function hashPasswordToBinary(password) {
//     const encoder = new TextEncoder();
//     const data = encoder.encode(password);
//
//     const hashBuffer = await crypto.subtle.digest('SHA-256', data);      // returns an ArrayBuffer
//
//     return bufferToHex(hashBuffer);                                                         // converts the buffer to hex
// }
//
//
// function bufferToHex(buffer) {
//     return (
//         '0x' +
//         Array.from(new Uint8Array(buffer))
//             .map(b => b.toString(16).padStart(2, '0'))
//             .join('')
//     );
// }

export async function hashPasswordToHex(password) {
    //hash the string password
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