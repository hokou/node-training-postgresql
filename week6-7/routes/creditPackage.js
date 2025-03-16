const express = require('express')

const router = express.Router()

const handleErrorAsync = require('../utils/handleErrorAsync')
const creditPackageController = require('../controllers/creditPackage')

router.get('/', handleErrorAsync(creditPackageController.getCreditPackage));

router.post('/', handleErrorAsync(creditPackageController.postCreditPackage));

router.delete('/:creditPackageId', handleErrorAsync(creditPackageController.deleteCreditPackage));

module.exports = router
