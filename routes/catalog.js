const express = require("express");
const router = express.Router();

// Require controller modulesconsole
const console_controller = require("../controllers/consoleController");
const developer_controller = require("../controllers/developerController");
const game_controller = require("../controllers/gameController");
const genre_controller = require("../controllers/genreController.js");
const publisher_controller = require("../controllers/publisherController");

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
//router.get("/genre/create", genre_controller.createGenreGet);

//POST request for creating Genre.
router.post("/genre/create", genre_controller.createGenrePost);

// GET request to delete Genre.
//router.get("/genre/:id/delete", genre_controller.deleteGenreGet);

// POST request to delete Genre.
router.post("/genre/:id/delete", genre_controller.deleteGenrePost);

// GET request to update Genre.
//router.get("/genre/:id/update", genre_controller.updateGenreGet);

// POST request to update Genre.
router.post("/genre/:id/update", genre_controller.updateGenrePost);

// GET request for one Genre.
router.get("/genre/:id", genre_controller.genreDetail);

// GET request for list of all Genre.
router.get("/genre", genre_controller.genreList);

module.exports = router;
