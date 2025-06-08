import schedule from 'node-schedule'
import { fetchCandleData } from '../util/upbit-controller.js'
import URL from '../util/url-constants.js'
import { calculateMovingAverages } from '../util/calculate-cahrt.js'
import { upbitWebSocket } from '../util/socket.js'
import moment from 'moment'

const { upbit: { getCandlesMinutes } } = URL

//2초당 1번씩 실행 
// const crontab = '*/2 * * * * *'
const crontab = '* * * * * *'
const main = () => {
    const volumes = []
    const marketCode = "KRW-ETH"
    const shortWindow = 5
    
    const longWindow = 20

    console.log(volumes.length)

    schedule.scheduleJob(crontab, async () => {
        const candleDatas = await fetchCandleData({ market: marketCode, count: 50 })


        const CandleAvePrices = calculateMovingAverages({ candleDatas, shortWindow, longWindow })
        console.log(volumes.length)
        // console.log(CandleAvePrices)
    })
    // 실시간 거래량 수신
    upbitWebSocket({ market: marketCode }, (volume) => {

        let nowPrice = volume
        volumes.push(nowPrice);
        if (volumes.length > 60) volumes.shift(); // 1분 기준 초과 데이터 제거
    })
}


(async () => {
    console.log(`[scheduler]get accout information :: ${crontab}`);
    main();
})();