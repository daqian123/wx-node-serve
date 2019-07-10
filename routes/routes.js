const user = require('../controllers/user')
const express = require('express')
const router = express.Router()
//用户登录
router.post('/login', user.login)
//用户注册
router.post('/register', user.register)
//编辑用户
router.post('/update', user.editUser)
//小程序登录
router.post('/wx_login', user.wx_login)
//生成小程序码
router.get('/wx_code', user.wx_code)
module.exports = router