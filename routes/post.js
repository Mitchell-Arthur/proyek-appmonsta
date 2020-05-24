const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const models = require("../models");
const jwt = require("jsonwebtoken");

//VAR POST
var post = [];

//SET STORAGE ENGINE
const storage=multer.diskStorage({
    destination:'./public/uploads/post',
    filename:function(req,file,cb){
        cb(null,post[post.length-1].id_post+".jpg");
    }
});

const upload=multer({
    storage:storage,
    fileFilter: function(req,file,cb){
        checkFileType(file,cb);
    }
}).single('img_post');

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
    let msg = "";
    let status = "";
    let data = [];
    let output = [];
    let user_logon = {};
    if(!token){
        res.status(401).send("Token not found");
    }
    try{
        user_logon = jwt.verify(token,"lastofkelasB");
    }catch(err){
        //401 not authorized
        res.status(401).send("Token Invalid");
    }

    if(user_logon.level == 2){
        let app_id = req.body.app_id;
        let judul = req.body.judul;
        let caption = req.body.caption;
        console.log(req.body);
        if(app_id == "" || judul == "" || caption == ""){
            status = "Gagal Post";
            msg = "Pastikan semua field terisi!";
            output.push({
                "status" : status,
                "error" : msg,
                "data" : data
            });
            res.status(400).send(output);
        }else{
            let insertPost = await models.insertPost(user_logon.email, judul, caption, app_id);
            post = await models.getPost();
            
            upload(req,res,async (err)=>{
                if(err){
                    console.log(err);
                    status = "Gagal Post";
                    let deleteLast = await models.deleteLastPost();
                    output.push({
                        "status" : status,
                        "error" : err,
                        "data" : data
                    });
                    res.status(400).send(output);
                }else{
                    status = "Berhasil Post";
                    data = await models.getLastPost();
                    output.push({
                        "status" : status,
                        "error" : "",
                        "data" : data
                    });
                    res.status(200).send(output);
                }
            });
        }
    }else{
        status = "Gagal Post";
        msg = "Jenis user tidak memiliki hak akses";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : data
        });
        res.status(400).send(output);
    }
});


module.exports = router;