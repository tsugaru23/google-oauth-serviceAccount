const request = require('request');
const gaccount = require('./google-oauth-serviceaccount');

const calRoot = "https://www.googleapis.com/calendar/v3";

gaccount.auth(function(err, access_token){

	var token = "?access_token="+access_token;

    request.get({
        url:calRoot+"/users/me/calendarList"+token,
        json:true
        }, function(err, res, body){

            if(body.items)
            for(var c=0; c<body.items.length; c++){
                console.log(body.items[c]);

                request.get({
                    url:calRoot+"/calendars/"+body.items[c].id+"/events"+token,
                    json:true
                    }, function(err, res, cal){
                        console.log(cal);
                });
            }
    })
	
});
