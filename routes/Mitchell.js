const express = require('express');
const router = express.Router();
const request = require('request');
const models = require("../models");
const jwt = require("jsonwebtoken");

require('dotenv').config();
const access_key = process.env.ACCESS_KEY;

// get app detail
router.get('/app', async function(req, res) {
  const ID = req.query.app_id;
  const data = await new Promise(function(resolve, reject) {
    var options = {
      'method' : 'GET',
      'url' : `https://api.appmonsta.com/v1/stores/android/details/${ID}.json?country=US`,
      'headers' : {
        'Authorization': `Basic ${access_key}`
      }
    }
    request(options, function(error, response) {
      if (error) reject(new Error(error));
      else resolve(JSON.parse(response.body));
    });
  });

  //catat history untuk recommendation
  const token = req.header("x-auth-token");
  if (token){
    let user = {}
    try { 
      user = jwt.verify(token, "lastofkelasB"); 
      const email = user.email;
      for (let i = 0; i < data.genres.length; i++) {
        const genre = data.genres[i];
        const historyCheck = await models.getHistory(email, genre);
        if (historyCheck.length == 0) await models.insertHistory(email, genre);
        else await models.updateHistory(email, genre, historyCheck[0].jumlah_akses + 1);
      }
    } catch (err) { console.log("Token Invalid"); console.log(err); } 
  }
  res.json(data);
});

// Wishlist
router.get('/wishlist', async function(req, res) {
  const token = req.header("x-auth-token");
  var user = {};
  if (!token) return res.status(401).send("Token not found");
  try { user = jwt.verify(token, "lastofkelasB"); } 
  catch (err) { return res.status(401).send("Token Invalid"); }
  const email = user.email;
  const wishlists = await models.getWishlist(email);
  const result = [];
  wishlists.forEach(wishlist => { result.push(wishlist.app_id); });
  if (result) res.status(200).send({app_id: result});
});
router.post('/wishlist', async function(req, res) {
  const token = req.header("x-auth-token");
  var user = {};
  if (!token) return res.status(401).send("Token not found");
  try { user = jwt.verify(token, "lastofkelasB"); }
  catch (err) { return res.status(401).send("Token Invalid"); }
  const email = user.email;
  const app_id = req.body.app_id;
  const appCheck = await new Promise(function(resolve, reject) {
    var options = {
      'method' : 'GET',
      'url' : `https://api.appmonsta.com/v1/stores/android/details/${app_id}.json?country=US`,
      'headers' : {
        'Authorization': `Basic ${access_key}`
      }
    }
    request(options, function(error, response) {
      if (error) reject(new Error(error));
      else resolve(JSON.parse(response.body));
    });
  });
  if (appCheck.message) return res.status(400).send({message:"Aplikasi tidak ditemukan"});
  const wishlists = await models.getWishlist(email);
  wishlists.forEach(wishlist => { if (wishlist.app_id == app_id) return res.status(400).send({message:"Aplikasi sudah ada di wishlist"}); });
  const result = await models.insertWishlist(email, app_id);
  if (result) res.status(200).send({message:"app berhasil ditambahkan ke wishlist"});
});
router.delete('/wishlist', async function(req, res) {
  const token = req.header("x-auth-token");
  var user = {};
  if (!token) return res.status(401).send("Token not found");
  try { user = jwt.verify(token, "lastofkelasB"); } 
  catch (err) { return res.status(401).send("Token Invalid"); }
  const email = user.email;
  const app_id = req.body.app_id;
  const appCheck = await models.getWishlist(email, app_id);
  if (appCheck.length == 0) return res.status(400).send({message:"Aplikasi tidak ditemukan"});
  const result = await models.deleteWishlist(email, app_id);
  if (result) res.status(200).send({message:"app berhasil dibuang dari wishlist"});
});

module.exports = router;