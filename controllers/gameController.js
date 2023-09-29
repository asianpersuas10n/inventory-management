const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../models");
const Genre = db.Genre;
const Game = db.Game;
const Op = db.Sequelize.Op;

async function findOrCreate(name) {
  const [tempGenre] = await Genre.findOrCreate({
    where: { name: name },
    defaults: {
      description:
        "The published date and description are unfinished. Please update these.",
    },
  });
  return tempGenre;
}

// GET request for all game
exports.gameList = asyncHandler(async (req, res) => {
  const allGames = await Game.findAll({ include: Genre });
  res.send(allGames);
});

// GET request for a single game
exports.gameDetail = asyncHandler(async (req, res) => {
  const game = await Game.findOne({ where: { name: req.body.name } });
  res.send(game);
});

// POST request to create game if it doesn't exist
exports.createGamePost = [
  body("name", "Genre name must be at least three characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const game = Game.build({
      name: req.body.name,
      description: req.body.description,
    });
    const genre = [];

    if (!errors.isEmpty()) {
      /*res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });*/
      res.send("error was made");
      return;
    } else {
      const gameExists = await Game.findOne({
        where: { name: req.body.name },
      });
      if (gameExists) {
        //res.redirect(genreExists.url);
        res.send("already exist");
      } else {
        for (let i = 0; i < req.body.genre.length; i++) {
          genre.push(() => findOrCreate(req.body.genre[i]));
        }

        const promisedGenre = await Promise.all(genre.map((anon) => anon()));

        await game.save();
        await game.addGames(promisedGenre);

        res.send("it worked good job");
        //res.redirect(genre.url);
      }
    }
  }),
];

// POST request to update a game
exports.updateGamePost = [
  body("name", "Genre name must be at least three characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const game = await Game.findOne({
      where: { id: req.body.id },
      include: Genre,
    });
    const genreMap = {};
    const removedGenres = [];
    const changes = {};
    const genre = [];
    if (req.body.name) {
      changes.name = req.body.name;
    }
    if (req.body.description) {
      changes.description = req.body.description;
    }

    for (let i = 0; i < req.body.genre.length; i++) {
      genre.push(() => findOrCreate(req.body.genre[i]));
      genreMap[req.body.genre[i]] = i;
    }

    for (let j = 0; j < game.Genres.length; j++) {
      if (game.Genres[j].name in genreMap === false) {
        const remove = await Genre.findOne({
          where: { id: game.Genres[j].id },
        });
        removedGenres.push(remove);
      }
    }

    const promisedGenres = await Promise.all(genre.map((anon) => anon()));

    await game.addGames(promisedGenres);
    await game.removeGames(removedGenres);

    await game.update(changes);
    await game.reload();
    res.send(`update complete => name: ${game.name} desc: ${game.description}`);
  }),
];

// POST request to delete a game
exports.deleteGamePost = asyncHandler(async (req, res) => {
  const game = await Game.findOne({ where: { id: req.body.id } });
  console.log(`game is being destroyed => name: ${game.name}`);
  await game.destroy();
  res.send("destruction confirmation");
});
