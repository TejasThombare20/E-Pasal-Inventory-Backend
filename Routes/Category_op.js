const express = require("express");
const router = express.Router();
const Category = require("../Module/Category/Category");

// POST request to add a new category with sections and subsections
router.post("/categories", async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the category with the same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const newCategory = await Category.create({ name });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ error: "Failed to create category" });
  }
});

// add new sections and subsections to a category


router.post('/addSection/:categoryId', async (req, res) => {
  try {
    const { sectionName } = req.body;
    const categoryId = req.params.categoryId;

    // Find the category by ID
    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Create a new section object
    const newSection = {
      name: sectionName,
      subsections: []
    };

    // Push the new section object to the sections array
    existingCategory.sections.push(newSection);

    // Save the updated category
    await existingCategory.save();

    res.status(200).json(existingCategory);
      //  res.status(200).json(newSection)
  } catch (error) {
    console.error('Error adding section:', error);
    res.status(400).json({ error: error.message });
  }
});



// POST request to add new subsections to an existing section within a category
router.post(
  "/categories/:categoryId/sections/:sectionId/subsections",
  async (req, res) => {
    try {
      const { categoryId, sectionId } = req.params;
      const { subsection } = req.body;

      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      const section = category.sections.find(
        (sec) => sec._id.toString() === sectionId
      );
      if (!section) {
        return res.status(400).json({ error: "Section not found" });
      }

      section.subsections.push(subsection);
      await category.save();

      res
        .status(200)
        .json({ message: "Subsection added successfully", subsection });
    } catch (error) {
      res.status(400).json({ error: "Failed to add subsection" });
    }
  }
);
// Fetch all categories
router.get("/getcategories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Fetch sections of a specific category
router.get("/:categoryId/sections", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId).populate("sections");

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const sections = category.sections;
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sections" });
  }
});

// GET request to fetch the subsections of a specific section
router.get("/:categoryId/sections/:sectionId/subsections", async (req, res) => {
  try {
    const { categoryId, sectionId } = req.params;

    // Find the category by ID
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Find the section within the category
    const section = category.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({ error: "Section not found" });
    }

    const subsections = section.subsections;
    res.json({ subsections });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subsections" });
  }
});

// update existing category with their sectiona and subsection
router.put("/updateCategory/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update category" });
  }
});
//  update the section
// Update a section's name
router.put("/:categoryId/updateSection/:sectionId", async (req, res) => {
  const { categoryId, sectionId } = req.params;
  const { name } = req.body;

  try {
    const updatedCategory = await Category.findOneAndUpdate(
      {
        _id: categoryId,
        "sections._id": sectionId,
      },
      { $set: { "sections.$.name": name } },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category or Section not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to update section", message: error.message });
  }
});

// Update a subsection's name

router.put(
  "/:categoryId/updateSubsection/:sectionId/:subsectionIndex",
  async (req, res) => {
    const { categoryId, sectionId, subsectionIndex } = req.params;
    const { newSubsectionName } = req.body;

    try {
      const updatedCategory = await Category.findOneAndUpdate(
        {
          _id: categoryId,
          "sections._id": sectionId,
        },
        {
          $set: {
            [`sections.$.subsections.${subsectionIndex}`]: newSubsectionName,
          },
        },
        { new: true }
      );

      if (!updatedCategory) {
        return res.status(404).json({ error: "Category or Section not found" });
      }

      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Failed to update subsection", message: error.message });
    }
  }
);

// delete a category
router.delete('/categories/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete the category
    await Category.findByIdAndRemove(categoryId);

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE request to delete a section of a category by ID and section ID
router.delete("/:categoryId/sections/:sectionId", async (req, res) => {
  try {
    const { categoryId, sectionId } = req.params;

    // Find the category by ID
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Find the section within the category
    const sectionIndexToDelete = category.sections.findIndex(
      (section) => section._id.toString() === sectionId
    );
    if (sectionIndexToDelete === -1) {
      return res.status(404).json({ error: "Section not found" });
    }

    // Remove the section from the category's sections array using .pull()
    category.sections.pull(category.sections[sectionIndexToDelete]._id);
    await category.save();

    res.status(200).json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete section" });
  }
});

router.delete(
  "/:categoryId/sections/:sectionId/subsections/:subsectionIndex",
  async (req, res) => {
    try {
      const { categoryId, sectionId, subsectionIndex } = req.params;

      // Find the category by ID
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Find the section within the category
      const section = category.sections.id(sectionId);
      if (!section) {
        return res.status(404).json({ error: "Section not found" });
      }

      // Remove the subsection from the section's subsections array using .splice()
      section.subsections.splice(subsectionIndex, 1);
      await category.save();

      res.status(200).json({ message: "Subsection deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete subsection" });
    }
  }
);

module.exports = router;
