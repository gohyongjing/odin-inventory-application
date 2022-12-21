#! /usr/bin/env node

console.log('This script populates some test items and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/?retryWrites=true&w=majority');

const async = require('async')
const mongoose = require('mongoose');
const Item = require('./models/item')
const Category = require('./models/category')

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = []
var categories = []

function itemCreate(name, description, category, price, number_in_stock, callback) {
  itemdetail = {
    name: name,
    description: description,
    category: category,
    price: price,
    number_in_stock: number_in_stock
  }
  var item = new Item(itemdetail);

  item.save(function (err) {
    if (err) {
      callback(err, null)
      return
    }
    console.log('New Item: ' + item);
    items.push(item)
    callback(null, item)
  });
}

function categoryCreate(name, description, callback) {
  var category = new Category({ name: name, description: description });

  category.save(function (err) {
    if (err) {
      callback(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category)
    callback(null, category);
  });
}

function createCategories(cb) {
  async.series(
    [
      function(callback) {
        categoryCreate('Food', 'Edible Items containing nutrients', callback);
      },
      function(callback) {
        categoryCreate('Toy', 'Items to play with for enjoyment and leisure', callback);
      },
      function(callback) {
        categoryCreate('Stationery', 'Writing and office materials', callback);
      },
      function(callback) {
        categoryCreate('Furniture', 'Home items placed in a room to aid living or working in', callback);
      },
    ],
    // optional callback
    cb
  );
}

function createItems(cb) {
  async.parallel(
    [
      function(callback) {
        itemCreate('Ramen', 'Japanese Noodles in thick broth', categories[0], 12, 10, callback);
      },
      function(callback) {
        itemCreate('Chicken Rice', 'Chopped Roasted chicken with fragrant rice', categories[0], 3, 20, callback);
      },
      function(callback) {
        itemCreate('Carrot Cake', 'White raddish glutinous rice flour with egg', categories[0], 3, 15, callback);
      },
      function(callback) {
        itemCreate('Sushi', 'Vinegared rice with seafood wrapped in seadweed', categories[0], 4, 8, callback);
      },
      function(callback) {
        itemCreate('Steak', 'A grilled slice of meat', categories[0], 22, 6, callback);
      },
      function(callback) {
        itemCreate('Lego Set', 'Toy bricks for building and construction', categories[1], 15, 4, callback);
      },
      function(callback) {
        itemCreate('Clay Figurine', 'A small sculpture respesenting a character or animal', categories[1], 5, 0, callback);
      },
      function(callback) {
        itemCreate('Drawing Kit', 'A set of tools required for creating art', categories[1], 3, 5, callback);
      },
      function(callback) {
        itemCreate('Pen', 'A handheld tool for writing with ink', categories[2], 1.2, 30, callback);
      },
      function(callback) {
        itemCreate('Pencil', 'A handheld tool for writing or sketches with erasable graphite', categories[2], 0.8, 15, callback);
      },
      function(callback) {
        itemCreate('Eraser', 'A piece of rubber used to erase pencil marks', categories[2], 0.5, 10, callback);
      },
      function(callback) {
        itemCreate('Ruler', 'A tool used to measure short distances on paper', categories[2], 0.5, 13, callback);
      },
      function(callback) {
        itemCreate('Table', 'A supporting structure to place things at chest level', categories[3], 65, 6, callback);
      },
      function(callback) {
        itemCreate('Chair', 'A supporting structure to sit on', categories[3], 45, 14, callback);
      },
      function(callback) {
        itemCreate('Sofa', 'A comfortable and relaxing structure to sit on', categories[3], 380, 4, callback);
      },
      function(callback) {
        itemCreate('Cupboard', 'A structure to hold and keep items when not in use', categories[3], 80, 8, callback);
      },
      function(callback) {
        itemCreate('Bed', 'A supporting structure to sleep in for rest', categories[3], 540, 2, callback);
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [
    createCategories,
    createItems,
  ],
  // optional callback
  function(err, results) {
    if (err) {
      console.log('final err: ' + err);
    }
    else {
      console.log('items: ' + items);
    }
    // all done, disconnect from database
    mongoose.connection.close();
  }
);

