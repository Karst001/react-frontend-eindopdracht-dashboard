export function getLocalIsoString() {
    const now = new Date();                                                 // this date is UTC
    const pad = n => n.toString().padStart(2, '0');                               //in NL add 2 hrs to convert to local time
    const offsetMinutes = -now.getTimezoneOffset();                       //compensate for time zones and Daylight Savings Time
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60));
    const offsetMins = pad(Math.abs(offsetMinutes) % 60);

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${sign}${offsetHours}:${offsetMins}`;
}