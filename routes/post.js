const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const models = require("../models");
const jwt = require("jsonwebtoken");

//SET STORAGE ENGINE
const storage=multer.diskStorage({
    destination:'./public/uploads/post',
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

//add post
router.post('/add',async function(req,res){
    const token = req.header("x-auth-token");

    let email = {};
    if(!token){
        res.status(401).send("Token not found");
    }
    try{
        user_logon = jwt.verify(token,"217116635");
    }catch(err){
        //401 not authorized
        res.status(401).send("Token Invalid");
    }
});


module.exports = router;