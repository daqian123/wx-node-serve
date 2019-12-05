const queryUser = require('../tools/userSql')
const bcrypt = require("bcryptjs")//生成密码令牌
const jwt = require('jsonwebtoken')//生成token
const gravatar = require('gravatar');//全球公认头像
const axios = require('axios')
const WXBizDataCrypt = require('../lib/WXBizDataCrypt')//加密数据解密
const CONF = require("../config/config")
const getAccessToken = require('../config/access_token');
var fs = require('fs');
const upyun = require('upyun')
const Service = new upyun.Service('bst-upload-images', 'bst100', 'LXbst123++')
const client = new upyun.Client(Service)
let str = fs.createReadStream("C://Users/Administrator/Desktop/index_banner888.png")
// client.putFile('http://test.lexbst.com/index.php/uploader/upload', str).then(res => {
//     console.log(res)
// })
function getTimeDate(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
function getToken(rule, cbok) {
    jwt.sign(rule, CONF.appSecret, { expiresIn: 7200 }, (err, token) => {
        if (err) throw err;
        cbok(token)
    });
}
function ruleToken(token, res, cbok) {
    jwt.verify(token, CONF.appSecret, { ignoreExpiration: false }, function (err, data) {
        if (err) {
            res.send({ message: "token已过期", code: 1 })
            return
        }
        cbok(data.id)
    });
}

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return Buffer.from(bitmap).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64, file) {
    var dataBuffer = Buffer.from(base64, 'base64'); //把base64码转成buffer对象，
    console.log('dataBuffer是否是Buffer对象：' + Buffer.isBuffer(dataBuffer));
    fs.writeFile('aaa555.png', dataBuffer, function (err) {//用fs写入文件
        if (err) {
            console.log(err);
        } else {
            console.log('写入成功！');
        }
    })
}
function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
// 用户信息接口
const user = {
    wx_code(req, res) {
        // console.log(req.body)
        // base64_decode(req.body.base64, 'copy7.jpg');
        getAccessToken(resp => {
            let access_token = resp.data.access_token
            let url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${access_token}`
            let data = { page: 'pages/shop/shop/main', scene: '1', width: '160' }
            axios.post(url, data).then(resp2 => {
                res.json({ message: '请求成功', code: 0, data: resp2.data })
                let str = Buffer.from(resp2.data)
                console.log(str)
                let buffer = Buffer.from(str, 'base64')
                console.log(buffer)
                fs.writeFile('5.png', str, function (err) {//用fs写入文件
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('写入成功！');
                    }
                })

            })
        })
    },
    wx_login(req, res) {
        let create_time = getTimeDate(new Date())

        let password = ""
        for (let index = 0; index < 15; index++) {
            password += parseInt(Math.random() * 10)
        }
        //获取传过来的用户信息
        let { js_code, iv, encryptedData } = req.body
        const param = {
            secret: CONF.secret,//小程序 appSecret
            appid: CONF.appid,//小程序 appId
            js_code,//登录时获取的 code
            grant_type: 'authorization_code'//授权类型
        }
        axios.get('https://api.weixin.qq.com/sns/jscode2session', { params: param }).then(resp => {
            const { openid, session_key, unionid } = resp.data
            let pc = new WXBizDataCrypt(param.appid, session_key)
            //根据openid查询是否是新用户 是新用户 ：默认注册 老用户：登录
            queryUser('is_newUser', [openid], result => {
                if (result.length == 0) {
                    //解析用户加密信息
                    let { nickName: nickname, nickName: username, gender: sex, avatarUrl: avatar } = pc.decryptData(encryptedData, iv)
                    let data = [username, "", avatar, sex, create_time, nickname, password, openid]
                    queryUser('register', data, result => {
                        getToken({ username, avatar, id: result.insertId }, token => {
                            res.set('token', token)
                            res.send({ message: "注册成功", data: { token, username, email: "", avatar, sex, create_time, nickname, password, openid }, code: 0 })
                        })
                    })
                    return
                } else {
                    let { username, avatar, id } = result[0]
                    getToken({ username, avatar, id }, token => {
                        res.set('token', token)
                        res.send({ message: '查询成功', data: Object.assign({}, result[0], { token }), code: 0 })
                    })
                }
            });
        })
    },
    // 登录
    login(req, res) {
        let { email, password } = req.body.param
        console.log(email, password)
        queryUser('ruleRepeat', [email], result => {
            console.log(result)
            if (result.length == 0) {
                res.send({ message: "用户不存在", code: 0, data: {} })
                return
            }
            // 密码匹配
            bcrypt.compare(password, result[0].password).then(isMatch => {
                console.log(isMatch)
                if (isMatch) {
                    const { id, username, email } = result[0]
                    //生成token
                    jwt.sign({ id, username, email }, CONF.appSecret, { expiresIn: 7200 }, (err, token) => {
                        if (err) throw err;
                        res.send({
                            code: 0, message: "请求成功", token: token
                        });
                    });
                } else {
                    return res.status(400).json('密码错误!');
                }
            });
        })
    },
    //注册
    register(req, res) {
        let create_time = getTimeDate(new Date())
        let { username, email, sex, nickname, password } = req.body.param
        console.log(username, email, sex, nickname, password)
        //校验是否重复
        queryUser('ruleRepeat', [email], result => {
            const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm', protocol: 'https' });
            console.log(avatar)
            if (result.length != 0) {
                res.send({ message: "邮箱已被占用", code: 0, data: {} })
                return
            }
            //加密密码
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                    password = hash
                    let data = [username, email, avatar, sex, create_time, nickname, password, { openid: "asdfasdfasdf" }]
                    queryUser('register', data, result => {
                        res.send({ message: "注册成功", data: { info: result.insertId } })
                    })
                });
            });
        })
    },
    //编辑用户
    editUser(req, res) {
        ruleToken(req.headers.token, res, id => {
            console.log('token校验成功')
            let { username, email, avatar, sex, nickname } = req.body
            let data = [username, email, avatar, sex, nickname, id]
            console.log({ username, email, avatar, sex, nickname, id })
            queryUser('editUser', data, result => {
                res.send({ message: "编辑成功", data: { info: result } })
            })
        })
    }
}
module.exports = user
