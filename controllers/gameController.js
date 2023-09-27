const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../models");
const Game = db.Game;
const Genre = db.Genre;
const Op = db.Sequelize.Op;

async function findOrCreate(name) {
  const [tempGenre] = await Genre.findOrCreate({
    where: { name: name },
  });
  return tempGenre;
}

// GET request for all games
exports.gameList = asyncHandler(async (req, res) => {
  const allGames = await Game.findAll();
  res.send(allGames);
});

// GET request for a single game
exports.gameDetail = asyncHandler(async (req, res) => {
  const game = await Game.findOne({ where: { name: req.body.name } });
  res.send(game);
});

// POST request to create Game if it doesn't exist
exports.createGamePost = [
  body("name", "Game name must be at least three characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const game = Game.build({
      name: req.body.name,
    });
    const genres = [];

    if (!errors.isEmpty()) {
      /*res.render("game_form", {
        title: "Create Game",
        game: game,
        errors: errors.array(),
      });*/
      res.send("error was made");
      return;
    } else {
      const gameExists = await Game.findOne({
        where: { name: req.body.name },
      });
      if (gameExists) {
        //res.redirect(gameExists.url);
        res.send("already exist");
      } else {
        for (let i = 0; i < req.body.genre; i++) {
          genres.push(() => findOrCreate(req.body.genre[i]));
        }

        await Promise.all(genres);

        await game.addGenres(genres);
        await game.save();
        res.send("it worked good job");
        //res.redirect(game.url);
      }
    }
  }),
];

// POST request to update a game
exports.updateGamePost = [
  body("name", "Game name must be at least three characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const game = await Game.findOne({ where: { id: req.body.id } });
    const changes = {};
    if (req.body.name) {
      changes.name = req.body.name;
    }
    if (req.body.description) {
      changes.description = req.body.description;
    }
    if (req.body.published) {
      changes.published = req.body.published;
    }
    await game.update(changes);
    await game.reload();
    res.send(
      `update complete => name: ${game.name} desc: ${game.description} publish: ${game.published}`
    );
  }),
];

// POST request to delete a game
exports.deleteGamePost = asyncHandler(async (req, res) => {
  const game = await Game.findOne({ where: { id: req.body.id } });
  console.log(`game is being destroyed => name: ${game.name}`);
  await game.destroy();
  res.send("destruction confirmation");
});
