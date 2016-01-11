var request = require("request"),
    http  = require("http");
var couchbase = require("couchbase");
var myCluster = new couchbase.Cluster('couchbase://50.18.195.132');
var myBucket = myCluster.openBucket('default');
var symbols = ["AAPL", "SPY"];

var url = "https://api.stocktwits.com/api/2/streams/symbol/AAPL.json";

function processSymbol(symbol){
    url = "https://api.stocktwits.com/api/2/streams/symbol/" + symbol +".json";
    
    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if(error) throw error;
        if(response) console.log(response);
        var messages = body.messages;
        for (i = 0; i < messages.length; i++){
            var messageId = messages[i].id.toString();
            var message = messages[i];
            message['symbol'] = symbol;
            console.log("symbol : "+symbol+" id : "+messageId+" mes : ");
            console.log(message);
            myBucket.upsert(messageId, message, function (err, res){
                if (err) { return console.error(err) };
            });
            //console.log("Processing ", messageId);
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
  }, 40000);
})();


//process.exit(1);



