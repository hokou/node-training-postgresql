const express = require('express')

const router = express.Router()

const handleErrorAsync = require('../utils/handleErrorAsync')
const adminController = require('../controllers/admin')
const isAuth = require('../middlewares/isAuth')
const isCoach = require('../middlewares/isCoach')

router.post('/coaches/courses', isAuth, isCoach, handleErrorAsync(adminController.postCourses))

router.put('/coaches/courses/:courseId', isAuth, isCoach, handleErrorAsync(adminController.putCourses))

router.post('/coaches/:userId', handleErrorAsync(adminController.postCoaches))



module.exports = router