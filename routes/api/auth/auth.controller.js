const jwt = require('jsonwebtoken')
const User = require('../../../models/user')

/*
    POST /api/auth
    {
        username,
        password
    }
*/

exports.register = (req, res) => {
    const { username, password } = req.body
    let newUser = null
    
    // create a new user if does not exist
    const create = (user) => {
        if (user){
            throw new Error('username exists')
        } else {
            return User.create({username, password})
        }
    }

    // count the number of the user
    const count = (user) => {
        newUser = user
        return User.countDocuments({}).exec()
    }

    // assign admin if count is 1
    const assign = (count) => {
        if (count == 1){
            return newUser.assignAdmin()
        } else {
            // if not, return a promise that returns false
            return Promise.resolve(false)
        }
    }

    // respond to the client
    const respond = (isAdmin) => {
        res.json({
            message: 'registered successfully',
            admin: isAdmin? true : false
        })
    }

    // run when there is an error (username exists)
    const onError = (error) => {
        res.status(409).json({
            message: error.message
        })
    }

    // CHECK USERNAME DUPLICATION
    User.findOneByUsername(username)
    .then(create)
    .then(count)
    .then(assign)
    .then(respond)
}

/*
    POST /api/auth/login
    {
        username,
        password
    }
*/

exports.login = (req, res) => {
    const {username, password} = req.body
    const secret = req.app.get('jwt-secret')

    // check the user info & generate the jwt
    const check = (user) =>{
        if (!user){
            // user does not exist
            throw new Error('login failed')
        } else {
            if (user.verify(password)){
                // create a promise that generates jwt asynchronously
                const p = new Promise ((resolve, reject) => {
                    jwt.sign( // JWT 발급: 비동기함수이므로 check 내 새 Promise 작성
                        {
                            _id: user._id,
                            username: user.username,
                            admin: user.admin
                        },
                        secret,
                        {
                            expiresIn: '7d', // JWT 의 등록된 클레임중 exp 값을 x 초후 혹은 rauchg/ms 형태의 기간 후로 설정
                            issuer: 'localhost',
                            subject: 'userInfo'
                        }, (err, token) => { // jwt.sign callback
                            if (err) reject (err)
                            resolve(token)
                        }
                    )
                })
                return p
            } else {
                throw new Error('login failed')
            }
        }
    }
    
    // respond the token
    const respond = (token) => {
        res.json({
            message: 'logged in successfully',
            token
        })
    }

    // error occured
    const onError = (error) => {
        res.status(403).json({
            message: error.message
        })
    }

    // FIND THE USER
    User.findOneByUsername(username)
    .then(check)
    .then(respond)
    .catch(onError)

    // res.send('login api is working')
}

/*
    GET /api/auth/check
*/

// exports.check = (req, res) => {
//     // read the token from header or url
//     const token = req.headers['x-access-token'] || req.query.token

//     // token does not exist
//     if (!token) {
//         return res.status(403).json({
//             success: false,
//             message: 'not logged in'
//         })
//     }

//     // create a promise that decodes the token
//     const p = new Promise(
//         (resolve, reject) => {
//             jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
//                 if (err) reject (err)
//                 resolve(decoded)
//             })
//         }
//     )

//     // if token is valid, it will respond with its info
//     const respond = (token) => {
//         res.json({
//             success: true,
//             info: token
//         })
//     }

//     // if it has failed to verify, it will return an error message
//     const onError = (error) => {
//         res.status(403).json({
//             success: false,
//             message: error.message
//         })
//     }

//     p.then(respond).catch(onError)
// }

/*
    GET /api/auth/check
*/

exports.check = (req, res) => {
    res.json({
        success: true,
        info: req.decoded
    })
}
// 토큰 검증에 실패했을 때 auth.js promise의 next()함수가 실행되지 않음
// => check 함수 내부에서 토근 검증 실패 고려하지 않아도 됨