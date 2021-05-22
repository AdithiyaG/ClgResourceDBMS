const express               =  require('express'),
      authapp                   =  express(),
      mongoose2              =  require("mongoose"),
      passport              =  require("passport"),
      LocalStrategy         =  require("passport-local"),
      passportLocalMongoose =  require("passport-local-mongoose"),
      User                  =  require("./models/user");

const mongoURIauth='mongodb+srv://admin:admin@clgfilesystem.wmbwk.mongodb.net/users?retryWrites=true&w=majority';

mongoose2.createConnection(mongoURIauth, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
    .then(() => {
          console.log("MongoDBauth Connected…");
    })
    .catch(err => console.log(err));

    authapp.use(require("express-session")({
        secret:"Any normal Word",       //decode or encode session
        resave: false,          
        saveUninitialized:false    
    }));
    passport.serializeUser(User.serializeUser());       //session encoding
    passport.deserializeUser(User.deserializeUser());   //session decoding
    passport.use(new LocalStrategy(User.authenticate()));


    authapp.use(passport.initialize());
    authapp.use(passport.session());
    //=======================
    //      R O U T E S
    //=======================

    authapp.get("/userprofile",isLoggedIn ,(req,res) =>{
        res.render("userprofile");
    })
    //Auth Routes
    authapp.get("/login",(req,res)=>{
        res.render("login");
    });
    authapp.post("/login",passport.authenticate("local",{
        successRedirect:"/userprofile",
        failureRedirect:"/login"
    }),function (req, res){
    });
    authapp.get("/register",(req,res)=>{
        res.render("register");
    });
    authapp.post("/register",(req,res)=>{
        
        User.register(new User({username: req.body.username,phone:req.body.phone,telephone: req.body.telephone}),req.body.password,function(err,user){
            if(err){
                console.log(err);
                res.render("register");
            }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/login");
        })    
        })
    })
    authapp.get("/logout",(req,res)=>{
        req.logout();
        res.redirect("/login");
    });
    function isLoggedIn(req,res,next) {
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect("/login");
    }

    module.exports=authapp;