const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')
const { isValidString, isNumber } = require('../utils/validUtils')
const appError = require('../utils/appError')

const creditPackageController = {
  async getCreditPackage (req, res, next)  {
    const data = await dataSource.getRepository("CreditPackage").find({
      select: ["id", "name", "credit_amount", "price"]
    })
    res.status(200).json({
      status: "success",
      data: data
    })
  },

  async postCreditPackage (req, res, next)  {
    const {name, credit_amount, price} = req.body;
    
    if (!isValidString(name) || !isNumber(credit_amount) || !isNumber(price)) {
      return next(appError(400, "欄位未填寫正確"))
    }

    const creditPackage = dataSource.getRepository("CreditPackage")
    const isExist = await creditPackage.findOne({
      where: {
        name: name
      }
    })
    if (isExist) {
      return next(appError(409, "資料重複"))
    }

    const newCreditPackage = creditPackage.create({
      name,
      credit_amount,
      price
    })

    const result = await creditPackage.save(newCreditPackage)

    res.status(200).json({
      status: "success",
      data: result
    })
  },

  async deleteCreditPackage (req, res, next)  {
    const { creditPackageId } = req.params;

    if (!isValidString(creditPackageId)) {
      return next(appError(400, "ID錯誤"))
    }

    const result = await dataSource.getRepository("CreditPackage").delete(creditPackageId);
    if (result.affected === 0) {
      return next(appError(400, "ID錯誤"))
    }
    res.status(200).json({
      status: "success",
    })
  }
}

module.exports = creditPackageController