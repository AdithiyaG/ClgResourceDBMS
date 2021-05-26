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

//UPLOAD GET 
 router.get('/files/mainfs/upload',(req,res)=>{
    res.render('upload');

 });


 let updatedMetadata;

const updateMetadata = id => {
  updatedMetadata = id;
};

router.get('/courses',(req,res)=>{
  res.render('courses',{name:'ME'})
})

//Create storage engine

 const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    
    return {
          filename: file.originalname,
          bucketName: 'mainfs',
          metadata: updatedMetadata ? updatedMetadata : null
        };
  
  },
  options: {
   useUnifiedTopology: true,
 }
  });
  
  const upload = multer({storage});

  let coursename;
  router.post('/upload',(req,res)=>{

    console.log(req.body.semno);
    console.log(req.body.course);
    coursename=[req.body.semno,req.body.course];

    res.status(204).send();
  });

  
  //POST request on file submission
  router.post('/uploadfile',(req, res, next) => {
    updateMetadata(coursename); //Static test value
    next();
    res.redirect('/courses');
    
  },upload.single('file'));
 
 router.get('/files/mainfs/:department/:course',(req,res)=>{
  let department = req.params.department;
  let course = req.params.course;
  
  gfs.collection('mainfs');
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('index', { files: false,department:department,course:course});
    } else {
      files.map(file => {
        console.log(1,department,2,course,3,file.metadata[1],4,file.metadata[0])
        if(file.metadata[0] === department && file.metadata[1] === course)
        {
          file.isReq = true;
        }
        else
        {
          file.isReq = false
        }
      });
      res.render('index', { files: files,department:department,course:course});
      
    }
  });
 });

 // @route DELETE /files/:id
// @desc  Delete file
router.delete('/files/mainfs/:department/:course/:id', (req, res) => {
  let department = req.params.department;
  let course = req.params.course;
  gfs.remove({ _id: req.params.id, root: 'mainfs' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect(`/files/mainfs/${ req.params.department}/${ req.params.course}`);
  });
});


router.post('/files/mainfs/:department/:course/:id',(req,res)=>{


  let department = req.params.department;
  let course = req.params.course;
  let id=  req.params.id;
  gfs.collection('mainfs');
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

