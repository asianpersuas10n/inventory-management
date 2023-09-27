const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../models");
const Genre = db.Genre;
const Game = db.Game;
const Op = db.Sequelize.Op;

async function findOrCreate(name) {
  const [tempGame, created] = await Game.findOrCreate({
    where: { name: name },
    defaults: {
      published: "12-31-2000",
    },
  });
  console.log(created);
  return tempGame;
}

// GET request for all genres
exports.genreList = asyncHandler(async (req, res) => {
  const allGenres = await Genre.findAll({ include: Game });
  res.send(allGenres);
});

// GET request for a single genre
exports.genreDetail = asyncHandler(async (req, res) => {
  const genre = await Genre.findOne({ where: { name: req.body.name } });
  res.send(genre);
});

// POST request to create Genre if it doesn't exist
exports.createGenrePost = [
  body("name", "Genre name must be at least three characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const genre = Genre.build({
      name: req.body.name,
      description: req.body.description,
    });
    const games = [];
    console.log(req.body.game.length, req.body.game);

    if (!errors.isEmpty()) {
      /*res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });*/
      res.send("error was made");
      return;
    } else {
      const genreExists = await Genre.findOne({
        where: { name: req.body.name },
      });
      if (genreExists) {
        //res.redirect(genreExists.url);
        res.send("already exist");
      } else {
        for (let i = 0; i < req.body.game.length; i++) {
          games.push(() => findOrCreate(req.body.game[i]));
        }

        const promisedGames = await Promise.all(games.map((anon) => anon()));
        console.log(promisedGames);

        await genre.save();

        await genre.addGames(promisedGames);

        res.send("it worked good job");
        //res.redirect(genre.url);
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
    const genre = await Genre.findOne({ where: { id: req.body.id } });
    const changes = {};
    if (req.body.name) {
      changes.name = req.body.name;
    }
    if (req.body.description) {
      changes.description = req.body.description;
    }
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
