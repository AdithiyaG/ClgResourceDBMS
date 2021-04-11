const express = require('express');
const bodyParser =require('body-parser');
const methodOverride =require('method-override');
const routes =require('./routes');
const app = express();
//Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine','ejs');
app.use('/', routes)



const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Server listening in port ${PORT}`));
