const express = require('express');
const crypto =require('crypto');
const multer =require('multer');
const mongoose =require('mongoose');
const GridFsStorage =require('multer-gridfs-storage');
const Grid =require('gridfs-stream');
const router=express.Router();
const path=require('path');
var MongoClient = require('mongodb').MongoClient;
const deasync = require('deasync');



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
let coursename;
 router.get('/files/mainfs/:department/:course/upload',(req,res)=>{
  console.log(req.params.department);
  console.log(req.params.course);
  coursename=[req.params.department,req.params.course];
    res.render('upload',{dept:coursename[0],course:coursename[1]});

 });


 let updatedMetadata;

const updateMetadata = id => {
  updatedMetadata = id;
};
function getDept()
{
  var ret;
  MongoClient.connect(mongoURI, function(err, db) {
    if (err) throw err;
    var dbo=db.db('test');
     dbo.collection("courseDatabase").find({}, { projection: { _id: 0 } }).toArray(function(err, result) {
    ret = result;
    db.close();
  });
  });
  while((ret == null))
  {
       deasync.runLoopOnce();
  }
  return (ret);
}
router.get('/courses',(req,res)=>{
  var dept = getDept();
  res.render('courses',{dept:dept,de1:false,menu:false})
})

router.get('/courses/:dept',(req,res)=>{
  var dept = getDept();
  var flag=0;
  var dept1=req.params.dept;
  dept.map((de)=>{
    if(de.department == dept1){
      flag=1;
    res.render('courses',{dept:dept,de1:true,de:de,menu:true,dept1:dept1})}
  });
  if(flag==0){
    res.render('courses',{dept:dept,de1:false,menu:true,dept1:dept1})
  }
  
  
});

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


  
  //POST request on file submission
  router.post('/uploadfile',(req, res, next) => {
    updateMetadata(coursename); 
    next();
    res.redirect(`/files/mainfs/${coursename[0]}/${coursename[1]}`);
    
  },upload.single('file'),
  (req,res)=>{
    console.log('back');
    res.redirect('back');
  }
  );
 
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
        if(file.metadata[1] === course)
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

