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

router.get('/recommendation_wrong', async function(req, res) {
  const token = req.header("x-auth-token");
  var user = {};
  if (!token) return res.status(401).send("Token not found");
  try { user = jwt.verify(token, "lastofkelasB"); } 
  catch (err) { console.log(err); return res.status(401).send("Token Invalid"); } //401 not authorized
  const email = user.email;
  const histories = await models.getHistory(email, null);

  // Mulai kacau disini
  /* 
    harusnya kalo bisa get all app detail
    nda perlu ambil appnya satu satu
    lihat remark di line 40
  */ 
  var apps = [];
  if (histories) {
    const allID = await new Promise(function(resolve, reject) {
      var options = {
        'method' : 'GET',
        'url' : `https://api.appmonsta.com/v1/stores/android/ids`,
        'headers' : {
          'Authorization': `Basic ${access_key}`
        }
      }
      request(options, function(error, response) {
        if (error) reject(new Error(error));
        else resolve((response.body).split("\n"));
      });
    });
    for (let i = 0; i < allID.length; i++) {
      const id = allID[i];
      const data = await new Promise(function(resolve, reject) {
        var options = {
          'method' : 'GET',
          'url' : `https://api.appmonsta.com/v1/stores/android/details/${id}.json?country=US`,
          'headers' : {
            'Authorization': `Basic ${access_key}`
          }
        }
        request(options, function(error, response) {
          if (error) reject(new Error(error));
          else resolve(JSON.parse(response.body));
        });
      });
      apps.push(data);
      console.log(data);
    }
    var reccomendation = [];
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      for (let j = 0; j < histories.length; j++) {
        if (j == 3) break;
        const history = histories[j];
        if (app.genre == history.genre) {
          reccomendation.push(app);
        }
      }
    }
    res.status(200).send({value: reccomendation});

    //sampai sini
  } else return res.status(400).send({message:"Recommendation tidak dapat digenerate \nBuka beberapa aplikasi untuk menjalankan fungsi ini"});
});

//Tambahan MING
router.get('/recommendation', async function(req, res) {
  const token = req.header("x-auth-token");
  var user = {};
  if (!token) return res.status(401).send("Token not found");
  try { user = jwt.verify(token, "lastofkelasB"); } 
  catch (err) { console.log(err); return res.status(401).send("Token Invalid"); } //401 not authorized
  
  user_logon = await models.getUser(user.email);
  if(user_logon[0].api_hit > 0){
    const top = await new Promise(function(resolve, reject) {
      var options = {
        'method' : 'GET',
        'url' : `https://api.appmonsta.com/v1/stores/android/rankings.json?country=US&date=2020-06-15`,
        'headers' : {
          'Authorization': `Basic ${access_key}`
        }
      }
      
      request(options, function(error, response) {
        if (error) reject(new Error(error));
        else resolve((response.body).split("\n"));
      });
    });
    data = [];

    for (let i = 0; i < top.length; i++) {
      let stringW = top[i].substring(top[i].search("app_id"),top[i].length);
      let app_id = stringW.substring(stringW.search("app_id"),stringW.search(","));
      let rank = stringW.substring(stringW.search("rank"),stringW.search(","));
      let appid = app_id.substring(9,app_id.length-1);

      data.push({
        "rank" : i+1,
        "app_id" : appid
      });
    }

    var output = {
      "status":200,
      "error" : "",
      "data" : data
    };

    return res.status(200).send(output);
  }else{
    return res.status(400).send("API Hit anda sudah habis");
  }
});

module.exports = router;