const express = require('express')
const bcrypt = require('bcrypt')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('User')

const { isValidString, isValidPassword } = require('../utils/validUtils')
const appError = require('../utils/appError')
const { generateJWT } = require('../utils/jwtUtils')

const saltRounds = 10

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!isValidString(name) || !isValidString(email) || !isValidString(password)) {
      next(appError(400, "欄位未填寫正確"))
      return
    }
    if(!isValidPassword(password)) {
      next(appError(400, "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"))
      return
    }
    const userRepository = dataSource.getRepository('User')
    const existingUser = await userRepository.findOne({
      where: {
        email
      }
    })
    if (existingUser) {
      next(appError(409, "Email 已被使用"))
      return
    }
    
    const hashPassword = await bcrypt.hash(password, saltRounds)

    const newUser = userRepository.create({
      name,
      password: hashPassword,
      email,
      role: 'user'
    })
    const result = await userRepository.save(newUser);

    res.status(201).json({
      status : "success",
      data: {
        user: {
          id: result.id,
          name: result.name
        }
      }
    })
  } catch (error) {
  logger.error(error)
  next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!isValidString(email) ||! isValidString(password)) {
      next(appError(400, "欄位未填寫正確"))
      return
    }
    if(!isValidPassword(password)) {
      next(appError(400, "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"))
      return
    }

    
    const userRepo = dataSource.getRepository('User')
    const findUser = await userRepo.findOne({
      select: ['id', 'name', 'password'],
      where: {
        email
      }
    })
    if (!findUser) {
      next(appError(400, "使用者不存在或密碼輸入錯誤"))
      return
    }

    const isPasswordMatch = await bcrypt.compare(password, findUser.password)
    if (!isPasswordMatch) {
      next(appError(400, "使用者不存在或密碼輸入錯誤"))
      return
    }

    // 產生 JWT token
    const token = generateJWT({
      id: findUser.id,
      role: findUser.role
    })
    
    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: {
          name: findUser.name
        }
      }
    })
  } catch (error) {
    logger.error('登入錯誤:', error)
    next(error)
  }
})

module.exports = router