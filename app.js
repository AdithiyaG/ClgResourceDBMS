const express = require('express');

const methodOverride =require('method-override');
const routes =require('./routes');
const authapp=require('./auth');
const app = express();
const flash = require('connect-flash');
const session = require('express-session');
const path = require("path");
const passport = require('passport');

// Passport Config
require('./config/passport')(passport);
//Middleware
app.use(methodOverride('_method'));
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);
app.use(flash());

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: false }));
app.set('view engine','ejs');
app.use("/js", express.static(path.join(".", "js/")))
app.use("/css", express.static(path.join(".", "css/")))
app.use('/', routes);
app.use('/',authapp);
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Server listening in port ${PORT}`));
