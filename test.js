const gaccount = require('./lib/google-oauth-serviceAccount');

gaccount.auth(function(err, access_token){
    if(err)throw err;

	console.log('token:'+access_token);
});
