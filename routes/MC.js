const express = require("express");
const router = express.Router();
const fs = require('fs')
const path = require('path')
const multer = require("multer");
const models = require("../models")

//SET STORAGE ENGINE
const storage=multer.diskStorage({
    destination:'./public/uploads',
    filename:function(req,file,cb){
        cb(null,req.body.email + path.extname(file.originalname));
    }
});

const upload=multer({
    storage:storage,
    fileFilter: function(req,file,cb){
        checkFileType(file,cb);
    }
}).single('profile_picture');

function checkFileType(file,cb){
    const filetypes= /jpeg|jpg|png|gif/;
    const extname=filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype=filetypes.test(file.mimetype);
    if(mimetype && extname){
        return cb(null,true);
    }else{
        cb('Error: Image Only!');
    }
}

router.post('/register',async function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    
    if(username == ""|| password == "" || email == ""){
        res.status(400).send("ada field yang tidak diisi");
    }
    else{
        let result = await models.register_user(username, password, email);
        if(!result){
            res.status(400).send("register gagal email pernah diguakan")
        }
        else{
            res.status(400).send("register berhasil")
        }
    }
});

router.post("/login" ,async function(req,res){
    var email = req.body.email;
    var password = req.body.password;
    let result = await models.login_user(email, password);
    if(!result){
        res.status(400).send("Login gagal user tidak ditemukan")
    }
    else{
        res.status(200).send(result)
    }
});

router.put("/update_profile" , upload,  async function(req,res){
    var username  = req.body.username;
    var password = req.body.password;
    var profile_picture = req.file;
    var email = req.body.email;
    console.log(req.file)

    let result = await models.update_profile(username, password, email + path.extname(req.file.originalname).toLowerCase(), email)
    if(result){
        res.status(200).send("Profile berhasil di update")
    }
    else{
        res.status(404).send("user dengan email tersebut tidak ditemukan")
    }
});

router.get('/test', function(req,res){
    res.status(200).send("waow")
});

module.exports = router;