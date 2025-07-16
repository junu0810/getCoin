import dotenv from "dotenv";
import express from 'express'
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { kakaoAuthToken, sendKakaoMsg, refreshKakaoToken } from '../util/kakao-controller.js'


dotenv.config();
const app = express()
app.use(express.json())
const port = 3000

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tokenPath = path.join(__dirname, 'token.txt');


// 토큰 갱신 API 5시간마다 1번씩 
app.get('/refresh/token', async (req, res) => {
    try {
        try {
            console.log('refresh target FilePath :: ' + tokenPath);

            const data = fs.readFileSync(tokenPath, 'utf-8') ?? null;
            if (!data) {
                throw new Error('file데이터가 없습니다.')
            }
            console.log('read File Token ::' + data);

            const { recv_refreshToken: file_recv_refreshToken } = JSON.parse(data);
            if (!file_recv_refreshToken) throw new Error('not found file_recv_refreshToken')

            const { recv_accessToken, recv_refreshToken } = await refreshKakaoToken({ refresh_token: file_recv_refreshToken });
            const writeToken = JSON.stringify({ recv_accessToken, recv_refreshToken });
            console.log('get a Token::' + writeToken);

            fs.writeFileSync(tokenPath, writeToken);
            return { message: 'successToke' }
        } catch (err) {
            console.error('토큰 갱신 실패', err.message);
        }
        await refreshKakaoToken();
    } catch (err) {
        const errMsg = err?.response?.data?.message ? err?.response?.data?.message : err.message;
        throw new Error(errMsg);
    }
    res.status(200).send({ success: true });
})

// 나에게 메시지 보내기 알람 
app.post('/send/myself', async (req, res) => {
    console.log(req.body)
    const { message } = req.body;
    let access_token, refresh_token;

    // 파일에 토큰 확인  
    try {
        console.log('target FilePath :: ' + tokenPath);
        const data = fs.readFileSync(tokenPath, 'utf-8') ?? null;
        if (!data) {
            throw new Error('file데이터가 없습니다.')
        }
        console.log('read File Token ::' + data);
        const result = JSON.parse(data);

        access_token = result?.recv_accessToken ?? null;
        refresh_token = result?.recv_refreshToken ?? null;
    } catch (err) {
        console.error('파일 읽기 실패:', err.message);
    }


    if (!access_token && !refresh_token) {
        console.log('토큰발급 시도');
        // 토큰이 없을경우 발급 시도 
        const { recv_accessToken, recv_refreshToken } = await kakaoAuthToken()
        const writeToken = JSON.stringify({ recv_accessToken, recv_refreshToken });
        console.log('get a Token::' + writeToken);
        fs.writeFileSync(tokenPath, writeToken);
        access_token = recv_accessToken;
    };


    try {
        const result = await sendKakaoMsg({ message, access_token });
    } catch (err) {
        throw new Error(err.message)
    }

    res.status(200).send({ success: true });


})

app.listen(port, () => {
    console.log(`📩 Kakao Message Server listening on port ${port}`)
})