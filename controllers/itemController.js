const async = require("async");
const { body, validationResult } = require("express-validator");
const Item = require("../models/item");
const Category = require("../models/category");

exports.index = (req, res) => {
  async.parallel(
    {
      item_count(callback) {
        Item.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      category_count(callback) {
        Category.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Inventry Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all Items.
exports.item_list = function (req, res, next) {
  Item.find({}, "name category")
    .sort({ name: 1 })
    .populate("category")
    .exec(function (err, list_items) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render(
        "item_list",
        { title: "Item List", item_list: list_items }
      );
    });
};

// Display detail page for a specific item.
exports.item_detail = (req, res, next) => {
  Item.findById(req.params.id)
    .populate("category")
    .exec((err, item) => {
      if (err) {
        return next(err);
      }
      if (item == null) {
        // No results.
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("item_detail", {
        name: `Item: ${item.name}`,
        item,
      });
    });
};

// Display item create form on GET.
exports.item_create_get = (req, res, next) => {
  Category.find({}, "name").exec((err, categories) => {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    res.render("item_form", {
      title: "Create Item",
      categories,
    });
  });
};

// Handle item create on POST.
exports.item_create_post = [
  // Validate and sanitize the name and description field.
  body("name", "Item name must be between 1 and 10000 characters")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .escape(),
  body("description", "Item description must be between 1 and 10000 characters")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .escape(),
  body("category")
    .escape(),
  body("price", "Item price must be a non-negative number")
    .isFloat({ min: 0 })
    .toFloat(),
  body("number_in_stock", "Item in stock must be a non-negative integer")
    .isInt({ min: 0 })
    .toInt(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      Category.find({}, "name").exec((err, categories) => {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("item_form", {
          title: "Create Item",
          item,
          categories,
          errors: errors.array(),
        });
      });
    } else {
      // Data from form is valid.
      // Check if item with same name already exists.
      Item.findOne({ name: req.body.name }).exec((err, found_item) => {
        if (err) {
          return next(err);
        }

        if (found_item) {
          // Item exists, redirect to its detail page.
          res.redirect(found_item.url);
        } else {
          item.save((err) => {
            if (err) {
              return next(err);
            }
            // Item saved. Redirect to item detail page.
            res.redirect(item.url);
          });
        }
      });
    }
  },
];


// Display item delete form on GET.
exports.item_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: item delete GET");
};

// Handle item delete on POST.
exports.item_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: item delete POST");
};

// Display item update form on GET.
exports.item_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: item update GET");
};

// Handle item update on POST.
exports.item_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: item update POST");
};

