const express = require("express");
const router = express.Router();

// Require controller modulesconsole
const console_controller = require("../controllers/consoleController");
const developer_controller = require("../controllers/developerController");
const game_controller = require("../controllers/gameController");
const genre_controller = require("../controllers/genreController.js");
const publisher_controller = require("../controllers/publisherController");

/// HOME PAGE ///

// GET request for the homepage
router.get("/", genre_controller.index);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get("/genre/create", genre_controller.createGenreGet);

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

/// GAME ROUTES ///

// GET request for creating a Game. NOTE This must come before route that displays Game (uses id).
//router.get("/game/create", game_controller.createGameGet);

//POST request for creating Game.
router.post("/game/create", game_controller.createGamePost);

// GET request to delete Game.
//router.get("/game/:id/delete", game_controller.deleteGameGet);

// POST request to delete Game.
router.post("/game/:id/delete", game_controller.deleteGamePost);

// GET request to update Game.
//router.get("/game/:id/update", game_controller.updateGameGet);

// POST request to update Game.
router.post("/game/:id/update", game_controller.updateGamePost);

// GET request for one Game.
router.get("/game/:id", game_controller.gameDetail);

// GET request for list of all Game.
router.get("/game", game_controller.gameList);

/// CONSOLE ROUTES ///

// GET request for creating a Console. NOTE This must come before route that displays Console (uses id).
//router.get("/console/create", console_controller.createConsoleGet);

//POST request for creating Console.
router.post("/console/create", console_controller.createConsolePost);

// GET request to delete Console.
//router.get("/console/:id/delete", console_controller.deleteConsoleGet);

// POST request to delete Console.
router.post("/console/:id/delete", console_controller.deleteConsolePost);

// GET request to update Console.
//router.get("/console/:id/update", console_controller.updateConsoleGet);

// POST request to update Console.
router.post("/console/:id/update", console_controller.updateConsolePost);

// GET request for one Console.
router.get("/console/:id", console_controller.consoleDetail);

// GET request for list of all Console.
router.get("/console", console_controller.consoleList);

/// PUBLISHER ROUTES ///

// GET request for creating a Publisher. NOTE This must come before route that displays Publisher (uses id).
//router.get("/publisher/create", publisher_controller.createPublisherGet);

//POST request for creating Publisher.
router.post("/publisher/create", publisher_controller.createPublisherPost);

// GET request to delete Publisher.
//router.get("/publisher/:id/delete", publisher_controller.deletePublisherGet);

// POST request to delete Publisher.
router.post("/publisher/:id/delete", publisher_controller.deletePublisherPost);

// GET request to update Publisher.
//router.get("/publisher/:id/update", publisher_controller.updatePublisherGet);

// POST request to update Publisher.
router.post("/publisher/:id/update", publisher_controller.updatePublisherPost);

// GET request for one Publisher.
router.get("/publisher/:id", publisher_controller.publisherDetail);

// GET request for list of all Publisher.
router.get("/publisher", publisher_controller.publisherList);

/// DEVELOPER ROUTES ///

// GET request for creating a Developer. NOTE This must come before route that displays Developer (uses id).
//router.get("/developer/create", developer_controller.createDeveloperGet);

//POST request for creating Developer.
router.post("/developer/create", developer_controller.createDeveloperPost);

// GET request to delete Developer.
//router.get("/developer/:id/delete", developer_controller.deleteDeveloperGet);

// POST request to delete Developer.
router.post("/developer/:id/delete", developer_controller.deleteDeveloperPost);

// GET request to update Developer.
//router.get("/developer/:id/update", developer_controller.updateDeveloperGet);

// POST request to update Developer.
router.post("/developer/:id/update", developer_controller.updateDeveloperPost);

// GET request for one Developer.
router.get("/developer/:id", developer_controller.developerDetail);

// GET request for list of all Developer.
router.get("/developer", developer_controller.developerList);

module.exports = router;
