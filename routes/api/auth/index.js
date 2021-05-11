const router = require('express').Router()
const controller = require('./auth.controller') // 경로 확인

router.post('/register', controller.register)

module.exports = router