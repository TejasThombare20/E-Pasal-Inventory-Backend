const express = require("express");
const router = express.Router();
const Unit = require("../Module/Unit");
const mongoose = require("mongoose");
const Product = require("../Module/Product");
// Create a new quantity
router.post("/addUnit", async (req, res) => {
  try {
    const { name } = req.body;
    const newUnit = new Unit({
      name,
    });
    const savedUnit = await newUnit.save();
    res.status(201).json(savedUnit);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the Unit." });
  }
});

router.put("/updateUnit/:unitId", async (req, res) => {
  try {
    const { name } = req.body;
    const updatedUnit = await Unit.findByIdAndUpdate(
      req.params.unitId,
      { name },
      { new: true }
    );
    if (!updatedUnit) {
      return res.status(404).json({ error: "Unit not found." });
    }
    res.json(updatedUnit);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the unit." });
  }
});

router.delete("/deleteUnit/:unitId", async (req, res) => {
  const { unitId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Product.deleteMany({ unit: unitId }).session(session);

    const deletedUnit = await Unit.findByIdAndRemove(req.params.unitId);

    if (!deletedUnit) {
      return res.status(404).json({ error: "Unit not found." });
    }
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({ message: "Unit deleted successfully." });
  } catch (error) {

    await session.abortTransaction();
    session.endSession();
    
    res
      .status(500)
      .json({ error: "An error occurred while deleting the unit." });
  }
});

// Get all units
router.get("/getAllUnits", async (req, res) => {
  try {
    const units = await Unit.find();
    res.json(units);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching units." });
  }
});
module.exports = router;
