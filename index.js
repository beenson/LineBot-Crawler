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
let price = [];

var bot = linebot({
  channelId: '1655539879',
  channelSecret: '4588f1904c142910dfcc7a8fa79fec25',
  channelAccessToken: 'ocCkvl0ipy7Fiw3tMA0nkeux0I82q1MM5vZIBA4PR3dEZKWoA9Yz1rCw9OnJAINKdtyjSiyoRE8L8SaFetDt9Cswr0wXYq52iuxFoGeSeHS+st0jDiomoYFFIHd2za3Fn7fd1qeSVqWMwX4zk0tEowdB04t89/1O/w1cDnyilFU='
});


async function crawlPrice() {
    let res = await axios.get("http://rate.bot.com.tw/Pages/Static/UIP003.zh-TW.htm");
    var $ = cheerio.load(res.data);
    if(currList == '') {
        let temp1 = [], temp2 = [];
        var cur = $(".visible-phone.print_hide");
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
    let i = await contain(input, currency);
    if(Number.isInteger(input)) {i = parseInt(input);}
    if(i != -1)
        return price[i];
    else
        return "輸入錯誤!";
}

async function contain(txt, arr) {
    let index = -1;
    arr.forEach((e, i) => {
        if(txt.includes(e)){
            index = Math.floor(i / 2);
        }
    });
    return index;
}

async function reply(event){
    if (event.message.type = 'text') {
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
                break;
            case 1:
                msg = await askCurrency(rec);
                userState.set(userId, 0);
                break;
        }

        console.log(price);
        console.log(msg);

        if(msg == '') {
            msg = "What are you talking about???";
        }

        event.reply(msg)
            .then(function(msg) {console.log(msg);})
            .catch(function(error) {console.log('錯誤產生，錯誤碼：'+error);});
        console.log(userState);
    }
}
/*{
  type: 'message',
  replyToken: '71508909ef9a4e79b92954bfc8da0862',
  source: {
    userId: 'U9d5868633c1febd1db045277e64726cc',
    type: 'user',
    profile: [Function],
    member: [Function]
  },
  timestamp: 1609857295470,
  mode: 'active',
  message: {
    type: 'text',
    id: '13329988909525',
    text: '.',
    content: [Function]
  },
  reply: [Function]
}*/

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