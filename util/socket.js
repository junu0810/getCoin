import WebSocket from 'ws'
import URL from '../util/url-constants.js'

const { upbit: { BaseSocket, SokcetTicket } } = URL
const ws = new WebSocket(BaseSocket);

let isSocketConnected = false
/**
 * WebSocket으로 거래량 실시간 수집
 * @param {*} param0 market Code 명
 * @param {*} callback 응답값
 */
function upbitWebSocket({ market }, callback) {
    if (isSocketConnected) {
        return;
    }

    ws.on('open', () => {
        isSocketConnected = true
        ws.send(
            JSON.stringify([
                { ticket: SokcetTicket },
                { type: 'trade', codes: [market] },
            ])
        );
    });

    ws.on('message', (data) => {
        const trade = JSON.parse(data.toString());
        const volume = trade.trade_volume; // 실시간 거래량
        callback(volume)
    });

}

export { upbitWebSocket }