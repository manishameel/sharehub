const Tool = require('../models/Tool');

const createTool = async (req, res) => {
  try {
    const { title, description, category, pricePerDay, securityDeposit, availableFrom, availableTo } = req.body;

    const tool = await Tool.create({
      owner: req.user._id,
      title,
      description,
      category,
      pricePerDay,
      securityDeposit,
      availableFrom,
      availableTo
    });

    res.status(201).json(tool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTools = async (req, res) => {
  try {
    const tools = await Tool.find({ isActive: true }).populate('owner', 'name email');
    res.status(200).json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getToolById = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id).populate('owner', 'name email');
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    res.status(200).json(tool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyTools = async (req, res) => {
  try {
    const tools = await Tool.find({ owner: req.user._id });
    res.status(200).json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTool = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    if (tool.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this tool' });
    }

    const updatedTool = await Tool.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedTool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTool = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    if (tool.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this tool' });
    }

    await tool.deleteOne();
    res.status(200).json({ message: 'Tool deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadToolImages = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    if (tool.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const imageUrls = req.files.map((file) => file.path);

    tool.images.push(...imageUrls);
    await tool.save();

    res.status(200).json(tool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTool, getTools, getToolById, getMyTools, updateTool, deleteTool, uploadToolImages };