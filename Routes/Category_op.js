const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Category = require("../Module/Category/Category");
const Product = require("../Module/Product");

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

router.post("/addSection/:categoryId", async (req, res) => {
  try {
    const { sectionName } = req.body;
    const categoryId = req.params.categoryId;

    // Find the category by ID
    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Create a new section object
    const newSection = {
      name: sectionName,
      subsections: [],
    };

    // Push the new section object to the sections array
    existingCategory.sections.push(newSection);

    // Save the updated category
    await existingCategory.save();

    res.status(200).json(existingCategory);
    //  res.status(200).json(newSection)
  } catch (error) {
    console.error("Error adding section:", error);
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

      const newsubSection = {
        name: subsection,
      };

      section.subsections.push(newsubSection);
      await category.save();

      res
        .status(200)
        .json({ message: "Subsection added successfully", section });
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
    const { name, previousName } = req.body;

    console.log("previousName: " + previousName);


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
    // console.error(error);
    res
      .status(500)
      .json({ message: "Failed to update category", error: error.message });
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
  "/:categoryId/updateSubsection/:sectionId/:subsectionId",
  async (req, res) => {
    try {
      const { categoryId, sectionId, subsectionId } = req.params;
      const { newSubsectionName } = req.body; //  new name of the subsection  in the request body

      // Find the category by its ID
      const category = await Category.findById(categoryId);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Find the section by its ID
      const section = category.sections.id(sectionId);

      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      console.log("section: " + section);
      // Find the subsection by its ID
      console.log("subsectionId", subsectionId);
      const subsection = section.subsections.id(subsectionId);

      console.log("subsection : ", subsection);
      if (!subsection) {
        return res.status(404).json({ message: "Subsection not found" });
      }

      // Update the subsection name
      subsection.name = newSubsectionName;

      console.log("subsection updated", subsection);

      // Save the updated category
      const updatedCategory = await category.save();

      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error("Error updating subsection:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

// router.put(
//   "/:categoryId/updateSubsection/:sectionId/:subsectionId",
//   async (req, res) => {
//     const { categoryId, sectionId, subsectionId } = req.params;
//     const { newSubsectionName } = req.body;

//     try {
//       const updatedCategory = await Category.findOneAndUpdate(
//         {
//           _id: categoryId,
//           "sections._id": sectionId,
//         },
//         {
//           $set: {
//             [`sections.$.subsections.${subsectionIndex}`]: newSubsectionName,
//           },
//         },
//         { new: true }
//       );

//       if (!updatedCategory) {
//         return res.status(404).json({ error: "Category or Section not found" });
//       }

//       res.status(200).json(updatedCategory);
//     } catch (error) {
//       console.error(error);
//       res
//         .status(500)
//         .json({ error: "Failed to update subsection", message: error.message });
//     }
//   }
// );

// delete a category
// router.delete("/categories/:categoryId", async (req, res) => {
//   try {
//     const categoryId = req.params.categoryId;

//     // Check if the category exists
//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return res.status(404).json({ message: "Category not found" });
//     }

//     // Delete the category
//     await Category.findByIdAndRemove(categoryId);

//     res.status(200).json({ message: "Category deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting category:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

router.delete("/categories/:categoryId", async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Delete products associated with the category

    await Product.deleteMany({ category: categoryId }).session(session);

    // Delete the category
    const DeletedCategory = await Category.findByIdAndDelete(
      categoryId
    ).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Category and associated products deleted successfully",
      DeletedCategory: DeletedCategory,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error deleting category and products:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// DELETE request to delete a section of a category by ID and section ID
router.delete("/:categoryId/sections/:sectionId", async (req, res) => {
  // try {
  const { categoryId, sectionId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
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
      return res.status(404).json({ error: "Section not found in category" });
    }

    // Delete products associated with the section

    await Product.deleteMany({ sections: sectionId }).session(session);

    // Delete the section
    category.sections.splice(sectionIndexToDelete, 1);

    // Save the updated category
    await category.save();

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "section and associated products deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error deleting section and products:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }

  //   // Remove the section from the category's sections array using .pull()
  //   category.sections.pull(category.sections[sectionIndexToDelete]._id);
  //   await category.save();

  //   res.status(200).json({ message: "Section deleted successfully" });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ error: "Failed to delete section" });
  // }
});

router.delete(
  "/:categoryId/sections/:sectionId/subsections/:subsectionId",
  async (req, res) => {
    const { categoryId, sectionId, subsectionId } = req.params;
    
    const session = await mongoose.startSession();
    session.startTransaction();
    // Find the category by ID
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Find the section within the category
      const section = category.sections.find(
        (section) => section._id.toString() === sectionId
      );
      if (!section) {
        return res.status(404).json({ error: "Section not found in category" });
      }

      // Find the index of the subsection to delete
      const subsectionIndexToDelete = section.subsections.findIndex(
        (subsection) => subsection._id.toString() === subsectionId
      );

      if (subsectionIndexToDelete === -1) {
        return res
          .status(404)
          .json({ error: "subsection not found in section" });
      }

      // Delete products associated with the subsection

      await Product.deleteMany({ subsections: subsectionId }).session(session);

      // Remove the subsection from the section's subsections array using .splice()
      if (subsectionIndexToDelete >= 0) {
        section.subsections.splice(subsectionIndexToDelete, 1);
      }

      await category.save();

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: "subsection and associated products deleted successfully",
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error("Error deleting section and products:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

module.exports = router;
