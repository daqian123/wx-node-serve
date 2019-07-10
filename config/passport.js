const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const queryUser = require('../tools/userSql')

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "secret"
module.exports = passport => {
    new JwtStrategy(opts, (jwt_payload, done) => {
        console.log("result" + jwt_payload)
        queryUser('id_queryUser', [jwt_payload.id], result => {
            console.log("result" + result)
            if (result.length != 0) {
                return done(null, result);
            }
            return done(null, false);
        })
    })
    // passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    //     console.log("result" + jwt_payload)
    //     queryUser('id_queryUser', [jwt_payload.id], result => {
    //         console.log("result" + result)
    //         if (result.length != 0) {
    //             return done(null, result);
    //         }
    //         return done(null, false);
    //     })
    // }));
}