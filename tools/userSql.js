
const mysql = require('mysql')
const { mysql: config } = require('../config/config')
const connection = mysql.createConnection(config)
connection.connect();
function querySql(sqlString, data, cbok) {
    connection.query(sqlString, data, (err, result) => {
        if (err) {
            console.log(err.message)
            return
        }
        cbok(result)
    })
}
function cbSql(method) {
    let sqlString = ""
    switch (method) {
        case 'login':
            sqlString = "select * from user where email=? and password=?"
            break;
        case 'ruleRepeat':
            sqlString = "select * from user where email=?"
            break;
        case 'id_queryUser':
            sqlString = "select * from user where id=?"
            break;
        case 'register':
            sqlString = "INSERT INTO user(username,email,avatar,sex,create_time,nickname,password,openid) values(?,?,?,?,?,?,?,?)"
            break;
        case 'editUser':
            sqlString = 'update user set username=?,email=?,avatar=?,sex=?,nickname=? where id=?'
            break;
        case 'is_newUser':
            sqlString = "select * from user where openid=?"
            break
    }
    return sqlString
}

module.exports = queryUser = (method, data, cbok) => {
    querySql(cbSql(method), data, cbok)
}