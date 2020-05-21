const express = require('express');
const router = express.Router();
const request = require('request');
const models = require("../models");

require('dotenv').config();
const access_key = process.env.ACCESS_KEY;

// get all app detail # tidak terpakai
router.get('/getAllID', async function(req, res) {
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
  res.json(allID);
});

// get all app detail # tidak terpakai
// contoh: http://localhost:3000/lob/api/getAppDetail?app_id=com.ktucalender
router.get('/getAllAppDetail', async function(req, res) {
  const date = new Date().toISOString().split('T')[0];
  const allAppDetail = await new Promise(function(resolve, reject) {
    var options = {
      'method' : 'GET',
      'url' : `https://api.appmonsta.com/v1/stores/android/details.json?date=${date}&country=US`,
      'headers' : {
        'Authorization': `Basic ${access_key}`
      }
    }
    request(options, function(error, response) {
      if (error) reject(new Error(error));
      else resolve(JSON.parse(response.body));
    });
  });
  res.json(allAppDetail);
});

// get app detail
router.get('/getAppDetail/', async function(req, res) {
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
  res.json(data);
});

// Wishlist
router.get('/getWishlist', async function(req, res) {
  // user_key ambil dari token
  const user_key = req.query.user_key;// ? req.query.user_key : "1234567890"; // user key sementara
  const app_id = req.query.app_id;
  const userCheck = await models.getUser(user_key);
  if (userCheck.length == 0) return res.status(400).send({message:"User belum terdaftar"});
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
  const result = await models.getWishlist(user_key, app_id);
  if (result) res.status(200).send({value:result});
});
router.post('/addWishlist', async function(req, res) {
  // user_key ambil dari token
  const user_key = req.body.user_key;// ? req.body.user_key : "1234567890"; // user key sementara
  const app_id = req.body.app_id;
  let userCheck = await models.getUser(user_key);
  if (userCheck.length == 0) return res.status(400).send({message:"User belum terdaftar"});
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
  const result = await models.insertWishlist(user_key, app_id);
  if (result) res.status(200).send({message:"app berhasil ditambahkan ke wishlist"});
});
router.delete('/removeWishlist', async function(req, res) {
  // user_key ambil dari token
  const user_key = req.body.user_key;// ? req.body.user_key : "1234567890"; // user key sementara
  const app_id = req.body.app_id;
  let userCheck = await models.getUser(user_key);
  if (userCheck.length == 0) return res.status(400).send({message:"User belum terdaftar"});
  const appCheck = await models.getWishlist(user_key, app_id);
  if (appCheck.length == 0) return res.status(400).send({message:"Aplikasi tidak ditemukan"});
  const result = await models.deleteWishlist(user_key, app_id);
  if (result) res.status(200).send({message:"app berhasil dibuang dari wishlist"});
});

module.exports = router;