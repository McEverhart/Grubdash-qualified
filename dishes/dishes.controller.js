const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// Middleware to check if the dish exists
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
      res.locals.dish = foundDish;
      return next();
    }
    next({ status: 404, message: `Dish id not found: ${dishId}` });
  }
  
  // Middleware to validate dish properties
  function validateDish(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body;
  
    if (!name || name.trim() === "") {
      return next({ status: 400, message: "Dish must include a name" });
    }
    if (!description || description.trim() === "") {
      return next({ status: 400, message: "Dish must include a description" });
    }
    if (price === undefined || price <= 0 || !Number.isInteger(price)) {
      return next({ status: 400, message: "Dish must have a price that is an integer greater than 0" });
    }
    if (!image_url || image_url.trim() === "") {
      return next({ status: 400, message: "Dish must include an image_url" });
    }
    next();
  }
  
  // List dishes
  function list(req, res) {
    res.json({ data: dishes });
  }
  
  // Create a new dish
  function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
      id: nextId(),
      name,
      description,
      price,
      image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
  }
  
  // Read a specific dish
  function read(req, res) {
    res.json({ data: res.locals.dish });
  }
  
  // Update an existing dish
  function update(req, res, next) {
    const dish = res.locals.dish;
    const { data: { id, name, description, price, image_url } = {} } = req.body;
  
    // Ensure id from the body matches the dishId in the URL if provided
    if (id && id !== dish.id) {
      return next({ status: 400, message: `Dish id ${id} does not match the URL id ${dish.id}` });
    }
  
    // Update the dish
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
  
    res.json({ data: dish });
  }
  
  module.exports = {
    list,
    create: [validateDish, create],
    read: [dishExists, read],
    update: [dishExists, validateDish, update],
  };