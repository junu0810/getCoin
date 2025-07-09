import jwt from 'jsonwebtoken'
import { uuid } from 'uuidv4';
import dotenv from "dotenv";
import crypto from 'crypto'
import querystring from 'querystring'
import axios from 'axios'
import URL from '../util/url-constants.js'

dotenv.config();
const { upbit: { BaseURL } } = URL

const {
    SECRET_KEY: secretKey,
    ACCESS_KEY: accessKey
} = process.env

/**
 * @description parameter 없는 방식의 업비트 요청
 * @returns Axios1
 */
const upReqWithoutParmeter = (() => {
    const payload = {
        access_key: accessKey,
        nonce: uuid(),
    };

    const jwtToken = jwt.sign(payload, secretKey);
    const authorizationToken = `Bearer ${jwtToken}`;

    return axios.create({
        baseURL: BaseURL,
        timeout: 3000,
        headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
            "Authorization": authorizationToken
        },
        responseType: "json",
    });
})

/**
 * @description parameter 있는 방식의 업비트 요청
 * @returns Axios
 */
const upReqWithParmeter = (({ param }) => {
    const query = querystring.queryEncode({ param });
    const hash = crypto.createHash('sha512');
    const queryHash = hash.update(query, 'utf-8').digest('hex');

    const payload = {
        access_key: "발급받은 Access key",
        nonce: uuid(),
        query_hash: queryHash,
        query_hash_alg: 'SHA512',
    };

    const jwtToken = jwt.sign(payload, "발급받은 Secret key");
    const authorizationToken = `Bearer ${jwtToken}`;

    return axios.create({
        baseURL: BaseURL,
        timeout: 3000,
        headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
            "Authorization": authorizationToken
        },
        responseType: "json",
    });
})

export { upReqWithParmeter, upReqWithoutParmeter }
