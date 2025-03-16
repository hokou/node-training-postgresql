const express = require('express')

const router = express.Router()

const isAuth = require('../middlewares/isAuth')
const handleErrorAsync = require('../utils/handleErrorAsync')
const usersController = require('../controllers/users')

router.post('/signup', handleErrorAsync(usersController.signup))

router.post('/login', handleErrorAsync(usersController.login))

router.get('/profile', isAuth, handleErrorAsync(usersController.getProfile))

router.put('/profile', isAuth, handleErrorAsync(usersController.putProfile))

module.exports = router