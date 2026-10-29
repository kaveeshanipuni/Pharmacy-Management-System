const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateMedicine } = require('../middleware/validate');

// Public routes
router.get('/', getMedicines);
router.get('/:id', getMedicineById);

// Admin only routes
router.post('/', protect, adminOnly, validateMedicine, createMedicine);
router.put('/:id', protect, adminOnly, validateMedicine, updateMedicine);
router.delete('/:id', protect, adminOnly, deleteMedicine);

module.exports = router;
