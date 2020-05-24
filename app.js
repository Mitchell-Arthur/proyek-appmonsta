const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const mc = require("./routes/mc");
const mitchell = require("./routes/Mitchell");

//Ming
const post = require("./routes/post");

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use("/api/mc" , mc);
app.use(express.static('./public'));

require('dotenv').config();
app.set('view engine','ejs');
const access_key = process.env.ACCESS_KEY;

app.get('/lob/api/getAllID', async function(req, res) {
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

// get app detail
app.get('/lob/api/getAppDetail/', async function(req, res) {
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
  //res.json(data);
  res.render("app/detail", {data:data});
});

// get all app detail
// contoh: http://localhost:3000/lob/api/getAppDetail?app_id=com.ktucalender
app.get('/lob/api/getAllAppDetail', async function(req, res) {
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

// wishlist
app.get('/lob/api/getStatusWishlist', async function(req, res) {
  // user_key ambil dari token
  const user_key = req.query.user_key;// ? req.query.user_key : "1234567890"; // user key sementara
  const app_id = req.query.app_id;
  let userCheck = await models.getUser(user_key);
  if (userCheck.length == 1) {
    const result = await models.getWishlist(user_key, app_id);
    if (result) res.status(200).send({value:result});
  } else return res.status(400).send({message:"User belum terdaftar"}); // mungkin tidak terpakai
});
app.post('/lob/api/addWishlist', async function(req, res) {
  // user_key ambil dari token
  const user_key = req.body.user_key;// ? req.body.user_key : "1234567890"; // user key sementara
  const app_id = req.body.app_id;
  let userCheck = await models.getUser(user_key);
  if (userCheck.length == 1) {
    const result = await models.insertWishlist(user_key, app_id);
    if (result) res.status(200).send({message:"app berhasil ditambahkan ke wishlist"});
  } else return res.status(400).send({message:"User belum terdaftar"}); 
});
app.delete('/lob/api/removeWishlist', async function(req, res) {
  // user_key ambil dari token
  const user_key = req.body.user_key;// ? req.body.user_key : "1234567890"; // user key sementara
  const app_id = req.body.app_id;
  let userCheck = await models.getUser(user_key);
  if (userCheck.length == 1) {
    const result = await models.deleteWishlist(user_key, app_id);
    if (result) res.status(200).send({message:"app berhasil dibuang dari wishlist"});
  } else return res.status(400).send({message:"User belum terdaftar"});  // mungkin tidak terpakai
});
app.use("/api/mitchell", mitchell);
app.use("/api/post",post);

app.listen(port, () => {
  console.log(`listening port ${port}`);
});