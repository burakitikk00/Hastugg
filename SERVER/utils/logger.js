/**
 * Logger utility for environment-based logging
 * Logs only appear in development mode
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
    log: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    error: (...args) => {
        // Always log errors, even in production
        console.error(...args);
    },

    warn: (...args) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },

    info: (...args) => {
        if (isDevelopment) {
            console.info(...args);
        }
    }
};

module.exports = logger;
