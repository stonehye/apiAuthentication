const router = require('express').Router()
const controller = require('./user.controller')

// 모든 api들이 JWT 토큰 검증 필요 -> routes/api/index.js 파일에서 적용
router.get('/list', controller.list)
router.get('/assign-admin/:username', controller.assignAdmin)

module.exports = router