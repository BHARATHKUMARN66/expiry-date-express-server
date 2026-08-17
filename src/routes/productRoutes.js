const express = require('express');
const { body, query, param } = require('express-validator');
const productController = require('../controllers/productController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

const listValidators = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('expiryFilter').optional().isIn(['1month', '3months', 'expired']).withMessage('Invalid expiry filter value'),
    query('search').optional().isString()
];

const createValidators = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('expiryDate').isISO8601().withMessage('Expiry date must be a valid ISO8601 date'),
    body('category').optional().isIn(['Fridge', 'Pantry', 'Freezer', 'Medicine', 'Other']).withMessage('Invalid category'),
    body('upc').optional().custom((value) => {
        if (value === null || value === '' || typeof value === 'string') return true;
        throw new Error('UPC must be a string or null');
    }),
    body('amount').optional().isString().withMessage('Amount must be a string')
];

const updateValidators = [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid ISO8601 date'),
    body('category').optional().isIn(['Fridge', 'Pantry', 'Freezer', 'Medicine', 'Other']).withMessage('Invalid category'),
    body('upc').optional().custom((value) => {
        if (value === null || value === '' || typeof value === 'string') return true;
        throw new Error('UPC must be a string or null');
    }),
    body('amount').optional().isString().withMessage('Amount must be a string')
];

const deleteValidators = [
    param('id').isMongoId().withMessage('Invalid product ID')
];

// Protect all product routes with authentication
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: jwtToken
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - expiryDate
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 *         userId:
 *           type: string
 *           example: 60d0fe4f5311236168a109c9
 *         title:
 *           type: string
 *           example: Fresh Whole Milk
 *         upc:
 *           type: string
 *           nullable: true
 *           example: "078742351860"
 *         amount:
 *           type: string
 *           example: "1 Gallon"
 *         expiryDate:
 *           type: string
 *           format: date-time
 *           example: 2026-08-25T00:00:00.000Z
 *         category:
 *           type: string
 *           enum: [Fridge, Pantry, Freezer, Medicine, Other]
 *           example: Fridge
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve user's tracked products with pagination, search, and filters
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query matching product title (regex) or barcode UPC (exact)
 *       - in: query
 *         name: expiryFilter
 *         schema:
 *           type: string
 *           enum: [1month, 3months, expired]
 *         description: Filter items expiring in 1 month, 3 months, or already expired
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 *                   example: 12
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 20
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', listValidators, productController.listProducts);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Track a new product
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - expiryDate
 *             properties:
 *               title:
 *                 type: string
 *                 example: Fresh Whole Milk
 *               upc:
 *                 type: string
 *                 example: "078742351860"
 *               amount:
 *                 type: string
 *                 example: "1 Gallon"
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-08-25T00:00:00.000Z
 *               category:
 *                 type: string
 *                 enum: [Fridge, Pantry, Freezer, Medicine, Other]
 *                 example: Fridge
 *     responses:
 *       201:
 *         description: Product added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation errors
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', createValidators, productController.addProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Organic Spinach
 *               upc:
 *                 type: string
 *                 example: "01234567890"
 *               amount:
 *                 type: string
 *                 example: "500g"
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-09-01T00:00:00.000Z
 *               category:
 *                 type: string
 *                 enum: [Fridge, Pantry, Freezer, Medicine, Other]
 *                 example: Pantry
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input or product ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found or unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:id', updateValidators, productController.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Stop tracking / delete a product
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found or unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteValidators, productController.deleteProduct);

module.exports = router;
