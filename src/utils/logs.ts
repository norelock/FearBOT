/**
 * @param {String} message message of log
 * @param {String} type type of log
 * @returns {string|null} converted message in prefixed detail
 */

const logs = (message: string, type: string) => {
    if (type) {
        switch (type) {
            case "info":
                return console.log(`[INFO] ${message}`);
            case "error":
                return console.warn(`[ERROR] ${message}`), process.exit(0);
        }
    }
};

export default logs;
