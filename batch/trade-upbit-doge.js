import schedule from 'node-schedule'
import { fetchCandleData } from '../util/upbit-controller.js'
import URL from '../util/url-constants.js'
import {
    calculateMovingAverages,
    calculateBollingerBands,
    calculateRSI,
    calculateMA
} from '../util/calculate-cahrt.js'
import moment from 'moment'

const marketCode = "KRW-DOGE"
const { upbit: { getCandlesMinutes } } = URL
const debug = false;

// 볼린저밴드와 RSI지수를 활용한 DOGE코인 거래 
const crontab = '* * * * * *'
const main = () => {
    schedule.scheduleJob(crontab, async () => {


        // 업비트에서 최신 50개 캔들데이터 가져오기
        const candleDatas = await fetchCandleData({ market: marketCode, count: 50 });
        if (debug) console.log(candleDatas.length);


        // 종가 배열 추출
        const closePrices = candleDatas.map(c => c.trade_price);
        if (debug) console.log(closePrices);

        // RSI 계산 (기본 14봉)
        const rsiValues = calculateRSI({ prices: closePrices });
        if (debug) console.log(rsiValues);

        // 볼린저밴드 계산 (기본 20봉, 표준편차 2배)
        const bollinger = calculateBollingerBands({ prices: closePrices });

        // 가장 최근 봉의 값들 추출
        const latestIndex = closePrices.length - 1;
        const close = closePrices[latestIndex]; // 현재 종가
        const prevClose = closePrices[latestIndex - 1]; // 이전 종가

        const rsi = rsiValues[latestIndex]; // 현재 RSI
        const { upper, lower } = bollinger[latestIndex]; // 현재 볼린저 상/하단
        if (debug) console.log({
            rsi,
            upper,
            lower
        })
        // 매수 조건:
        // 1) RSI < 30 (과매도)
        // 2) 종가가 하단 밴드 이탈 후 다시 상향돌파 (반등 판단)
        if (rsi < 30 && prevClose < lower && close > lower) {
            console.log('📈 매수 신호: RSI 과매도 + 밴드 하단 이탈 후 복귀');
        }

        // 매도 조건:
        // 1) RSI > 70 (과매수)
        // 2) 종가가 상단 밴드 돌파
        if (rsi > 70 && close > upper) {
            console.log('📉 매도 신호: RSI 과매수 + 밴드 상단 돌파');
        }

    });
}



(async () => {
    console.log(`[scheduler]get accout information :: ${crontab}`);
    main();
})();