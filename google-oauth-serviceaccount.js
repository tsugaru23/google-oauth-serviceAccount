process.env.TZ = 'UTC';
const request = require('request');
const crypto = require('crypto');
const config = require('nconf');
const fs = require('fs');

const logger = require('./lib/logger');
logger.debug(new Date().toString());

var auth = function(callback) {

    config.argv().env().file({
        file: 'oauth-config.json'
    });
    config.defaults({
        keyFile: "key.pem",
        expiresInMinutes: 60,
        claim:{
             "iss":"yourProjectID@developer.gserviceaccount.com"
            ,"scope":"https://www.googleapis.com/auth/calendar"
            ,"aud":"https://accounts.google.com/o/oauth2/token"
         }
    });
    var keyFile = config.get('keyFile');
    if(!fs.existsSync(keyFile)){
        logger.error("keyFile not found:"+keyFile);
        process.exit(1);
    }

    var jwtHeader = {
        alg: "RS256",
        typ: "JWT"
    };
    var jwtHeaderB64 = base64urlEncode(JSON.stringify(jwtHeader));
    logger.debug("Header:" + jwtHeaderB64);
    //decode
    logger.debug(new Buffer(jwtHeaderB64, 'base64').toString('ascii'));

    // https://developers.google.com/google-apps/calendar/v3/reference/calendars/get
    var iat = Math.floor(new Date().getTime() / 1000);
    var exp = iat + (config.get('expiresInMinutes') * 60);

    var jwtClaim = config.get('claim');
    jwtClaim.exp = exp;
    jwtClaim.iat = iat;

    logger.debug(JSON.stringify(jwtClaim));
    var jwtClaimB64 = base64urlEncode(JSON.stringify(jwtClaim));
    logger.debug("Claim:" + jwtClaimB64);

    var signatureInput = jwtHeaderB64 + '.' + jwtClaimB64;
    logger.debug("Signature Input:" + signatureInput);

    var JWT = null;
    var signature = sign(signatureInput, keyFile);
    logger.debug("Signature:" + signature);

    JWT = signatureInput + '.' + signature;
    logger.debug("JWT:"+JWT);

    request.post({
        url: 'https://accounts.google.com/o/oauth2/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: JWT
        }
    }, function(err, res, body) {
        if (err){
            callback(err, null);
        }else{
            if (res.statusCode == 200) {
                logger.info("STATUS:200");
                callback(err, JSON.parse(body).access_token);
            }else{
                logger.warning('STATUS: ' + res.statusCode);
                logger.debug('HEADERS: ' + JSON.stringify(res.headers));
                logger.error('Response:\n' + body);

                callback(new Error("failed to retrieve an access token"), body);
            }
        }
    });

}

function sign(inStr, keyPath) {

    var key = fs.readFileSync(keyPath);
    if(key.length==0)
        logger.warning("most likely invalid key file: " + keyPath);

    var sig = crypto.createSign('RSA-SHA256').update(inStr).sign(key, 'base64');

    //verification
    var verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(inStr);
    if(verifier.verify(key, sig, 'base64')){
        logger.debug("signature verified with:"+keyPath);
    }else{
        logger.error("signature NOT verified with:"+keyPath);
    }

    return base64urlEscape(sig);
}

function base64urlEncode(str) {
    return base64urlEscape(new Buffer(str).toString('base64'));
}

function base64urlEscape(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

module.exports.auth = auth;
