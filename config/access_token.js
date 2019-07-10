const axios = require("axios")
const { appid, secret } = require("./config")
const url = "https://api.weixin.qq.com/cgi-bin/token"
const param = {
    grant_type: 'client_credential', appid, secret
}
function getAccessToken(cbok) {
    axios.get(url, { params: param }).then(res => {
        cbok(res)
    })
}

module.exports = getAccessToken