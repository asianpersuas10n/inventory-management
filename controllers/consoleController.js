const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../models");
const Game = db.Game;
const Console = db.Console;
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

// GET request for all console
exports.consoleList = asyncHandler(async (req, res) => {
  const allConsoles = await Console.findAll({ include: [Game] });
  res.send(allConsoles);
});

// GET request for a single console
exports.consoleDetail = asyncHandler(async (req, res) => {
  const console = await Console.findOne({
    where: { name: req.body.name },
    include: [Game],
  });
  res.send(console);
});

// POST request to create console if it doesn't exist
exports.createConsolePost = [
  body("name", "Genre name must be at least three characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const newBody = Object.keys(req.body)
      .filter((key) => key !== "Games")
      .reduce((cur, key) => {
        return Object.assign(cur, { [key]: req.body[key] });
      }, {});
    const console = Console.build(newBody);
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
      const consoleExists = await Console.findOne({
        where: { name: req.body.name },
      });
      if (consoleExists) {
        //res.redirect(genreExists.url);
        res.send("already exist");
      } else {
        const promises = [];

        const body = req.body;

        const allArray = [[]];

        const [game] = allArray;

        promiseCreator(Game, body.Games, console, game, [], true);

        for (let i = 0; i < allArray.length; i++) {
          promises.push(() => Promise.all(allArray[i].map((anon) => anon())));
        }

        const finishedPromises = await Promise.all(
          promises.map((anon) => anon())
        );

        await console.save();
        await Promise.all([console.addGames(finishedPromises[0])]);

        res.send("it worked good job");
        //res.redirect(genre.url);
      }
    }
  }),
];

// POST request to update a console
exports.updateConsolePost = [
  body("name", "Genre name must be at least three characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const console = await Console.findOne({
      where: { id: req.body.id },
      include: [Game],
    });

    const promises = [];

    const body = req.body;

    const allArray = [[], [], [], []];

    const [game, removedGames] = allArray;

    promiseCreator(Game, body.Games, console, game, removedGames, false);

    for (let i = 0; i < allArray.length; i++) {
      promises.push(() => Promise.all(allArray[i].map((anon) => anon())));
    }

    const finishedPromises = await Promise.all(promises.map((anon) => anon()));

    const newBody = Object.keys(body)
      .filter((key) => key !== "Games")
      .reduce((cur, key) => {
        return Object.assign(cur, { [key]: body[key] });
      }, {});

    await Promise.all([console.addGames(finishedPromises[0])]);

    await Promise.all([console.removeGames(finishedPromises[1])]);

    await console.update(newBody);
    await console.reload();
    res.send(
      `update complete => name: ${console.name} desc: ${console.description}`
    );
  }),
];

// POST request to delete a console
exports.deleteConsolePost = asyncHandler(async (req, res) => {
  const console = await Console.findOne({ where: { id: req.body.id } });
  console.log(`console is being destroyed => name: ${console.name}`);
  await console.destroy();
  res.send("destruction confirmation");
});
