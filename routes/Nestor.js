const express = require('express');
const router = express.Router();
const request = require('request');
const models = require("../models");
const jwt = require("jsonwebtoken");

require('dotenv').config();
const access_key = process.env.ACCESS_KEY;

router.get('/', async function(req,res){
    const query = req.query.query;
    if(!query) res.status(400).send({message:"Query harus dicantumkan!"});
    let result;
    if(isNaN(query)) result = await models.getRatingByApp(query);
    else result = await models.getRatingByID(query);
    res.status(200).send(result);
});

router.post('/', async function(req,res){
    const token = req.header("x-auth-token");
    let user = {};
    if (!token) return res.status(401).send({message:"Token not found"});
    try { user = jwt.verify(token, "lastofkelasB"); } 
    catch (err) { return res.status(401).send({message:"Token Invalid"}); }
    let appID = req.body.appID; 
    let rating = req.body.rating;
    let comment = req.body.comment;
    if(!appID || !rating || !comment) res.status(400).send({message:"Semua field harus diisi!"});
    let email = user.email;
    let result = await models.insertRating(appID, rating, comment, email); 
    res.status(200).send({message:"Insert rating berhasil!"});
});

router.put('/', async function(req,res){
    let ratingID = req.body.ratingID;
    let rating = req.body.rating;
    let comment = req.body.comment;
    if(!rating || !comment) res.status(400).send({message:"Semua field harus diisi!"});
    const token = req.header("x-auth-token");
    let user = {};
    if (!token) return res.status(401).send({message:"Token not found"});
    try { user = jwt.verify(token, "lastofkelasB"); } 
    catch (err) { return res.status(401).send({message:"Token Invalid"}); } //401 not authorized
    let result = await models.editRating(ratingID, rating, comment);
    res.status(200).send({message:"Edit rating berhasil!"});
});

router.delete('/', async function(req,res){
    let ratingID = req.body.ratingID;
    if(!ratingID) res.status(400).send({message:"ID Rating harus dicantumkan!"});
    const token = req.header("x-auth-token");
    let user = {};
    if (!token) return res.status(401).send({message:"Token not found"});
    try { user = jwt.verify(token, "lastofkelasB"); } 
    catch (err) { return res.status(401).send({message:"Token Invalid"}); } //401 not authorized
    let result = await models.deleteRatingByID(ratingID);
    if(result)res.status(200).send({message:"Rating berhasil dihapus!"});
});

module.exports = router;