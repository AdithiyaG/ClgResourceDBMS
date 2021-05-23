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

 let tablename;
//UPLOAD GET 
 router.get('/files/:collection/upload',(req,res)=>{
    res.render('upload',{ collection:req.params.collection });
    tablename = req.params.collection;

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
 
 router.get('/files/:collection',(req,res)=>{
  let collection = req.params.collection;
  gfs.collection(collection);
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('index', { files: false,collection:collection });
    } else {
      res.render('index', { files: files,collection:collection });
      
    }
  });
 });

 // @route DELETE /files/:id
// @desc  Delete file
router.delete('/files/:collection/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: req.params.collection }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/');
  });
});


router.post('/files/:collection/:id',(req,res)=>{


  let collection = req.params.collection;
  let id=  req.params.id;
  gfs.collection(collection);
  gfs.findOne({ _id: id}, function (err, file) {
    console.log('Found');
    let mimeType = file.contentType;
  if (!mimeType) {
      mimeType = mime.lookup(file.filename);
  }
  res.set({
      'Content-Type': mimeType,
      'Content-Disposition': 'attachment; filename=' + file.filename
  });

  const readStream = gfs.createReadStream({
      _id: file._id
  });
  readStream.on('error', err => {
      // report stream error
      console.log(err);
  });
  // the response will be the file itself.
  readStream.pipe(res);
  });
});



 module.exports=router;

