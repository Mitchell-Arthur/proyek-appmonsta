const express = require('express');
const router = express.Router();
const request = require('request');
const models = require("../models");
const jwt = require("jsonwebtoken");

require('dotenv').config();
const access_key = process.env.ACCESS_KEY;

router.get('/getRatingByApp', async function(req,res){
    const appID = req.query.appID;
    if(!appID) res.status(400).send("ID App harus dicantumkan!");
    const data = await new Promise(function(resolve, reject) {
        var options = {
        'method' : 'GET',
        'url' : `https://api.appmonsta.com/v1/stores/android/details/${appID}.json?country=US`,
        'headers' : {
                'Authorization': `Basic ${access_key}`
            }
        }
        request(options, function(error, response) {
            if (error) reject(new Error(error));
            else resolve(JSON.parse(response.body));
        });
    });
    let result = await models.getRatingByApp(data)
    return result;
});

router.get('/getRatingByID', async function(req,res){
    const ratingID = req.query.ratingID;
    if(!ratingID) res.status(400).send("ID Rating harus dicantumkan!");
    let result = await models.getRatingByID(ratingID);
    return result;
});

router.post('/insertRating', async function(req,res){
    let rating = req.body.rating;
    let comment = req.body.comment;
    if(!rating || !comment || !email) res.status(400).send("Semua field harus diisi!");
    const token = req.header("x-auth-token");
    const user = {};
    if (!token) return res.status(401).send("Token not found");
    try { user = jwt.verify(token, "lastofkelasB"); } 
    catch (err) { return res.status(401).send("Token Invalid"); } //401 not authorized
    let email = user.email;
    let result = await models.insertRating(rating, comment, email); 
    if(result) res.status(200).send("Insert rating berhasil!")
    else res.status(400).send("Insert rating gagal.");
});

router.put('/editRating', async function(req,res){
    let ratingID = req.body.ratingID;
    let rating = req.body.rating;
    let comment = req.body.comment;
    if(!rating || !comment) res.status(400).send("Semua field harus diisi!");
    const token = req.header("x-auth-token");
    const user = {};
    if (!token) return res.status(401).send("Token not found");
    try { user = jwt.verify(token, "lastofkelasB"); } 
    catch (err) { return res.status(401).send("Token Invalid"); } //401 not authorized
    let result = await models.editRating(ratingID, rating, comment);
    if(result) res.status(200).send("Edit rating berhasil!");
    else res.status(400).send("Edit rating gagal.")
});

router.delete('/deleteRatingByID', async function(req,res){
    let ratingID = req.body.ratingID;
    if(!ratingID) res.status(400).send("ID Rating harus dicantumkan!");
    const token = req.header("x-auth-token");
    const user = {};
    if (!token) return res.status(401).send("Token not found");
    try { user = jwt.verify(token, "lastofkelasB"); } 
    catch (err) { return res.status(401).send("Token Invalid"); } //401 not authorized
    let result = await models.deleteRatingByID(ratingID);
    if(result)res.status(200).send("Rating berhasil dihapus!");
});

router.post('/insertLikeonRating', async function(req,res){
    let ratingID = req.body.ratingID;
    let comment = req.body.comment;
    if(!ratingID) res.status(400).send("ID Rating harus dicantumkan!");
    const token = req.header("x-auth-token");
    const user = {};
    if (!token) return res.status(401).send("Token not found");
    try { user = jwt.verify(token, "lastofkelasB"); } 
    catch (err) { return res.status(401).send("Token Invalid"); } //401 not authorized
    let email = user.email;
    let result = await models.insertLikeonRating(rating, comment, email); 
    if(result) res.status(200).send("Insert like pada rating dengan ID "+ratingID+" berhasil!")
    else res.status(400).send("Insert rating gagal.")
});

router.delete('/deleteLikeonRatingByID', async function(req,res){
    let likeID = req.body.likeID;
    if(!likeID) res.status(400).send("ID Rating harus dicantumkan!");
    const token = req.header("x-auth-token");
    const user = {};
    if (!token) return res.status(401).send("Token not found");
    try { user = jwt.verify(token, "lastofkelasB"); } 
    catch (err) { return res.status(401).send("Token Invalid"); } //401 not authorized
    let result = await models.deleteLikeonRatingbyID(likeID);
    if(result)res.status(200).send("Rating berhasil dihapus!");
});

module.exports = router;