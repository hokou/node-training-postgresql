const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('User')
const { isValidString, isValidPassword } = require('../utils/validUtils')
const appError = require('../utils/appError')
const bcrypt = require('bcrypt')
const { generateJWT } = require('../utils/jwtUtils')

const saltRounds = 10

const usersController = {
  async postSignup (req, res, next)  {
    const { name, email, password } = req.body;
    if (!isValidString(name) || !isValidString(email) || !isValidString(password)) {
      return next(appError(400, "欄位未填寫正確"))
    }
    if(!isValidPassword(password)) {
      return next(appError(400, "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"))
    }
    const userRepository = dataSource.getRepository('User')
    const existingUser = await userRepository.findOne({
      where: {
        email
      }
    })
    if (existingUser) {
      return next(appError(409, "Email 已被使用"))
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
  },

  async postLogin (req, res, next)  {
    const { email, password } = req.body;
    if (!isValidString(email) ||! isValidString(password)) {
      return next(appError(400, "欄位未填寫正確"))
    }
    if(!isValidPassword(password)) {
      return next(appError(400, "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"))
    }

    
    const userRepo = dataSource.getRepository('User')
    const findUser = await userRepo.findOne({
      select: ['id', 'name', 'password'],
      where: {
        email
      }
    })
    if (!findUser) {
      return next(appError(400, "使用者不存在或密碼輸入錯誤"))
    }

    const isPasswordMatch = await bcrypt.compare(password, findUser.password)
    if (!isPasswordMatch) {
      return next(appError(400, "使用者不存在或密碼輸入錯誤"))
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
  },

  async getProfile (req, res, next)  {
    const { id } = req.user
    if(!isValidString(id)) {
      return next(appError(400, "欄位未填寫正確"))
    }

    const userRepo = dataSource.getRepository('User')
    const findUser = await userRepo.findOne({
      where: {
        id
      }
    })
    if (!findUser) {
      return next(appError(400, "使用者不存在"))
    }

    res.status(200).json({
      status: 'success',
      data: {
        email: findUser.email,
        name: findUser.name
      }
    })
  },

  async putProfile (req, res, next)  {
    const { id } = req.user
    const { name } = req.body
    if (!isValidString(name)) {
      return next(appError('400', '欄位未填寫正確'))
    }
    const userRepo = dataSource.getRepository('User')

    const findUser = await userRepo.findOne({
      where: {
        id
      }
    })
    if (findUser.name === name) {
      return next(appError(400, "使用者名稱未變更"))
    }

    const updateUser = await userRepo.update({
      id
    }, {
      name
    })
    if (updateUser.affected === 0) {
      return next(appError(400, "更新使用者失敗"))
    }
    
    res.status(200).json({
      status: 'success',
    })
  }
}

module.exports = usersController