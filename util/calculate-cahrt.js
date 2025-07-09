/**
 * @description 캔들데이터로 단기이동평균,장기이동편균의 이동평균을 계산
 * @param {candleDatas} 캔들데이터 
 * @param {candleDatas.trade_price} 캔들데이터 종가 
 * @param {shortWindow} 단기이동평균 일수
 * @param {longWindow} 장기이동평균 일수 
 * @returns 
*/
export function calculateMovingAverages({ candleDatas, shortWindow, longWindow }) {
    const closePrices = candleDatas.map((candle) => candle.trade_price);

    const MA_short = calculateMA({ prices: closePrices, window: shortWindow });
    const MA_long = calculateMA({ prices: closePrices, window: longWindow });

    // 기존 데이터와 이동평균을 결합
    return candleDatas.map((candle, index) => ({
        date: candle.candle_date_time_kst,
        close: candle.trade_price,
        MA_short: MA_short[index],
        MA_long: MA_long[index],
    }));
}
/**
 * @description 코인의 종가배열으로 이동평균기간의 코인 이동평균을 구함
 * @param {prices} param 종가 배열 
 * @param {window} param 이동평균 기간
 * @returns 
 */
export const calculateMA = ({ prices, window }) =>
    prices.map((_, index) => {
        if (index + 1 < window) return null; // 데이터가 충분하지 않은 경우
        const windowPrices = prices.slice(index + 1 - window, index + 1);
        const sum = windowPrices.reduce((acc, price) => acc + price, 0);
        return sum / window;
    });

/**
 * @description RSI(상대강도지수) 계산 함수
 * @param {Object} param
 * @param {Array<number>} param.prices 종가 배열
 * @param {number} param.period 계산 기간 (기본: 14)
 * @returns {Array<number|null>} RSI 값 배열
 */
export const calculateRSI = ({ prices, period = 14 }) => {
    const rsi = [null]; // 첫 값은 null로 시작

    let gains = 0;
    let losses = 0;

    // 초기 평균 gain/loss 계산
    for (let i = 1; i <= period; i++) {
        const delta = prices[i] - prices[i - 1];
        if (delta >= 0) gains += delta;
        else losses -= delta;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    rsi.push(100 - (100 / (1 + avgGain / avgLoss)));

    // 이후 RSI 계산 (지수 이동평균 방식)
    for (let i = period + 1; i < prices.length; i++) {
        const delta = prices[i] - prices[i - 1];
        const gain = delta > 0 ? delta : 0;
        const loss = delta < 0 ? -delta : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        rsi.push(100 - (100 / (1 + avgGain / avgLoss)));
    }

    // 부족한 앞 구간은 null로 채움
    while (rsi.length < prices.length) rsi.unshift(null);

    return rsi;
};

/**
 * @description 볼린저 밴드 계산 함수
 * @param {Object} param
 * @param {Array<number>} param.prices 종가 배열
 * @param {number} param.period 기준 이동평균 기간 (기본: 20)
 * @param {number} param.stdDev 표준편차 배수 (기본: 2)
 * @returns {Array<Object>} 각 봉마다 { middle, upper, lower } 값 반환
 */
export const calculateBollingerBands = ({ prices, period = 20, stdDev = 2 }) => {
    const bands = [];

    for (let i = 0; i < prices.length; i++) {
        if (i < period - 1) {
            bands.push({ middle: null, upper: null, lower: null });
            continue;
        }

        const windowPrices = prices.slice(i - period + 1, i + 1);
        const mean = windowPrices.reduce((a, b) => a + b, 0) / period;
        const variance = windowPrices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
        const std = Math.sqrt(variance);

        bands.push({
            middle: mean,
            upper: mean + stdDev * std,
            lower: mean - stdDev * std,
        });
    }

    return bands;
};

