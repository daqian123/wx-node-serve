const CONF = {
    port: '8082',
    rootPathname: 'root',
    serverHost: "localhost",//服务器路径
    secret: 'c9a0a75d2fe5d09147d75122db2b7df4',//小程序 appSecret
    appid: 'wxd70f716cbffe135a',//小程序 appId
    appSecret: 'secret',// 微信小程序 App Secret
    /**
     * MySQL 配置，用来存储 session 和用户信息
     * 若使用了腾讯云微信小程序解决方案
     * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
     */
    mysql: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        database: 'node_test',
        password: '123456',
        charset: 'utf8mb4'
    },
    cos: {
        /**
         * 地区简称
         * @查看 https://cloud.tencent.com/document/product/436/6224
         */
        region: 'ap-guangzhou',
        // Bucket 名称
        fileBucket: 'qcloudtest',
        // 文件夹
        uploadFolder: ''
    },
    // 微信登录态有效期
    wxLoginExpires: 7200,
    wxMessageToken: 'abcdefgh'
}

module.exports = CONF
