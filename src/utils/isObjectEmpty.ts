/**
 * @param {any} object object to compare
 * @returns {boolean} whether object is empty
 */
const isObjectEmpty = (obj: any): boolean => {
    if (Object.keys(obj).length > 0) {
        return false;
    }
    return true;
};

export default isObjectEmpty;
