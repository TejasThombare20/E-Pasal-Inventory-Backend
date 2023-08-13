const express = require('express');
const router = express.Router();
const Category = require('../Module/Category/Category');

// POST request to add a new category with sections and subsections
router.post('/categories', async (req, res) => {
  try {
    const { name, sections } = req.body;

    // Check if the category with the same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    // Check for duplicate sections and subsections
    const sectionNames = new Set();
    const subsectionNames = new Set();

    for (const section of sections) {
      if (sectionNames.has(section.name)) {
        return res.status(400).json({ error: `Duplicate section name: ${section.name}` });
      }
      sectionNames.add(section.name);

      for (const subsection of section.subsections) {
        if (subsectionNames.has(subsection)) {
          return res.status(400).json({ error: `Duplicate subsection name: ${subsection}` });
        }
        subsectionNames.add(subsection);
      }
    }

    const newCategory = await Category.create({ name, sections });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create category' });
  }
});


// POST request to add a new section with subsections to an existing category
router.post('/categories/:categoryId/sections', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, subsections } = req.body;

    // Find the existing category by ID
    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check for duplicate section name
    const isDuplicateSection = existingCategory.sections.some(
      (section) => section.name === name
    );
    if (isDuplicateSection) {
      return res.status(400).json({ error: 'Duplicate section name' });
    }

    // Add the new section with subsections to the existing category
    existingCategory.sections.push({ name, subsections });
    await existingCategory.save();

    res.status(201).json(existingCategory);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add section' });
  }
});

// POST request to add new subsections to an existing section within a category
router.post('/categories/:categoryId/sections/:sectionId/subsections', async (req, res) => {
  try {
    const { categoryId, sectionId } = req.params;
    const { subsections } = req.body;

    // Find the existing category by ID
    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Find the existing section by ID within the category
    const existingSection = existingCategory.sections.id(sectionId);
    if (!existingSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Add the new subsections to the existing section
    existingSection.subsections.push(...subsections);
    await existingCategory.save();

    res.status(201).json(existingCategory);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add subsections' });
  }
});







module.exports = router;
