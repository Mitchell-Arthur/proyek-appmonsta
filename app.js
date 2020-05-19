const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const mc = require("./routes/mc");
const mitchell = require("./routes/Mitchell");

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use("/api/mc" , mc);
app.use("/api/mitchell", mitchell);

app.listen(port, () => {
  console.log(`listening port ${port}`);
});