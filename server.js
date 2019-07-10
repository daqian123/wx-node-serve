const express = require("express")
const app = express()
const port = process.env.PORT || 8082;
const history = require('connect-history-api-fallback');
//验证请求
const passport = require('passport');
const router = require('./routes/routes')
//路由中间件
const bodyParser = require('body-parser');
const mysql = require('mysql')
const { mysql: config } = require('./config/config')
//创建mysql连接
const connection = mysql.createConnection(config)
connection.connect();
console.log('连接成功')
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
// app.use(history())
// 使用body-parser中间件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//初始化passport
// app.use(passport.initialize());
//使用session保持持久会话
// app.use(passport.session());
// require('./config/passport')(passport);
app.use("/user", router)