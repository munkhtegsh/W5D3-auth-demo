require('dotenv').config()
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
//better open .env other side
const { SERVER_PORT, SESSION_SECRET, 
  DOMAIN, CLIENT_ID, CLIENT_SECRET,  
  callback_URL  //put it in Allowed cb URLs your manage.auth0.com website
} = process.env;

const app = express();

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: SESSION_SECRET
}));


// Need two add 2 middleware
app.use(passport.initialize());   // initialing app to be used with passport
app.use(passport.session());      // will allow our session to interact with session, must come after initialize


passport.use(new Auth0Strategy({  // new instance of auth0, 
  domain: DOMAIN,
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: callback_URL,  //redirct user after authentication
  scope: 'openid profile' //when we authenticate it ask profile
}, (accessToken, refreshToken, extraParams, profile, done) => { // if passes get profile etc
  done(null, profile); //done is like next() 
  // profile info straight to serializer
})) 


// after user authenticated, we have access to whatever info has in profile
// someone logs in serializer send passwor
// invoked only one time
passport.serializeUser((profile, done) => { // it will invoked only one time when user logged in
  // on session? the whole use profile from google
  done(null, profile);
}); 


// takes session id from session store (cookie)
// invoked every time user hits end point
passport.deserializeUser((profile, done) => {
  // gets profile info directly from session store
  done(null, profile);
  // whatever is passed out, goes on to req.user !!!
});

app.get('/auth', passport.authenticate('auth0')); //which strategy are you using 
app.get('/auth/callback', passport.authenticate('auth0', {
  successRedirect: 'http://localhost:3000/'
}))


app.listen(SERVER_PORT, () => {
  console.log(`Listening on port: ${SERVER_PORT}`)
});