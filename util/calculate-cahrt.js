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

