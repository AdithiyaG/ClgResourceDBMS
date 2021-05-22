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

   })
   
// @route GET/
//Home page
router.get('/',(req,res)=>{ 
  res.send('Hello World')
 });


 //CourseName and DeptName
 router.get('/upload',(req,res)=>{
    res.render('upload.ejs');
 });

let tablename;
 //POST REQUEST
router.post('/upload',(req,res)=>{
 tablename = req.body.table;
console.log(2,tablename);
res.status(204).send();
 });
//Create storage engine

 const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    console.log(4,tablename)
    return {
          filename: file.originalname,
          bucketName: tablename
        };
  },
  options: {
   useUnifiedTopology: true,
 }
  });
  
  const upload = multer({storage});

  //POST request on file submission
  router.post('/uploadfile',upload.single('file'),(req,res)=>{
   res.redirect('/');
   console.log(5,tablename);
   });
 
 router.get('/:collection',(req,res)=>{
  let collection = req.params.collection;
  gfs.collection(collection);
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('index', { files: false,collection:collection });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('index', { files: files,collection:collection });
    }
  });
 });

 // @route DELETE /files/:id
// @desc  Delete file
router.delete('/:collection/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: req.params.collection }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/');
  });
});


 module.exports=router;

