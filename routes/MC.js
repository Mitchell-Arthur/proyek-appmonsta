const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs')
const path = require('path')
const multer = require("multer");
const pool = require("../models")

router.post('/register',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    
    if(username == ""|| password == "" || email == ""){
        res.status(400).send("ada field yang tidak diisi");
    }
    pool.getConnection(function(err,conn){
        if(err) res.status(500).send(err);
        else{
            conn.query(`select * from user where email = '${email}'`,function(error,result){
                if(error ) res.status(500).send(error);
                else{ 
                    if(result.length>0){
                        res.status(400).send('Email sudah terdaftar')
                    }
                    else{
                        conn.query(`insert into user values ('','${username}','${password}','${email}','')`,function(error,result){
                            if(error ) res.status(500).send(error);
                            else{
                                res.status(200).send("user telah didaftarkan");
                            }
                        })
                    }
                }
            })
        }
    });
});

router.post("/login" , function(req,res){
    var email = email.body.nomor_hp;
    var password = req.body.password;
    var key = "";
    var kembar = true;
    for(var i =0;i<10;i++){
        let angka = Math.floor(Math.random() * 10);
        key += angka;
    }

    pool.getConnection(function(err,conn){
        if(err) res.status(500).send(err);
        else{
            conn.query(`select * from user where email = '${email}' and password = '${password}'`,function(error,result){
                if(error ){
                    connection.release();res.status(500).send(error);
                }
                else{ 
                    if(result.length>0){
                        conn.query(`select * from user`,function(error,result){
                            if(error ) res.status(500).send(error);
                            else{
                                while(kembar == true){
                                    kembar = false;
                                    result.forEach(element => {
                                        if(result.login_key == key){
                                            kembar = true;
                                            key = "";
                                            for(var i =0;i<10;i++){
                                                let angka = Math.floor(Math.random() * 10);
                                                key += angka;
                                            }
                                        }
                                    });
                                }
                                conn.query(`update user set login_key = '${key}' where email = '${email}'`,function(error,result){
                                    if(error ) res.status(500).send(error);
                                    else{
                                        res.status(200).send(key);
                                    }
                                })
                            }
                        })
                    }
                    else{
                        res.status(400).send("user tidak ditemukan")
                    }
                }
            })
        }
    });
});

router.get('/test', function(req,res){
    res.status(200).send("waow")
});

module.exports = router;