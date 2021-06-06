const express = require('express');
const multer =require('multer');
const mongoose =require('mongoose');
const GridFsStorage =require('multer-gridfs-storage');
const Grid =require('gridfs-stream');
const router=express.Router();
const path=require('path');
var MongoClient = require('mongodb').MongoClient;
const deasync = require('deasync');
const passport = require('passport');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const https = require('https')
const axios = require('axios');
const { ensureAuthenticated, forwardAuthenticated, ensureAuthenticateadmin } = require('./config/auth');
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
   


   router.post('/register',forwardAuthenticated ,(req,res)=>{
    const { name, email, password, password2 } = req.body;
    let errors = [];
  
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please enter all fields' });
    }
  
    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
  
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
  
    if (errors.length > 0) {
      res.render('register', {
        errors,
        name,
        email,
        password,
        password2
      });
    } 
    else {
      User.findOne({ email: email }).then(user => {
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.render('register', {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          const newUser = new User({
            name,
            email,
            password
          });
  
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash(
                    'success_msg',
                    'You are now registered and you can log in now'
                  );
                  res.redirect('/');
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
    }
  });
  
  router.post('/login', forwardAuthenticated ,(req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/courses',
      failureRedirect: '/',
      failureFlash: true
    })(req, res, next);
  });
  
  router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });
// @route GET/
//Home page
router.get('/',(req,res)=>{ 
  res.render('login')
 });

 router.get('/register',(req,res)=>{ 
  res.render('register')
 });

//UPLOAD GET 
let coursename;
 router.get('/files/mainfs/:department/:course/upload',ensureAuthenticateadmin,(req,res)=>{
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
router.get('/courses',ensureAuthenticated,(req,res)=>{
  var dept = getDept();
  res.render('courses',{dept:dept,de1:false,menu:false,user: req.user})
})

router.get('/courses/:dept',ensureAuthenticated,(req,res)=>{
  var dept = getDept();
  var flag=0;
  var dept1=req.params.dept;
  dept.map((de)=>{
    if(de.department == dept1){
      flag=1;
    res.render('courses',{dept:dept,de1:true,de:de,menu:true,dept1:dept1,user: req.user})}
  });
  if(flag==0){
    res.render('courses',{dept:dept,de1:false,menu:true,dept1:dept1,user: req.user})
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
  function indiFile()
  {
    var ret
    MongoClient.connect(mongoURI, function(err, db) {
      if (err) throw err;
      var dbo=db.db('test');
        dbo.collection("downloadstatus").find({}, { projection: { _id: 0 }}).toArray(function(err, result) {
          ret = result;
          db.close();
        });
    });
    while(ret == null)
    {
      deasync.runLoopOnce();
    }
    return ret;
  }
  
  //POST request on file submission
  router.post('/files/mainfs/:dept/:course/uploadfile',ensureAuthenticateadmin,(req, res, next) => {
    var filetype = req.body.filetype;
    console.log(req.body);
    coursename.push(filetype);
    updateMetadata(coursename); 
    next();
    res.redirect(`/files/mainfs/${req.params.dept}/${req.params.course}`);
    
  },upload.array('file')
  );
 
 router.get('/files/mainfs/:department/:course',ensureAuthenticated,(req,res)=>{
  let department = req.params.department;
  let course = req.params.course;
  gfs.collection('mainfs');
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('index', { files: false,department:department,course:course,fileGot:false});
    } else 
    {
      var downloadStat = [];
      downloadStat = indiFile();
      files.map(file => {
        if(file.metadata[1] === course)
        {
          file.isReq = true;
          for(i=0;i<downloadStat.length;i++)
          {
            if(downloadStat[i].fileid == file._id)
            {
              file.noDown = downloadStat[i].downloads;
              break;
            }
            else
            {
              file.noDown = 0;
            }
          }
        }
        else
        {
          file.isReq = false
        }

      });
      res.render('index', { files: files,department:department,course:course,fileGot:false});
      
    }
  });
 });

 // @route DELETE /files/:id
// @desc  Delete file
router.delete('/files/mainfs/:department/:course/:id', ensureAuthenticateadmin,(req, res) => {
  let department = req.params.department;
  let course = req.params.course;
  gfs.remove({ _id: req.params.id, root: 'mainfs' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect(`/files/mainfs/${ req.params.department}/${ req.params.course}`);
  });
});

function setDownload(id)
  {
    var ret;
    MongoClient.connect(mongoURI, function(err, db) {
      if (err) throw err;
      var dbo=db.db('test');
       dbo.collection("downloadstatus").findOne({fileid:id}, { projection: { _id: 0 } },function(err, result) {
      ret = result;
      if(ret==null){
        dbo.collection("downloadstatus").insertOne({fileid:id,downloads:1},function(err,result){
          console.log('inserted')
        });
      }
       
    else if(ret.fileid == id ){
      dbo.collection("downloadstatus").updateOne({fileid:id},{$set:{downloads:ret.downloads+1}},function(err,result){
        console.log('updated')
      })
    }
      db.close();
    });
    });
   
  }
  let department1;
  let course1;

router.post('/files/mainfs/download/:department/:course/:id',ensureAuthenticated,(req,res,next)=>{
  department1=req.params.department;
  course1=req.params.course;
  let id=  req.params.id;
  gfs.collection('mainfs');
  setDownload(id);
  req.flash('success_msg', 'file downloaded');
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

  console.log(department1);
  console.log(course1);
next();

},(req,res)=>{
  axios.get(`http://localhost:5000/files/mainfs/${department1}/${course1}`)
  .then(response => {
    console.log(1,response.data.url);
    console.log(2,response.data.explanation);
  })
  .catch(error => {
    console.log(error);
  })
}

  );


 module.exports=router;

 