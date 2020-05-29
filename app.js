const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const mc = require("./routes/mc");
const mitchell = require("./routes/Mitchell");
require('dotenv').config()

//Ming
const post = require("./routes/post");

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use("/api/mc" , mc);
app.use(express.static('./public'));

app.set('view engine','ejs');
const access_key = process.env.ACCESS_KEY;
const stripe_secret_key = process.env.STRIPED_SECRET_KEY;
const stripe_public_key = process.env.STRIPED_PUBLIC_KEY;

console.log(stripe_secret_key,stripe_public_key)

app.use("/api/mitchell", mitchell);
app.use("/api/post",post);

//EJS MING
app.get('/demo/post/:token', async function(req, res) {
  const data = {
    "token" : req.params.token
  }
  console.log(data);
  res.render("app/post",{data:data});
});

app.listen(port, () => {
  console.log(`listening port ${port}`);
});