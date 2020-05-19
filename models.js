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

module.exports = {
  getUser: getUser,
  getWishlist: getWishlist,
  insertWishlist: insertWishlist,
  deleteWishlist: deleteWishlist,
  getConnection : getConnection
}