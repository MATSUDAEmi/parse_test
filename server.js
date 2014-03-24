var http = require('http');
var url = require('url');
var fs = require('fs');

var server = http.createServer();
server.on('request',function(req,res){

    var pathname = url.parse(req.url).pathname;
    var str = pathname.split('/')[1];
    switch(str){
        case 'setting':
            fs.readFile(__dirname + '/'+ str +'/index.html', 'utf-8',function(err,data){
                if(err){
                    res.writeHead(404, {
                        'Content-Type':'text/plain'
                    });
                    res.write('not found!' + err);
                    // res.write(err);
                    return res.end();
                }
                res.writeHead(200, {
                    'Content-Type':'text/html'
                });
                res.write(data);
                res.end();
            })
            break;
        case 'report':
        console.log('test')
            fs.readFile(__dirname + '/' + str + '/index.html', 'utf-8', function(err,data){
                if(err){
                    res.writeHead(404, {'Content-Type':'text/plain'});
                    res.write('not found!' + err);
                    return res.end();
                }

                var hash = url.href;
                // console.log(url.parse(req.url).href);
                // var useId = hash.toString().split('#')[1]
                // console.log(useId)
                var https = require('https');
                var reqOptions = {
                    host: 'api.parse.com',
                    path: '/1/classes/UserData?where={"userId":"2323"}',
                    headers: {
                        'Content-Type' : 'application/json',
                        'X-Parse-Application-Id': 'AWGwqZGRVAyHP3TEwSKBG5FuoB08saavcJjxLuoM',
                        'X-Parse-REST-API-Key': '8jeYFitqu11bIhbKoaiNrOm2Usm2K9BEXEKetiuo'
                    },
                    method: 'get'
                }

        console.log('test2')
                var dataReqest = https.request(reqOptions, function(response){
                    response.setEncoding('utf8');
                    response.on('data', function (data) {

                        var parsedData = JSON.parse(data)
                        var setData = parsedData.results;
        console.log(setData)
                        for (var i = 0; i < setData.length; i++) {
                            console.log(setData[i])
                        };
                    });
                })
                
                dataReqest.on('error', function(e) {
                  console.log('problem with request: ' + e.message);
                });
                dataReqest.end();

                res.writeHead(200, {
                    'Content-Type':'text/html'
                });
                res.write(data);
                res.end();
            })
            break;

        default :
        fs.readFile(__dirname + '/index.html', 'utf-8',function(err,data){
            if(err){
                res.writeHead(404, {
                    'Content-Type':'text/plain'
                });
                res.write('not found!' + err);
                // res.write(err);
                return res.end();
            }
            res.writeHead(200, {
                'Content-Type':'text/html'
            });
            res.write(data);
            res.end();
        })
    }
})
server.listen(3000);
console.log('server listening...')
