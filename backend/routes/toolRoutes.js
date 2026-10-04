const express = require('express');
const protect = require('../middleware/authMiddleware');
const { createTool, getTools, getToolById, getMyTools, updateTool, deleteTool } = require('../controllers/toolController');
const upload = require('../config/multer');
const { uploadToolImages } = require('../controllers/toolController');



const router = express.Router();

router.post('/', protect, createTool);
router.get('/', getTools);
router.get('/my-tools', protect, getMyTools);
router.get('/:id', getToolById);
router.put('/:id', protect, updateTool);
router.delete('/:id', protect, deleteTool);
router.post('/:id/images', protect, upload.array('images', 5), uploadToolImages);

module.exports = router;