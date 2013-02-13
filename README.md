google-oauth-serviceaccount
==========================
Motivation:
------------------------

Wanted to accesss my personal calendar, NOT the one of Google Apps, and found no good example for node.js with [service account][3] without any interaction.

Install:
------------------------

    npm install google-oauth-serviceaccount

Preparation:
------------------------
1.  Create your service account and enable calendar access(thanks to [this post][1]):
<pre>
>    a) Log in into the Google account you want to use to manage your projects.
>    b) Go to https://code.google.com/apis/console/
>    c) Create a project. You will get issued a project number, in our example
>    we'll use 99999999999.
>    d) Allow the project to use the calendar API:
>    -> services (left pane), then find 'calendar api' and set the button 'on'
>    e) Create a Service Account.
>    -> API access (left pane); select 'create service account'
>    Part of the procedure is that you'll get a PKCS#12 bundle, which you can
>    download and should store on your appserver in a secure location. Your
>    app should be able to access it, but outsiders should not be allowed to
>    download it.
</pre>
2.  Store the p12 file into pem with openssl(thank [this][2])

    $ openssl pkcs12 -in yourkey.p12 -out yourkey.pem -nodes<br/>
    type "notasecret" for password.

3.  Share the calendar with your developer account

    Calendar "Settings" -> "Share this calendar", at "Share with specific people",
    put the email address of developer account choosing a permission you want, then "add person".
    The address should be like "yourProjectId@developer.gserviceaccount.com".

4.  Edit oahtu-config.json and place key.pem which generated in step 2.
<pre>
    {
     "keyFile": "key.pem"
    ,"expiresInMinuteas": 60
    ,"claim":{
    	 "iss":"yourProjectID@developer.gserviceaccount.com"
    	,"scope":"https://www.googleapis.com/auth/calendar"
    	,"aud":"https://accounts.google.com/o/oauth2/token"
     }
    }
</pre>

5.  Test with test.js.

    if successfull, you'll see an access token:
    <pre>token:ya29.AHES6ZSfxRWLEv9vfusipvawSS-55oQyMAGxF3kbRGsgGMTo</pre>

6.  Enjoy with [calendar APIs][4]. You may try listEvents.js.

[1]: https://groups.google.com/forum/?fromgroups=#!topic/google-calendar-api/MySzyAXq12Q
[2]: http://stackoverflow.com/questions/11529595/is-a-service-account-the-right-credentials-for-querying-google-bigquery-in-node
[3]: https://developers.google.com/accounts/docs/OAuth2ServiceAccount
[4]: https://developers.google.com/google-apps/calendar/v3/reference

Usage example:
------------------------
`````javascript
const request = require('request');
const gaccount = require('./google-oauth-serviceaccount');

const calRoot = "https://www.googleapis.com/calendar/v3";

gaccount.auth(function(err, access_token){

    var token = "?access_token="+access_token;

    request.get({
        url:calRoot+"/users/me/calendarList"+token,
        json:true
        }, function(err, res, body){

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
`````
