import winston, { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize } = format;

// 로그 포맷 정의
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}] ${typeof message === 'object' ? JSON.stringify(message) : message}`;
});

// 로그 색상 설정
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green'
});

// 로그 파일 경로 생성 함수
const getLogPath = (filename, type) =>
    path.join('logs', `${filename}-${type}-%DATE%.log`);

// ✅ 공통 로그 로테이터
const createRotatingTransport = (filename, type, level) => {
    return new DailyRotateFile({
        filename: getLogPath(filename, type),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxFiles: '14d', // 14일간 보관
        level: level || 'info',
        format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            logFormat
        )
    });
};

// ✅ 커스텀 데이터 로거
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
            createRotatingTransport(filename, 'data', 'debug'),
            createRotatingTransport(filename, 'data-error', 'error')
        ]
    });
    return logger;
};

// ✅ 거래 로거
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
            createRotatingTransport(filename, 'trade', 'info'),
            createRotatingTransport(filename, 'trade-error', 'error')
        ]
    });
    return logger;
};

export { customLogger, tradeLogger };
