const express = require('express');
const bodyParser =require('body-parser');
const methodOverride =require('method-override');
const routes =require('./routes');
const authapp=require('./auth');
const app = express();
const path = require("path");
//Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine','ejs');
app.use("/js", express.static(path.join(".", "js/")))
app.use("/css", express.static(path.join(".", "css/")))
app.use('/', routes);
app.use('/',authapp);
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Server listening in port ${PORT}`));
