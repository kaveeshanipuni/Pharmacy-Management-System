const Medicine = require('../models/Medicine');

// @desc    Get all medicines with search, category filter, sort, and pagination
// @route   GET /api/medicines
// @access  Public
const getMedicines = async (req, res, next) => {
  try {
    const { search, category, sort, page = 1, limit = 12 } = req.query;

    const query = {};

    // Search by name or description (case-insensitive substring match)
    if (search && search.trim() !== '') {
      const sanitized = search.trim();
      query.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      query.category = category.trim();
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest first
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'name-asc') {
      sortOptions = { name: 1 };
    } else if (sort === 'name-desc') {
      sortOptions = { name: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const [total, medicines, categories] = await Promise.all([
      Medicine.countDocuments(query),
      Medicine.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Medicine.distinct('category'),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      medicines,
      page: pageNum,
      totalPages,
      total,
      limit: limitNum,
      categories: categories.sort(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single medicine by ID
// @route   GET /api/medicines/:id
// @access  Public
const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    return res.status(200).json(medicine);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new medicine
// @route   POST /api/medicines
// @access  Admin
const createMedicine = async (req, res, next) => {
  try {
    const { name, category, price, stock, expiryDate, description, imageUrl } = req.body;

    const medicine = await Medicine.create({
      name,
      category,
      price: Number(price),
      stock: parseInt(stock, 10),
      expiryDate,
      description: description || '',
      imageUrl: imageUrl && imageUrl.trim() !== ''
        ? imageUrl.trim()
        : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    });

    return res.status(201).json({
      message: 'Medicine created successfully',
      medicine,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing medicine
// @route   PUT /api/medicines/:id
// @access  Admin
const updateMedicine = async (req, res, next) => {
  try {
    const { name, category, price, stock, expiryDate, description, imageUrl } = req.body;

    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    medicine.name = name !== undefined ? name : medicine.name;
    medicine.category = category !== undefined ? category : medicine.category;
    medicine.price = price !== undefined ? Number(price) : medicine.price;
    medicine.stock = stock !== undefined ? parseInt(stock, 10) : medicine.stock;
    medicine.expiryDate = expiryDate !== undefined ? expiryDate : medicine.expiryDate;
    medicine.description = description !== undefined ? description : medicine.description;
    medicine.imageUrl = imageUrl !== undefined ? imageUrl : medicine.imageUrl;

    const updatedMedicine = await medicine.save();

    return res.status(200).json({
      message: 'Medicine updated successfully',
      medicine: updatedMedicine,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medicine (Safe delete)
// @route   DELETE /api/medicines/:id
// @access  Admin
const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    await Medicine.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: 'Medicine deleted successfully',
      deletedId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};
