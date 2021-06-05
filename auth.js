const express               =  require('express'),
      authapp                   =  express(),
      mongoose              =  require("mongoose");
const cors = require("cors");

var corsOptions = {
  origin: "http://localhost:8081"
};

authapp.use(cors(corsOptions));

const mongoURIauth='mongodb+srv://admin:admin@clgfilesystem.wmbwk.mongodb.net/users?retryWrites=true&w=majority';

mongoose.createConnection(mongoURIauth, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
    .then(() => {
          console.log("MongoDBauth Connected…");
          
    })
    .catch(err => {
        console.log(err);
        process.exit();
    });



    module.exports=authapp;
