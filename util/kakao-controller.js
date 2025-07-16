import axios from "axios";
import { URL } from "./url-constants.js";
import qs from "qs";
import dotenv from 'dotenv'
dotenv.config();

const {
    KAKAOTALK_REST_API_KEY: KAKAO_API_TOKEN,
    KAKAOTALK_CODE: KAKAO_TOKEN,
} = process.env;

const { KAKAO: { BaseURL, SendOtherMessage, SendSelfMessage, AuthURL } } = URL;



async function kakaoAuthToken() {
    const authQueryStr = {
        "grant_type": "authorization_code",
        "client_id": `${KAKAO_API_TOKEN}`,
        "redirect_url": "https://localhost:3000",
        "code": KAKAO_TOKEN
    }
    try {
        const res = await axios.post(`${AuthURL}`, authQueryStr,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
                    "Authorization": `Bearer ${KAKAO_API_TOKEN}`
                }
            })
        const recv_accessToken = res.data.access_token;
        const recv_refreshToken = res.data.refresh_token;
        console.log('take a token :: ' + JSON.stringify({ recv_accessToken, recv_refreshToken }))
        return { recv_accessToken, recv_refreshToken }

    } catch (err) {
        const errMsg = err?.response?.data ?
            JSON.stringify(err?.response?.data?.error_description) : err.message;
        console.log(errMsg);
        throw new Error(errMsg)
    };
}



async function refreshKakaoToken({ refresh_token }) {
    const refreshTokenQueryStr = {
        "refresh_token": refresh_token,
        "client_id": `${KAKAO_API_TOKEN}`,
        "grant_type": "refresh_token"
    }
    try {
        const res = await axios.post(`${AuthURL}`, refreshTokenQueryStr,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
                    "Authorization": `Bearer ${KAKAO_API_TOKEN}`
                }
            })
        console.log(res.data)
        const recv_accessToken = res.data.access_token ?? null;
        const recv_refreshToken = res.data.refresh_token ?? refresh_token;

        return { recv_accessToken, recv_refreshToken }

    } catch (err) {
        const errMsg = err?.response?.data ?
            JSON.stringify(err?.response?.data?.error_description) : err.message;
        console.log(errMsg);
        throw new Error(errMsg)
    }
}

async function sendKakaoMsg({ message = "NOT", access_token }) {
    const templateObject = {
        object_type: "text",
        text: message,
        link: {
            web_url: "https://developers.kakao.com",
        },
        button_title: "바로 확인"
    };
    const queryStr = qs.stringify({
        template_object: JSON.stringify(templateObject)
    });

    try {
        const res = await axios.post(`${BaseURL}${SendSelfMessage}`, queryStr,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
                    "Authorization": `Bearer ${access_token}`
                }
            })
        console.log(res.data);
        return res.data
    }
    catch (err) {
        const errMsg = err?.response?.data ?
            JSON.stringify(err?.response?.data?.error_description) : err.message;
        console.log(errMsg);
        throw new Error(errMsg)
    }
}

export {
    kakaoAuthToken,
    sendKakaoMsg,
    refreshKakaoToken
}