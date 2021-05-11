const header = {
    "typ": "JWT", // 토큰 타입
    "alg": "HS256" // 해싱 알고리즘
}

// Encode to base64
const encodeHeader = new Buffer(JSON.stringify(header)).toString('base64').replace(/=/g," ");
console.log(encodeHeader);

const payload = {
    // registered claims
    "iss": "localhost", // 토큰발급자
    "exp": "1485270000000", // 토근 만료시간 (NumericDate): 항상 현재 시간보다 이후로 설정되어있어야 한다

    // public claims
    "http://localhost/jwt_claims/is_admin": true,

    // private claims
    "userId": "11028373727102",
    "username": "stonehye"
};

const encodePayload = new Buffer(JSON.stringify(payload)).toString('base64').replace(/=/g," ");
console.log(encodePayload);

const crypto = require('crypto');
const signature = crypto.createHmac('sha256', 'secret').update(encodeHeader + '.' + encodePayload).digest('base64').replace(/=/g," ");
console.log(signature);