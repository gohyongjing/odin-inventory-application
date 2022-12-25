const async = require("async");
const { body, validationResult } = require("express-validator");
const Category = require("../models/category");
const Item = require("../models/item");

// Display list of all categories.
exports.category_list = function(req, res, next) {
  Category.find({}, "name")
    .sort({ name: 1 })
    .exec(function (err, list_categories) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render(
        "category_list",
        { title: "Category List", category_list: list_categories }
      );
    });
};

// Display detail page for a specific category.
exports.category_detail = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items(callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("category_detail", {
        title: "Category Detail",
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

// Display category create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render("category_form", { title: "Create Category" });
};

// Handle category create on POST.
exports.category_create_post = [
  // Validate and sanitize the name and description field.
  body("name", "Category name must be between 1 and 10000 characters")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .escape(),
  body("description", "Category description must be between 1 and 10000 characters")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    const category = new Category({
      name: req.body.name,
      description: req.body.description
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Create Category",
        category,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid.
      // Check if category with same name already exists.
      Category.findOne({ name: req.body.name }).exec((err, found_category) => {
        if (err) {
          return next(err);
        }

        if (found_category) {
          // Category exists, redirect to its detail page.
          res.redirect(found_category.url);
        } else {
          category.save((err) => {
            if (err) {
              return next(err);
            }
            // Category saved. Redirect to category detail page.
            res.redirect(category.url);
          });
        }
      });
    }
  },
];

// Display category delete form on GET.
exports.category_delete_get = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items(callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        res.redirect("/catalog/categories");
      } else {
        // Successful, so render.
        res.render("category_delete", {
          title: "Delete Category",
          category: results.category,
          category_items: results.category_items,
        });
      }
    }
  );
};

// Handle category delete on POST.
exports.category_delete_post = (req, res, next) => {
async.parallel(
    {
      category(callback) {
        Category.findById(req.body.id).exec(callback);
      },
      category_items(callback) {
        Item.find({ category: req.body.id }).exec(callback);
      },

    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.category_items.length > 0) {
        // Category has items. Render in same way as for GET route.
        res.render("category_delete", {
          title: "Delete Category",
          category: results.category,
          category_items: results.category_items,
        });
        return;
      }
      // Category has no items. Delete object and redirect to the list of categories.
      Category.findByIdAndRemove(req.body.id, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to author list
        res.redirect("/catalog/categories");
      });
    }
  );
};

// Display category update form on GET.
exports.category_update_get = (req, res, next) => {
// Get category for form.
    Category.findById(req.params.id).exec((err, category) => {
      if (err) {
        return next(err);
      }
      if (category == null) {
        // No results.
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("category_form", {
        title: "Update Category",
        category: category,
      });
    });
};

// Handle category update on POST.
exports.category_update_post = [
  // Validate and sanitize fields.
  body("name", "Category name must be between 1 and 10000 characters")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .escape(),
  body("description", "Category description must be between 1 and 10000 characters")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped/trimmed data and old id.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Update Category",
        category,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Update the record.
      Category.findByIdAndUpdate(req.params.id, category, {}, (err, thecategory) => {
        if (err) {
          return next(err);
        }
        // Successful: redirect to book detail page.
        res.redirect(thecategory.url);
      });
    }
  },
];

