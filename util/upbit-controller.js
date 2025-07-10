import { upReqWithoutParmeter } from '../util/basic-request.js'

/**
 * @description 업비트 캔들데이터 획득용
 * @param {String} candleUrl URL 엔드포인트 
 * @param {String} market 마켓코드 (ex. KRW-BTC)
 * @param {Number} count 캔들갯수 (쵀대 200)
 * @returns 
 */
export async function fetchCandleData({ candleUrl, market, count = 50 }) {
    const upAxiosWithoutParam = upReqWithoutParmeter()

    try {
        const response = await upAxiosWithoutParam.get(candleUrl, { params: { market, count } });
        return response.data;
    } catch (error) {
        const errorMsg = error.response ? error.response.data.message : error.message
        console.error('Error fetching candle data:', errorMsg);
        return [];
    }
}