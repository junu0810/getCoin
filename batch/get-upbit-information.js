import schedule from 'node-schedule'
import { upReqWithoutParmeter } from '../util/basic-request.js'
import URL from '../util/url-constants.js'

const { upbit: { getAllAccount } } = URL
// const crontab = '* * * * * *';
const crontab = '* * * * * *'
const main = () => {
    schedule.scheduleJob(crontab, async () => {
        const upAxiosWithoutParam = upReqWithoutParmeter()
        // console.log(BaseURL)


        try {
            const test = await upAxiosWithoutParam.get(getAllAccount)
            console.log(test.data)

        } catch (e) {
            console.error(`Get Information Error ${e.message}`)
        }
        return {}
    })
}


(async () => {
    console.log(`[scheduler]get accout information :: ${crontab}`);
    main();
})();