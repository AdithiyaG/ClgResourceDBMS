const express = require('express');
const crypto =require('crypto');
const multer =require('multer');
const mongoose =require('mongoose');
const GridFsStorage =require('multer-gridfs-storage');
const Grid =require('gridfs-stream');
const router=express.Router();
const path=require('path');


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
//Init gfs
let gfs;
conn.once('open',()=>{
gfs= Grid(conn.db,mongoose.mongo);
gfs.collection('tablename') //Table
   })
   
// @route GET/
//Home page
router.get('/',(req,res)=>{
    res.render('index'); 
 });
 
 //CourseName and DeptName
 router.get('/upload',(req,res)=>{
    res.render('upload.ejs');
 });
 
 //POST REQUEST
 router.post('/upload',(req,res)=>{
   
   console.log(req.body.table);
   
   const tablename = req.body.table;
   
   res.render('uploadfile.ejs');
   
 
 
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
 
 //POST request on file submission
 router.post('/uploadfile',upload.single('file'),(req,res)=>{
 // res.json({file:req.file});
  res.redirect('/');
 console.log(req.body);
  
  });
 })
 
 router.get('/files',(req,res)=>{
   gfs.collection('ECM');
   gfs.files.find().toArray((err,files)=>{
 
     if(!files || files.length ===0){
       return res.status(404).json({
         err:'No files exist'
       });
     }
     //Files exist
     return res.json(files);
 
   })
 });

 module.exports=router;

