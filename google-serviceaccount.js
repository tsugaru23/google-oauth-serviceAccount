process.env.TZ = 'UTC';
//console.log(new Date().toString());
const request = require('request');
const crypto = require('crypto');
const config = require('nconf');
const fs = require('fs');

var auth = function(callback){

config.argv()
	.env()
	.file({file: 'config.json'});
config.defaults({
	keyFile: "key.pem"
	,expiresInMinutes: 60
});
var keyFile = config.get('keyFile');

var jwtHeader = {alg:"RS256",typ:"JWT"};
var jwtHeaderB64 = base64urlEncode(JSON.stringify(jwtHeader));
//console.log("Header:\n" + jwtHeaderB64);
//decode
//console.log(new Buffer(jwtHeaderB64, 'base64').toString('ascii'));

// https://developers.google.com/google-apps/calendar/v3/reference/calendars/get
var iat = Math.floor(new Date().getTime() / 1000);
var exp = iat + (config.get('expiresInMinutes') * 60);

var jwtClaim = config.get('claim');
jwtClaim.exp = exp;
jwtClaim.iat = iat;

//console.log(JSON.stringify(jwtClaim));
var jwtClaimB64 = base64urlEncode(JSON.stringify(jwtClaim));
//console.log("Claim:\n" + jwtClaimB64);

var signatureInput = jwtHeaderB64 + '.' + jwtClaimB64;
//console.log("Signature Input:\n" + signatureInput);

var signature = sign(signatureInput, fs.readFileSync(keyFile));
//console.log("Signature:\n" + signature);

var JWT = signatureInput + '.' + signature;
//console.log("JWT:\n"+JWT);

request.post({
    url: 'https://accounts.google.com/o/oauth2/token',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    form:{
        grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion:JWT
    }
}, function(err, res, body) {
    if(err) throw err;

    if(res.statusCode != 200){
    	console.log('STATUS: ' + res.statusCode);
    	//console.log('HEADERS: ' + JSON.stringify(res.headers));

    	console.log('Response:\n' + body);
	throw "failed to retrieve an access token";
    }

    callback(err, JSON.parse(body).access_token);
});

}

function sign(inStr, key){

    var sig = crypto.createSign('RSA-SHA256')
        .update(inStr)
        .sign(key, 'base64');

   //verification
    var verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(inStr);
    //console.log("verify:" + verifier.verify(key, sig, 'base64'));

    return base64urlEscape(sig);
}

function base64urlEncode(str) {
  return base64urlEscape(new Buffer(str).toString('base64'));
}

function base64urlEscape(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

module.exports.auth = auth;
