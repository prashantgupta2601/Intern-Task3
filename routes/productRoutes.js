const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct
} = require('../controllers/productController');

router.route('/')
    .get(getProducts)
    .post(createProduct);

router.route('/:id')
    .get(getProductById);

module.exports = router;
