const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('skill')
const { isValidString } = require('../utils/validUtils')
const appError = require('../utils/appError')

const skillController = {
  async getSkills (req, res, next)  {
    const data = await dataSource.getRepository("Skill").find({
      select: ["id", "name"]
    })
    res.status(200).json({
      status: "success",
      data: data
    })
  },

  async postSkill (req, res, next)  {
    const { name } = req.body;
    
    if (!isValidString(name)) {
      return next(appError(400, "欄位未填寫正確"))
    }

    const skillRepo = dataSource.getRepository("Skill")
    const isExist = await skillRepo.findOne({
      where: {
        name: name
      }
    })
    if (isExist) {
      return next(appError(409, "資料重複"))
    }

    const newSkill = skillRepo.create({
      name
    })

    const result = await skillRepo.save(newSkill)

    res.status(200).json({
      status: "success",
      data: result
    })
  },

  async deleteSkill (req, res, next)  {
    const { skillId } = req.params;

    if (!isValidString(skillId)) {
      return next(appError(400, "ID錯誤"))
    }

    const result = await dataSource.getRepository("Skill").delete(skillId);
    if (result.affected === 0) {
      return next(appError(400, "ID錯誤"))
    }
    res.status(200).json({
      status: "success",
    })
  }
}

module.exports = skillController