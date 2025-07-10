import winston, { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}] ${JSON.stringify(message)}`;
});


winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green'
});

const customLogger = ({ filename }) => {
    const logger = createLogger({
        level: 'debug',
        format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            colorize(),
            logFormat
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: `logs/${filename}-data-error.log`, level: 'error' }),
            new transports.File({ filename: `logs/${filename}-data.log` })
        ]
    });
    return logger
}

const tradeLogger = ({ filename }) => {
    const logger = createLogger({
        level: 'info',
        format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            colorize(),
            logFormat
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: `logs/${filename}-trade-error.log`, level: 'error' }),
            new transports.File({ filename: `logs/${filename}-trade.log` })
        ]
    });
    return logger
}



export { customLogger, tradeLogger }
