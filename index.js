var linebot = require('linebot');
var express = require('express');
var request = require("request");
var cheerio = require("cheerio");
let axios = require("axios");
var userState = new Map();
//0 : Request
//1 : Asking Currency
//2 : Asking Weather
//3 : Asking Stocks

let currency = [];
let currList = '';
let currMap = new Map();
let price = [];

var bot = linebot({
  channelId: '1655539879',
  channelSecret: '4588f1904c142910dfcc7a8fa79fec25',
  channelAccessToken: 'ocCkvl0ipy7Fiw3tMA0nkeux0I82q1MM5vZIBA4PR3dEZKWoA9Yz1rCw9OnJAINKdtyjSiyoRE8L8SaFetDt9Cswr0wXYq52iuxFoGeSeHS+st0jDiomoYFFIHd2za3Fn7fd1qeSVqWMwX4zk0tEowdB04t89/1O/w1cDnyilFU='
});


async function crawlPrice() {
    let res = await axios.get("http://rate.bot.com.tw/Pages/Static/UIP003.zh-TW.htm");
    var $ = cheerio.load(res.data);
    if(currency.length == 0) {
        var cur = $(".visible-phone.print_hide");
        cur.each((index, element) => {
            if(element.children.length == 1)
                currency.push(element.children[0].data.trim());
        });

        let temp = [];
        currency.forEach((element, index) => {
            temp.push((index + 1) + '.' + element);
            
            let spli = element.split(' ');
            currMap.set(spli[0], index);
            currMap.set(spli[1].substring(1, 4), index);
        });
        currList = temp.join('\r\n');
        console.log(currMap);
    }

    price = [];
    var pri = $(".rate-content-sight.text-right.print_hide");
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
    let i = -1;
    if(Number.isInteger(input)) {i = parseInt(input);}
    if(currMap.has(input)) {i = currMap.get(input);}
    if(i != -1)
        return price[i];
    else
        return "輸入錯誤!";
}

/*$"OnMessage 訊息事件\n" +
$"類型: {ev.Type.ToString()}\n" +
$"時間: {ev.Timestamp}\n" +
$"來源類型: {ev.Source.Type.ToString()}\n" +
$"頻道 ID: {ev.Source.Id}\n" +
$"用戶 ID: {ev.Source.UserId}");*/
async function reply(event){
    if (event.message.type = 'text') {
        let userId = event.source.userId;
        console.log(userId);
        if(!userState.has(userId)) {userState.set(userId, 0);}
        
        let state = userState.get(userId);
        let msg;
        switch(state) {
            case 0:
                msg = await listCurrency();
                userState.set(userId, 1);
                break;
            case 1:
                msg = await askCurrency(event.message.text);
                userState.set(userId, 0);
                break;
        }

        if(msg != "") {
            event.reply(msg)
                .then(function(msg) {console.log(msg);})
                .catch(function(error) {console.log('錯誤產生，錯誤碼：'+error);}); 
            console.log(userState);
        }else {

        }     
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