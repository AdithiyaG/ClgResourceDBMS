const express = require('express');

const bodyParser =require('body-parser');
const path=require('path');
const crypto =require('crypto');
const mongoose =require('mongoose');
const multer =require('multer');
const GridFsStorage =require('multer-gridfs-storage');
const Grid =require('gridfs-stream');
const methodOverride =require('method-override');

const app = express();
//Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine','ejs');

   //Mongo URI
   const mongoURI='mongodb+srv://admin:admin@clgfilesystem.wmbwk.mongodb.net/test?retryWrites=true&w=majority';

   //Mongo Connection
    mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log("MongoDB Connected…");
    })
    .catch(err => console.log(err));
   const conn=mongoose.connection;
  //  //Init gfs
  //  let gfs;
  //  conn.once('open',()=>{
  //      gfs= Grid(conn.db,mongoose.mongo);
  //      gfs.collection('tablename') //Table
  //  })
   
  //  //Create storage engine
  //  const storage = new GridFsStorage({
  //     url: mongoURI,
  //     file: (req, file) => {
  //       return new Promise((resolve, reject) => {
  //         crypto.randomBytes(16, (err, buf) => {
  //           if (err) {
  //             return reject(err);
  //           }
  //           const filename = buf.toString('hex') + path.extname(file.originalname);
  //           const fileInfo = {
  //             filename: filename,
  //             bucketName: 'tablename'
  //           };
  //           resolve(fileInfo);
  //         });
  //       });
  //     }
  //   });
   
  //   const upload = multer({storage});

// @route GET/
//Home page
app.get('/',(req,res)=>{
   res.render('index'); 
});
app.get('/upload',(req,res)=>{
   res.render('upload.ejs');
});
app.post('/upload',(req,res)=>{
  console.log(req.body.table);
  const tablename = req.body.table;
  res.render('uploadfile.ejs');
  //Mongo URI

  //Init gfs
  let gfs;
  conn.once('open',()=>{
      gfs= Grid(conn.db,mongoose.mongo);
      gfs.collection(tablename) //Table
  })
  
  //Create storage engine
  const storage = new GridFsStorage({
     url: mongoURI,
     file: (req, file) => {
       return new Promise((resolve, reject) => {
         crypto.randomBytes(16, (err, buf) => {
           if (err) {
             return reject(err);
           }
           const filename = buf.toString('hex') + path.extname(file.originalname);
           const fileInfo = {
             filename: filename,
             bucketName: tablename
           };
           resolve(fileInfo);
         });
       });
     }
   });
  
   const upload = multer({storage});
   app.post('/uploadfile',upload.single('file'),(req,res)=>{
    res.json({file:req.file});
    console.log(req.body);
 
 });
})

   //@route POST /upload
  // app.post('/uploadfile',upload.single('file'),(req,res)=>{
  //     res.json({file:req.file});
  //     console.log(req.body);
   
  //  });
  



const port =5000;
app.listen(port,()=>console.log(`Server listening in port ${port}`));