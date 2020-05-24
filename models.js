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
      let query  = `insert into user values('','${username}','${password}','${email}',1,'default.jpg')`;
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
//mungkin tidak dipakai
async function getUser(user_key){
  const conn = await getConnection();
  let query = `SELECT * FROM user WHERE api_key ='${user_key}'`;
  const result = await executeQuery(conn, query);
  conn.release();
  return result;
}

async function getWishlist(user_key, app_id){
  const conn = await getConnection();
  let query = `SELECT * FROM wishlist WHERE api_key ='${user_key}'`;
  if (app_id) query += ` AND app_id = '${app_id}'`;
  const result = await executeQuery(conn, query);
  conn.release();
  return result;
}

async function insertWishlist(user_key, app_id){
  const conn = await getConnection();
  const result = await executeQuery(conn, `INSERT INTO wishlist VALUES ('${user_key}','${app_id}')`);
  conn.release();
  return result;
}

async function deleteWishlist(user_key, app_id){
  const conn = await getConnection();
  const result = await executeQuery(conn, `DELETE FROM wishlist WHERE api_key ='${user_key}' AND app_id = '${app_id}'`);
  conn.release();
  return result;
}

//MING - Add post
async function insertPost(username, judul_post, caption_post, img_path, app_id){
  const conn = await getConnection();
  const tgl_now = new Date();
  const result = await executeQuery(conn, `INSERT INTO post VALUES ('','${username}',0,0,'${tgl_now}','${judul_post}','${caption_post}','${img_path}','${app_id}')`);
  conn.release();
  return result;
}

module.exports = {
  getUser: getUser,
  getWishlist: getWishlist,
  insertWishlist: insertWishlist,
  deleteWishlist: deleteWishlist,
  getConnection : getConnection,
  login_user : login_user,
  register_user : register_user,
  update_profile : update_profile,
  upgrade_user : upgrade_user,
  deleteWishlist: deleteWishlist,
  insertPost: insertPost,
}