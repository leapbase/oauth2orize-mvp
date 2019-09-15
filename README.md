# oauth2orize-mvp

MVP for running oauth2orize SSO/OAuth2 server and client.

oauth2orize consumer is forked from:

https://git.daplie.com/coolaj86/example-oauth2orize-consumer

oauth2orize server is forked from:

https://github.com/awais786327/oauth2orize-examples


# Get Started

Setup local domain name, add the following in hosts file on your local computer

```
## sso test
127.0.0.1    local.helloworld3000.com
127.0.0.1    local.foobar3000.com
```

Run oauth2orize SSO server

```
cd oauth2orize-server-example/

npm install

./start
```

Run oauth2orize SSO client
```
cd oauth2orize-consumer-example/

npm install

./start
```

Open in browser and visit:

http://local.helloworld3000.com:3002

Web browser will redirect to:

http://local.helloworld3000.com:3002/auth/example-oauth2orize

If user is not authorized, sso login will open:

http://local.foobar3000.com:3000/login

After user login, browser will redirect to success page:

http://local.helloworld3000.com:3002/success.html
```

