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

                var dataReqest = https.request(reqOptions, function(response){
                    response.setEncoding('utf8');
                    response.on('data', function (data) {
                        var reportTime = new Date();
                        var parsedData = JSON.parse(data)
                        var setData = parsedData.results;
                         console.log(setData[0].contactMail)
                        var transport = nodemailer.createTransport('SMTP', {
                            host: settings.mailHost,
                            secureConnection: true,
                            port: settings.mailPort,
                            auth: {
                                user: settings.mailSenderAdd,
                                pass: settings.mailSenderPass,
                            }
                        });

                        var msg = {
                            from: settings.mailFrom,
                            to: setData[0].contactMail,
                            subject: setData[0].userName + settings.mailSubject,
                            text: setData[0].userName + settings.mailText0 + /\n/
                                + reportTime.getHours() + ':' + reportTime.getMinutes() + '.' + reportTime.getSeconds() + /\n/
                                + settings.mailText1;
                        };

                        transport.sendMail(msg, function(error){
                            if (error) {
                                console.log('送信失敗');
                            }
                            else {
                                console.log('送信終了');
                            }
                            msg.transport.close();
                        });
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
