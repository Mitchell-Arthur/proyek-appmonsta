const mysql = require("mysql");
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

function getConnection() {
  return new Promise(function(resolve, reject) {
    pool.getConnection(function (err, conn) {
      if (err) reject(err) 
      else resolve(conn)
    });
  });
}

function executeQuery(conn, query) {
  return new Promise(function (resolve, reject) {
    conn.query(query, function (err, result) {
      if (err) reject(err)
      else resolve(result)
    });
  });
}

//query untuk Register
async function register_user(username, password, email){
    const conn = await getConnection();
    let query = `select * from user where email = '${email}'`
    let result = await executeQuery(conn, query)
    if(result.length>0){
      conn.release();
      return false;
    }
    else{
      let query  = `insert into user values('${username}','${password}','${email}',1,'default.jpg',5)`;
      const result = await executeQuery(conn, query);
      conn.release();
      return result;
    }
}

//query untuk login
async function login_user(email, password){
    const conn = await getConnection();
    let query  = `select * from user where email = '${email}' and password = '${password}'`;
    var result = await executeQuery(conn, query);
    if(result.length>0){
        var user = result[0]
        conn.release()
        return user;
    }
    else{
        conn.release();
        return false;
    }
}

//query untuk update profile user
async function update_profile(username, password, profile_picture, email){
  const conn = await getConnection();
  var query =  `select * from user where email = '${email}'`;
  var result = await executeQuery(conn,query);
  if(result.length == 0){
    conn.release();
    return false;
  }
  else{
    var user = result[0]
    query = `update user set username = '${username}', password = '${password}', profile_picture = '${profile_picture}' where email = '${email}'`
    result = await executeQuery(conn,query);
    conn.release();
    return user;
  }
}

async function upgrade_user(email){
  const conn = await getConnection();
  var query =  `select * from user where email = '${email}'`;
  var result = await executeQuery(conn,query);
  if(result.length == 0){
    conn.release();
    return false;
  }
  else{
    var user = result[0]
    query = `update user set tipe_user = 2 where email = '${email}'`
    result = await executeQuery(conn,query);
    conn.release();
    return true;
  }
}

//Mitchell
//mungkin tidak dipakai
async function getUser(email){
  const conn = await getConnection();
  let query = `SELECT * FROM user WHERE email ='${email}'`;
  const result = await executeQuery(conn, query);
  conn.release();
  return result;
}

async function getWishlist(email, app_id){
  const conn = await getConnection();
  const result = await executeQuery(conn, `SELECT * FROM wishlist WHERE email ='${email}' AND app_id = '${app_id}'`);
  conn.release();
  return result;
}

async function insertWishlist(email, app_id){
  const conn = await getConnection();
  const result = await executeQuery(conn, `INSERT INTO wishlist VALUES ('${email}','${app_id}')`);
  conn.release();
  return result;
}

async function deleteWishlist(email, app_id){
  const conn = await getConnection();
  const result = await executeQuery(conn, `DELETE FROM wishlist WHERE email ='${email}' AND app_id = '${app_id}'`);
  conn.release();
  return result;
}

async function getHistory(email, genre){
  const conn = await getConnection();
  let query = `SELECT * FROM history WHERE email = '${email}'`;
  if (genre) query += ` AND genre = '${genre}'`;
  const result = await executeQuery(conn, query);
  conn.release();
  return result;
}

async function insertHistory(email, genre){
  const conn = await getConnection();
  const result = await executeQuery(conn, `INSERT INTO history VALUES ('${email}','${genre}',1)`);
  conn.release();
  return result;
}

async function updateHistory(email, genre, akses){
  const conn = await getConnection();
  const result = await executeQuery(conn, `UPDATE history SET jumlah_akses = ${akses} WHERE email = '${email}' AND genre = '${genre}'`);
  conn.release();
  return result;
}

//MING - Add post
async function insertPost(email, judul_post, caption_post, app_id){
  const conn = await getConnection();
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  const result = await executeQuery(conn, `INSERT INTO post VALUES ('','${email}',0,0,'${dateTime}','${judul_post}','${caption_post}','none','${app_id}')`);
  conn.release();
  return result;
}

async function updateLast(email, judul_post, caption_post, app_id){
  const conn = await getConnection();
  const tgl_now = new Date();
  const lastPost = await executeQuery(conn, `SELECT MAX(id_post) as id_post FROM post`);
  const result = await executeQuery(conn, `UPDATE post SET email='${email}', judul_post='${judul_post}', caption_post='${caption_post}', app_id='${app_id}' WHERE id_post=${lastPost[0].id_post}`);
  conn.release();
  return result;
}

async function insertLastPostIMG(img_path){
  const conn = await getConnection();
  const lastPost = await executeQuery(conn, `SELECT MAX(id_post) as id_post FROM post`);
  const result = await executeQuery(conn, `UPDATE post SET img_path='${lastPost}${img_path}' WHERE id_post=${lastPost[0].id_post} `);
  conn.release();
  return result;
}

async function getLastPost(){
  const conn = await getConnection();
  const lastPost = await executeQuery(conn, `SELECT MAX(id_post) as id_post FROM post`);
  const result = await executeQuery(conn, `SELECT * FROM post WHERE id_post = ${lastPost[0].id_post}`);
  conn.release();
  return result;
}

async function deleteLastPost(){
  const conn = await getConnection();
  const lastPost = await executeQuery(conn, `SELECT MAX(id_post) as id_post FROM post`);
  const result = await executeQuery(conn, `DELETE FROM post WHERE id_post = ${lastPost[0].id_post}`);
  conn.release();
  return result;
}

async function getPost(){
  const conn = await getConnection();
  const result = await executeQuery(conn, `SELECT * FROM post`);
  conn.release();
  return result;
}

module.exports = {
  getUser: getUser,
  getWishlist: getWishlist,
  insertWishlist: insertWishlist,
  deleteWishlist: deleteWishlist,
  getHistory: getHistory,
  insertHistory: insertHistory,
  updateHistory: updateHistory,
  login_user : login_user,
  register_user : register_user,
  update_profile : update_profile,
  upgrade_user : upgrade_user,
  deleteWishlist: deleteWishlist,
  insertPost: insertPost,
  insertLastPostIMG: insertLastPostIMG,
  getLastPost: getLastPost,
  getPost: getPost,
  deleteLastPost: deleteLastPost,
  updateLast: updateLast
}