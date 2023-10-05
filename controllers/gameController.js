const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../models");
const Genre = db.Genre;
const Game = db.Game;
const Console = db.Console;
const Publisher = db.Publisher;
const Developer = db.Developer;
const Op = db.Sequelize.Op;

async function findOrCreate(name, type) {
  const [tempType] = await type.findOrCreate({
    where: { name: name },
    defaults: {
      description:
        "The published date and description are unfinished. Please update these.",
    },
  });
  return tempType;
}

function promiseCreator(
  type,
  bodyType,
  primaryArr,
  tempArr,
  removedArr,
  create
) {
  const map = {};

  for (let i = 0; i < bodyType.length; i++) {
    tempArr.push(() => findOrCreate(bodyType[i], type));
    map[bodyType[i]] = i;
  }

  if (create === true) {
    return;
  }

  for (let j = 0; j < primaryArr.Genres.length; j++) {
    if (primaryArr.Genres[j].name in map === false) {
      removedArr.push(() =>
        type.findOne({
          where: { id: primaryArr.Genres[j].id },
        })
      );
    }
  }
}

// GET request for all game
exports.gameList = asyncHandler(async (req, res) => {
  const allGames = await Game.findAll({
    include: [Genre, Console, Developer, Publisher],
  });
  res.send(allGames);
});

// GET request for a single game
exports.gameDetail = asyncHandler(async (req, res) => {
  const game = await Game.findOne({
    where: { name: req.body.name },
    include: [Genre, Console, Developer, Publisher],
  });
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
    const newBody = Object.keys(req.body)
      .filter(
        (key) =>
          key !== "Genres" ||
          key !== "Publishers" ||
          key !== "Developers" ||
          key !== "Consoles"
      )
      .reduce((cur, key) => {
        return Object.assign(cur, { [key]: req.body[key] });
      }, {});
    const game = Game.build(newBody);
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
        const promises = [];

        const body = req.body;

        const allArray = [[], [], [], []];

        const [genre, console, publisher, developer] = allArray;

        promiseCreator(Genre, body.Genres, game, genre, [], true);
        promiseCreator(Console, body.Consoles, game, console, [], true);
        promiseCreator(Publisher, body.Publishers, game, publisher, [], true);
        promiseCreator(Developer, body.Developers, game, developer, [], true);

        for (let i = 0; i < allArray.length; i++) {
          promises.push(() => Promise.all(allArray[i].map((anon) => anon())));
        }

        const finishedPromises = await Promise.all(
          promises.map((anon) => anon())
        );

        await game.save();
        await Promise.all([
          game.addGenres(finishedPromises[0]),
          game.addConsoles(finishedPromises[1]),
          game.addPublishers(finishedPromises[2]),
          game.addDevelopers(finishedPromises[3]),
        ]);

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
      include: [Genre, Console, Publisher, Developer],
    });

    const promises = [];

    const body = req.body;

    const allArray = [[], [], [], [], [], [], [], []];

    const [
      genre,
      console,
      publisher,
      developer,
      removedGenres,
      removedConsoles,
      removedPublishers,
      removedDevelopers,
    ] = allArray;

    promiseCreator(Genre, body.Genres, game, genre, removedGenres, false);
    promiseCreator(
      Console,
      body.Consoles,
      game,
      console,
      removedConsoles,
      false
    );
    promiseCreator(
      Publisher,
      body.Publishers,
      game,
      publisher,
      removedPublishers,
      false
    );
    promiseCreator(
      Developer,
      body.Developers,
      game,
      developer,
      removedDevelopers,
      false
    );

    for (let i = 0; i < allArray.length; i++) {
      promises.push(() => Promise.all(allArray[i].map((anon) => anon())));
    }

    const finishedPromises = await Promise.all(promises.map((anon) => anon()));

    const newBody = Object.keys(req.body)
      .filter(
        (key) =>
          key !== "Genres" ||
          key !== "Publishers" ||
          key !== "Developers" ||
          key !== "Consoles"
      )
      .reduce((cur, key) => {
        return Object.assign(cur, { [key]: req.body[key] });
      }, {});

    await Promise.all([
      game.addGenres(finishedPromises[0]),
      game.addConsoles(finishedPromises[1]),
      game.addPublishers(finishedPromises[2]),
      game.addDevelopers(finishedPromises[3]),
    ]);

    await Promise.all([
      game.removeGenres(finishedPromises[4]),
      game.removeConsoles(finishedPromises[5]),
      game.removePublishers(finishedPromises[6]),
      game.removeDevelopers(finishedPromises[7]),
    ]);

    await game.update(newBody);
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
