const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const request = require("request");
const models = require("./models");

app.use(express.urlencoded({extended:true}));
app.use(express.json());
require('dotenv').config();
const access_key = process.env.ACCESS_KEY;

//https://api.appmonsta.com/v1/stores/android/ids
app.get('/getAllID', async function(req,res) {
    const allID = await new Promise(function(resolve,reject){
        var options = {
            'method' : 'GET',
            'url' : `https://api.appmonsta.com/v1/stores/android/ids`,
            'headers' :{
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

app.listen(port, () => {
    console.log(`listening port ${port}`);
});