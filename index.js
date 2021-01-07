var linebot = require('linebot');
var express = require('express');
var request = require("request");
var cheerio = require("cheerio");
let axios = require("axios");
var userState = new Map();
//0 : Request
//1 : Asking Currency
//2 : Asking Weather(Location)
//3 : Asking Stocks

let errMsg = '輸入錯誤!';

let currency = [];
let currList = '';
let price = [];

let locationNames = ["宜蘭縣", "花蓮縣", "臺東縣", "澎湖縣", "金門縣", "連江縣", "臺北市", "新北市", "桃園市", "臺中市", "臺南市", "高雄市", "基隆市", "新竹縣", "新竹市", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義縣", "嘉義市", "屏東縣"];
let locList = '';

var bot = linebot({
  channelId: '1655539879',
  channelSecret: '4588f1904c142910dfcc7a8fa79fec25',
  channelAccessToken: 'ocCkvl0ipy7Fiw3tMA0nkeux0I82q1MM5vZIBA4PR3dEZKWoA9Yz1rCw9OnJAINKdtyjSiyoRE8L8SaFetDt9Cswr0wXYq52iuxFoGeSeHS+st0jDiomoYFFIHd2za3Fn7fd1qeSVqWMwX4zk0tEowdB04t89/1O/w1cDnyilFU='
});


async function getData(location) {
    let req = await axios.get('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-091', { 
        params: { 
            Authorization: 'CWB-E677A3BA-BAFF-460F-84DB-08211D230139' , // 授權碼
            format: "JSON",
            locationName: location, // 城市
            elementName : "WeatherDescription"
        }
    });
    return req;
}

async function getWeather(input) {
    let i = await contain(input, locationNames);
    if(!isNaN(input)) {i = parseInt(input) - 1;}

    if(i != -1) {
        let res = await getData(locationNames[i]);// call API
        return locationNames[i] + '天氣:\r\n' + res.data.records.locations[0].location[0].weatherElement[0].time[0].elementValue[0].value.replace(/。/g, '\r\n');
    }
    return errMsg;
}

async function listLocations(){
    if(locList == '') {
        let temp = [];
        locationNames.forEach((element, index) => {
            temp.push((index + 1) + '.' + element);
        });
        locList = temp.join('\r\n');
    }
    return locList;
}

async function crawlPrice() {
    let res = await axios.get("http://rate.bot.com.tw/Pages/Static/UIP003.zh-TW.htm");
    if(currList == '') {
        let temp1 = [], temp2 = [];
        var cur = cheerio.load(res.data)(".visible-phone.print_hide");
        cur.each((index, element) => {
            if(element.children.length == 1)
                temp1.push(element.children[0].data.trim());
        });

        temp1.forEach((element, index) => {
            temp2.push((index + 1) + '.' + element);
            
            let spli = element.split(' ');
            currency.push(spli[0]);
            currency.push(spli[1].substring(1, 4));
        });
        currList = temp2.join('\r\n');
    }

    price = [];
    var pri = cheerio.load(res.data)(".rate-content-sight.text-right.print_hide");
    pri.each((index, element) => {
        if(index % 2 == 0)
            price.push(element.children[0].data.trim());
    });
};

async function listCurrency() {
    if(currList == '')
        await crawlPrice();
    return currList;
}

async function askCurrency(input) {
    await crawlPrice();
    let i = Math.floor(await contain(input, currency) / 2);
    if(!isNaN(input)) {i = parseInt(input) - 1;}
    if(i != -1)
        return `${currency[i]}(${currency[i + 1]})匯率: ${price[i]}`;
    return errMsg;
}

async function contain(txt, arr) {
    txt = txt.replace(/台/g, '臺');
    let index = -1;
    arr.forEach((e, i) => {
        if(txt.includes(e)){
            index = i;
        }
    });
    return index;
}

//https://developers.line.biz/en/reference/messaging-api/#message-event
async function reply(event){
    if (event.message.type = 'text') {
        let startTime = Date.now();
        let userId = event.source.userId;
        console.log(userId);
        if(!userState.has(userId)) {userState.set(userId, 0);}
        
        let state = userState.get(userId);
        let rec = event.message.text;
        let msg = '';
        switch(state) {
            case 0:
                if(await contain(rec, currency) != -1) {
                    msg = await askCurrency(rec);
                    break;
                }

                if(rec.includes('匯率')) {
                    msg = await listCurrency();
                    userState.set(userId, 1);
                    break;
                }

                if(await contain(rec, locationNames) != -1) {
                    msg = await getWeather(rec);
                    break;
                }

                if(rec.includes('天氣')) {
                    msg = "請選擇縣市:\r\n" + await listLocations();
                    userState.set(userId, 2);
                    break;
                }
                break;
            case 1:
                msg = await askCurrency(rec);
                userState.set(userId, 0);
                break;
            case 2:
                msg = await getWeather(rec);
                userState.set(userId, 0);
                break;
        }

        if(msg == '') {
            msg = "What are you talking about???";
        }

        console.log(msg);

        event.reply(msg)
            .then(function(msg) {console.log(msg);})
            .catch(function(error) {console.log('錯誤產生，錯誤碼：'+error);});

        console.log(userState);
        let endTime = Date.now();
        console.log(String(endTime - startTime) + ' milliseconds');
    }
}

crawlPrice();

//這一段的程式是專門處理當有人傳送文字訊息給LineBot時，我們的處理回應
bot.on('message', reply);

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

var server = app.listen(process.env.PORT || 8080, function() {
    var port = server.address().port;
    console.log('目前的port是', port);
});