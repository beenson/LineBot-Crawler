let axios = require("axios");
let request = require("request");

/**
 * 取得天氣資訊
 * 
 * @param {string} location 城市名稱
 * @param {number} days     從今天開始取幾天(Max:一周)
 * @returns {object} 結果
 */
async function getData(location, days) {
    //處理日期
    let today = new Date();
    let targetDay = new Date();
    targetDay.setDate(targetDay.getDate() + days);
    targetDay.setHours(23);// 避免當天兩筆沒全部取到

    let req = await axios.get('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-091', { 
        params: { 
            Authorization: 'CWB-E677A3BA-BAFF-460F-84DB-08211D230139' , // 授權碼
            format: "JSON",
            locationName: location, // 城市
            timeFrom: parseDateToAPIString(today), // yyyy-MM-ddThh:mm:ss
            timeTo: parseDateToAPIString(targetDay), // yyyy-MM-ddThh:mm:ss
        }
        
    });
    return req;
}

/**
 * 解析天氣資訊
 * 
 * @param {string} location 城市名稱
 * @param {number} days     從今天開始取幾天(Max:一周)
 * @returns {object} 結果
 */
async function getWeather(location, days) {
    let res = await getData(location, days);// call API
    
    //console.log(res.data); // 印出全部
    result = {}; // 取結果
    res.data.records.locations[0].location.forEach((locate) => { // locations[0] 是指台灣
        let name = locate.locationName; // 城市
        let geocode = locate.geocode; // 地理編號
        let weathers = locate.weatherElement; // 天氣因子
        //console.log(name);
        weathers.forEach((el) => {
            let elementName = el.elementName;
            let description = el.description;
            let times = el.time;
            //console.log(elementName, description);
            /**
             *  PoP12h 12小時降雨機率
                T 平均溫度
                RH 平均相對濕度
                MinCI 最小舒適度指數
                WS 最大風速
                MaxAT 最高體感溫度
                Wx 天氣現象
                MaxCI 最大舒適度指數
                MinT 最低溫度
                UVI 紫外線指數
                WeatherDescription 天氣預報綜合描述
                MinAT 最低體感溫度
                MaxT 最高溫度
                WD 風向
                Td 平均露點溫度
             */
            times.forEach(time => {
                //console.log(time)
                let start = time.startTime;
                let end = time.endTime;
                let value = time.elementValue[0].value; // 值
                let measures = time.elementValue[0].measures; // 單位
                let sdate = new Date(start);
                let edate = new Date(end);
                //console.log(sdate, edate);
                
                if (!result[name]) {
                    result[name] = {};
                }
                if (!result[name][start]) {
                    result[name][start] = {};
                }
                result[name][start][description] = value;
                //console.log(value, measures);
            });
        });
    });

    console.log(result);
    return result;
}

/**
 * 轉換日期字串
 * @param {Date} date 
 * 
 * @returns {String}
 */
function parseDateToAPIString(date) {//yyyy-MM-ddThh:mm:ss
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let d = date.getDate();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();

    month = month<10 ? `0${month}` : month;
    d = d<10 ? `0${d}` : d;
    h = h<10 ? `0${h}` : h;
    m = m<10 ? `0${m}` : m;
    s = s<10 ? `0${s}` : s;

    return `${year}-${month}-${d}T${h}:${m}:${s}`;
}


locationNames = ["宜蘭縣", "花蓮縣", "臺東縣", "澎湖縣", "金門縣", "連江縣", "臺北市", "新北市", "桃園市", "臺中市", "臺南市", "高雄市", "基隆市", "新竹縣", "新竹市", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義縣", "嘉義市", "屏東縣"];
getWeather([locationNames[8], locationNames[4]].toString(), 3);