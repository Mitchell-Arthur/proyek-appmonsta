const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const models = require("../models");
const jwt = require("jsonwebtoken");
const midtransClient = require('midtrans-client');

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
        const token = jwt.sign({    
            "email":result.email,
            "level":result.tipe_user
        }   ,"lastofkelasB", {expiresIn : '1h'});
        res.status(200).send(token);
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

router.put("/upgrade_premium", async function(req,res){
    var credit_card_number = req.body.credit_card_number;
    const token = req.header("x-auth-token");

    if(!token){
        res.status(400).send("Anda harus melakukan login terlebih dahulu.")
    }
    else{
        try{
            user = jwt.verify(token,"lastofkelasB");
        }catch(err){
            res.status(401).send("Token Invalid harap lakukan login ulang");
        }
        if(user.level == 1){
            res.status(200).send(user.email)
        }
        else{
            res.send(400).send("anda sudah terdaftar sebagai premium member")
        }
    }
});

router.get('/test', function(req,res){
    res.status(200).send("waow")
});

module.exports = router;