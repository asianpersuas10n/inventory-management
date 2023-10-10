const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../models");
const Genre = db.Genre;
const Game = db.Game;
const Op = db.Sequelize.Op;

async function findOrCreate(name) {
  const [tempGame] = await Game.findOrCreate({
    where: { name: name },
    defaults: {
      description:
        "The published date and description are unfinished. Please update these.",
      published: "12-31-2000",
    },
  });
  return tempGame;
}

exports.index = asyncHandler(async (req, res, next) => {
  res.render("index", {
    title: "Home",
  });
});

// GET request for all genres
exports.genreList = asyncHandler(async (req, res) => {
  const allGenres = await Genre.findAll({ include: Game });
  res.render("genre_list", {
    title: "Genre List",
    genre_list: allGenres,
  });
});

// GET request for a single genre
exports.genreDetail = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findOne({
    where: { id: req.params.id },
    include: Game,
  });

  if (genre === null) {
    // No results.
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
  });
});

// GET request for genre form
exports.createGenreGet = (req, res) => {
  res.render("genre_form", {
    title: "Genre Form",
  });
};

// POST request to create Genre if it doesn't exist
exports.createGenrePost = [
  body("name", "Genre name must be at least three characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const game = req.body.game.split(", ");
    const genre = Genre.build({
      name: req.body.name,
      description: req.body.description,
    });
    const games = [];

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      res.send("error was made");
      return;
    } else {
      const genreExists = await Genre.findOne({
        where: { name: req.body.name },
      });
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        for (let i = 0; i < game.length; i++) {
          games.push(() => findOrCreate(game[i]));
        }

        const promisedGames = await Promise.all(games.map((anon) => anon()));

        await genre.save();
        await genre.addGames(promisedGames);

        res.redirect(genre.url);
      }
    }
  }),
];

// POST request to update a genre
exports.updateGenrePost = [
  body("name", "Genre name must be at least three characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const genre = await Genre.findOne({
      where: { id: req.body.id },
      include: Game,
    });
    const gameMap = {};
    const removedGames = [];
    const changes = {};
    const games = [];
    if (req.body.name) {
      changes.name = req.body.name;
    }
    if (req.body.description) {
      changes.description = req.body.description;
    }

    for (let i = 0; i < req.body.game.length; i++) {
      games.push(() => findOrCreate(req.body.game[i]));
      gameMap[req.body.game[i]] = i;
    }

    for (let j = 0; j < genre.Games.length; j++) {
      if (genre.Games[j].name in gameMap === false) {
        const remove = await Game.findOne({
          where: { id: genre.Games[j].id },
        });
        removedGames.push(remove);
      }
    }

    const promisedGames = await Promise.all(games.map((anon) => anon()));

    await genre.addGames(promisedGames);
    await genre.removeGames(removedGames);

    await genre.update(changes);
    await genre.reload();
    res.send(
      `update complete => name: ${genre.name} desc: ${genre.description}`
    );
  }),
];

// POST request to delete a genre
exports.deleteGenrePost = asyncHandler(async (req, res) => {
  const genre = await Genre.findOne({ where: { id: req.body.id } });
  console.log(`genre is being destroyed => name: ${genre.name}`);
  await genre.destroy();
  res.send("destruction confirmation");
});
