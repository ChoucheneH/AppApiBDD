var request = require("request"),
    http  = require("http");
var couchbase = require("couchbase");
var myCluster = new couchbase.Cluster('couchbase://50.18.195.132');
var myBucket = myCluster.openBucket('default');
var symbols = ["AAPL", "SPY"];

var url = "https://api.stocktwits.com/api/2/streams/symbol/AAPL.json";

function processSymbol(symbol){
    url = "https://api.stocktwits.com/api/2/streams/symbol/" + symbol +".json";
    console.log(url);
    request({
        url: url,
        json: true
    }, function (errors, response, body) {
        if(errors) console.log(errors);
        if(response.status == 429) console.log("Rate limit exceeded. Client may not make more than N requests an hour.");
        if(body.response.status == 200) 
        {
            var messages = body.messages;
            for (i = 0; i < messages.length; i++){
                var messageId = messages[i].id.toString();
                var message = messages[i];
                message['symbols'] = symbol;
                console.log("symbol : "+symbol+" id : "+messageId);
                
                /*myBucket.upsert(messageId, message, function (err, res){
                    if (err) { return console.error(err) };
                });*/
                //console.log("Processing ", messageId);
            }
        }
    });
}

function startProcess(){
    for (i = 0; i < symbols.length; i++) {
        console.log("Processing: ", symbols[i], Date.now());
        processSymbol(symbols[i]);
    }
}

(function() {
  var c = 0;
  var timeout = setInterval(function() {
    startProcess();
    c++;
    if (c > 2) {
      clearInterval(timeout);
    }
  }, 5000); // 1 minute
})();


//process.exit(1);



