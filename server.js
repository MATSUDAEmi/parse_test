var http = require('http');
var url = require('url');
var fs = require('fs');
var nodemailer = require('nodemailer');
var settings = require('./settings');

var server = http.createServer();
server.on('request',function(req,res){

    var pathname = url.parse(req.url).pathname;
    var str = pathname.split('/')[1];
    switch(str){
        case 'setting':
            fs.readFile(__dirname + '/public_html/'+ str +'/index.html', 'utf-8',function(err,data){
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
            fs.readFile(__dirname + '/public_html/' + str + '/index.html', 'utf-8', function(err,data){
                if(err){
                    res.writeHead(404, {'Content-Type':'text/plain'});
                    res.write('not found!:' + err);
                    return res.end();
                }
                //Parseのデータを取って来る。
                var useId = url.parse(req.url).query.split('=')[1];
                var https = require('https');
                var reqOptions = {
                    host: 'api.parse.com',
                    path: '/1/classes/UserData?where={"userId":"' + useId + '"}',
                    headers: {
                        'Content-Type' : 'application/json',
                        'X-Parse-Application-Id': settings.parseAppId,
                        'X-Parse-REST-API-Key': settings.parseRestKey
                    },
                    method: 'get'
                }
                // var ids = {};
                var dataReqest = https.request(reqOptions, function(response){
                    response.setEncoding('utf8');
                    response.on('data', function (data) {
                        var reportTime = new Date();
                        var parsedData = JSON.parse(data)
                        var setData = parsedData.results;
                        //メール送る。
                        var transport = nodemailer.createTransport('SMTP', {
                            host: settings.mailHost,
                            secureConnection: true,
                            port: settings.mailPort,
                            auth: {
                                user: settings.mailSenderAdd,
                                pass: settings.mailSenderPass
                            }
                        });
                        var msg = {
                            from: settings.mailFrom,
                            to: setData[0].contactMail,
                            subject: setData[0].userName + settings.mailSubject,
                            text: setData[0].userName + settings.mailText0 + /\n/ 
                                + reportTime.getHours() + ':' + reportTime.getMinutes() + '.' + reportTime.getSeconds() + /\n/ 
                                + settings.mailText1
                        };
                        /*ids = {//非同期だから後からとってこれない。
                            'id': setData[0].objectId,
                            'address' : setData[0].address,
                            'geoCodeLat': setData[0].geoCodeLat,
                            'geoCodeLong': setData[0].geoCodeLong
                        };*/
                        // console.log('inline: ' + ids)
                        transport.sendMail(msg, function(error){
                            if (error) {
                                console.log('送信失敗');
                            }
                            else {
                                console.log('送信終了');
                            }
                            msg.transport.close();
                        });
                        //オブジェクトを新クラスにコピーする。のは、別でとるべき？そもそもちょっと変える？親子がNG？
                    });
                })
                
                dataReqest.on('error', function(e) {
                  console.log('problem with request(dataRequest): ' + e.message);
                });
                dataReqest.end();
/*
                var postOptions = {
                    host: 'api.parse.com',
                    path: '/1/classes/' + settings.createClass,
                    headers: {
                        'Content-Type' : 'application/json',
                        'X-Parse-Application-Id': settings.parseAppId,
                        'X-Parse-REST-API-Key': settings.parseRestKey
                    },
                    method: 'post'//,
                    // body: ids
                }
                // console.log(ids)
                var postRequest = https.request(postOptions, function(response){
                    response.setEncoding('utf8');
                    response.on('data', function (data) {
                        console.log(data);
                    })
                })
                postRequest.on('error',function(e){
                  console.log('problem with request(postRequest): ' + e.message);
                })
                // postRequest.write('')
                postRequest.end({
                    'id': setData[0].objectId,
                    'address' : setData[0].address,
                    'geoCodeLat': setData[0].geoCodeLat,
                    'geoCodeLong': setData[0].geoCodeLong
                });
*/

                res.writeHead(200, {
                    'Content-Type':'text/html'
                });
                res.write(data);
                res.end();
            })
            break;

        default :
        fs.readFile(__dirname + '/public_html/index.html', 'utf-8',function(err,data){
            if(err){
                res.writeHead(404, {
                    'Content-Type':'text/plain'
                });
                res.write('not found!: ' + err);
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
server.listen(settings.port);
console.log('server listening...')
