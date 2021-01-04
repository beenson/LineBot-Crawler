var linebot = require('linebot');
var express = require('express');

var bot = linebot({
  channelId: '1655539879',
  channelSecret: '4588f1904c142910dfcc7a8fa79fec25',
  channelAccessToken: 'ocCkvl0ipy7Fiw3tMA0nkeux0I82q1MM5vZIBA4PR3dEZKWoA9Yz1rCw9OnJAINKdtyjSiyoRE8L8SaFetDt9Cswr0wXYq52iuxFoGeSeHS+st0jDiomoYFFIHd2za3Fn7fd1qeSVqWMwX4zk0tEowdB04t89/1O/w1cDnyilFU='
});

var request = require("request");
var cheerio = require("cheerio");
var jp = function() {
    request({url: "http://rate.bot.com.tw/Pages/Static/UIP003.zh-TW.htm", method: "GET"}, function(error, response, body) {
        if (error || !body) {
            return
        }else{
            var $ = cheerio.load(body)
            var target = $(".rate-content-sight.text-right.print_hide")
            return target[15].children[0].data.trim()
        // 爬完網頁後要做的事情
        }
    });
};

//這一段的程式是專門處理當有人傳送文字訊息給LineBot時，我們的處理回應
bot.on('message', function(event) {
  if (event.message.type = 'text') {
    var msg = event.message.text;

    axios.get("http://rate.bot.com.tw/Pages/Static/UIP003.zh-TW.htm").then((res) => { 
            var $ = cheerio.load(res.data);
            var target = $(".rate-content-sight.text-right.print_hide");
            data = target[15].children[0].data.trim();
            console.log(data);
            
            //收到文字訊息時，直接把收到的訊息傳回去
              event.reply(msg).then(function(data) {
                // 傳送訊息成功時，可在此寫程式碼 
                console.log(msg);
              }).catch(function(error) {
                // 傳送訊息失敗時，可在此寫程式碼 
                console.log('錯誤產生，錯誤碼：'+error);
              }); })
        .catch((error) => { console.error(error) })
        .finally(() => {  不論失敗成功皆會執行  })
    
  }
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log('目前的port是', port);
});