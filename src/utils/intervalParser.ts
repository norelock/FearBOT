/**
 * @param {Object} interval interval object to parse
 * @returns {number|null} time converted to ms or null when all fields are equal to 0
 */
const parseIntervalToSeconds = (interval: { 
  days: number, 
  minutes: number, 
  hours: number, 
  seconds: number }) : number | null => {
        const { seconds, minutes, hours, days } = interval;

        if (seconds === 0 && minutes === 0 && hours === 0 && days === 0) {
            return null;
        }

        return (seconds + minutes * 60 + hours * 3600 + days * 86400) * 1000;
    }

export default parseIntervalToSeconds;