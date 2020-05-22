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
      let query  = `insert into user values('','${username}','${password}','${email}','default.jpg')`;
      const result = await executeQuery(conn, query);
      conn.release();
      return result;
    }
}

//query untuk login
async function login_user(email, password){
    const conn = await getConnection();
    var key = "";
    var kembar = true;
    for(var i =0;i<10;i++){
        let angka = Math.floor(Math.random() * 10);
        key += angka;
    }
    let query  = `select * from user where email = '${email}' and password = '${password}'`;
    var result = await executeQuery(conn, query);
    if(result.length>0){
        let query  = `select * from user`;
        let result = await executeQuery(conn, query);
          while(kembar == true){
            kembar = false;
            result.forEach(element => {
                if(result.login_key == key){
                    kembar = true;
                    key = "";
                    for(var i =0;i<10;i++){
                        let angka = Math.floor(Math.random() * 10);
                        key += angka;
                    }
                }
            });
        }
        query = `update user set api_key = '${key}' where email = '${email}'`
        await executeQuery(conn,query);
        conn.release()
        return key;
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
  getConnection : getConnection,
  login_user : login_user,
  register_user : register_user,
  update_profile : update_profile,
  deleteWishlist: deleteWishlist
}