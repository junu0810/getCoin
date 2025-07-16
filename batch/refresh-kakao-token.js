import schedule from 'node-schedule'
import axios from 'axios'



const crontab = '*/2 * * * * *'
// const crontab = '0 */3 * * *'
const main = () => {
    schedule.scheduleJob(crontab, async () => {
        console.log('refresh Token :: ')
        try {
            const response = await axios.get('http://localhost:3000/refresh/token');
            console.log('response data:', response.data);
        } catch (error) {
            console.error('fail data', error.message);
        }
    })
}


(async () => {
    console.log(`[scheduler]get refresh Kakao Token :: ${crontab}`);
    main();
})();