var linebot = require('linebot');
var express = require('express');
var request = require("request");
var cheerio = require("cheerio");
let axios = require("axios");
var userState = new Map();

let currency = []
let price = []

var bot = linebot({
  channelId: '1655539879',
  channelSecret: '4588f1904c142910dfcc7a8fa79fec25',
  channelAccessToken: 'ocCkvl0ipy7Fiw3tMA0nkeux0I82q1MM5vZIBA4PR3dEZKWoA9Yz1rCw9OnJAINKdtyjSiyoRE8L8SaFetDt9Cswr0wXYq52iuxFoGeSeHS+st0jDiomoYFFIHd2za3Fn7fd1qeSVqWMwX4zk0tEowdB04t89/1O/w1cDnyilFU='
});


async function crawlPrice() {
    let res = await axios.get("http://rate.bot.com.tw/Pages/Static/UIP003.zh-TW.htm");
    var $ = cheerio.load(res.data);
    var cur = $(".visible-phone.print_hide");
    var pri = $(".rate-content-sight.text-right.print_hide");
    cur.each((index, element) => {
        if(element.children.length == 1)
            currency.push(element.children[0].data.trim());
    });
    pri.each((index, element) => {
        if(index % 2 == 0)
            price.push(element.children[0].data.trim());
    });
};

async function listCurrency() {
    await crawlPrice();
    let temp = [];
    currency.forEach((element, index) => {temp.push((index + 1) + '.' + element)})
    return temp.join('\r\n')
}

/*$"OnMessage 訊息事件\n" +
$"類型: {ev.Type.ToString()}\n" +
$"時間: {ev.Timestamp}\n" +
$"來源類型: {ev.Source.Type.ToString()}\n" +
$"頻道 ID: {ev.Source.Id}\n" +
$"用戶 ID: {ev.Source.UserId}");*/
async function reply(event){
    if (event.message.type = 'text') {
        console.log(event.source.userId);
        if(!userState.has(event.source.userId)){}
        
        var msg = event.message.text;

        let data = await listCurrency();
        console.log(data);
        //收到文字訊息時，直接把收到的訊息傳回去
        event.reply(data).then(function(data) {
            // 傳送訊息成功時，可在此寫程式碼 
            console.log(data);
        }).catch(function(error) {
            // 傳送訊息失敗時，可在此寫程式碼 
            console.log('錯誤產生，錯誤碼：'+error);
        });

        /*
        await axios.get("https://rate.bot.com.tw/xrt?Lang=zh-TW").then((res) => { 
                var $ = cheerio.load(res.data);
                var target = $(".rate-content-sight.text-right.print_hide");
                data = target[15].children[0].data.trim();

                //收到文字訊息時，直接把收到的訊息傳回去
                event.reply(data).then(function(data) {
                    // 傳送訊息成功時，可在此寫程式碼 
                    console.log(data);
                }).catch(function(error) {
                    // 傳送訊息失敗時，可在此寫程式碼 
                    console.log('錯誤產生，錯誤碼：'+error);
                });})
            .catch((error) => { console.error(error) })
            .finally(() => {  /*不論失敗成功皆會執行  })*/
      
    }
}

//這一段的程式是專門處理當有人傳送文字訊息給LineBot時，我們的處理回應
bot.on('message', reply);

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log('目前的port是', port);
});