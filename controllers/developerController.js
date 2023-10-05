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

// GET request for all developer
exports.developerList = asyncHandler(async (req, res) => {
  const allDevelopers = await Developer.findAll({ include: [Game, Publisher] });
  res.send(allDevelopers);
});

// GET request for a single developer
exports.developerDetail = asyncHandler(async (req, res) => {
  const developer = await Developer.findOne({
    where: { name: req.body.name },
    include: [Game, Publisher],
  });
  res.send(developer);
});

// POST request to create developer if it doesn't exist
exports.createDeveloperPost = [
  body("name", "Genre name must be at least three characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const newBody = Object.keys(req.body)
      .filter((key) => key !== "Games" || key !== "Publishers")
      .reduce((cur, key) => {
        return Object.assign(cur, { [key]: req.body[key] });
      }, {});
    const developer = Developer.build(newBody);
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
      const developerExists = await Developer.findOne({
        where: { name: req.body.name },
      });
      if (developerExists) {
        //res.redirect(genreExists.url);
        res.send("already exist");
      } else {
        const promises = [];

        const body = req.body;

        const allArray = [[], []];

        const [game, publisher] = allArray;

        promiseCreator(Game, body.Games, developer, game, [], true);
        promiseCreator(
          Publisher,
          body.Publishers,
          developer,
          publisher,
          [],
          true
        );

        for (let i = 0; i < allArray.length; i++) {
          promises.push(() => Promise.all(allArray[i].map((anon) => anon())));
        }

        const finishedPromises = await Promise.all(
          promises.map((anon) => anon())
        );

        await developer.save();
        await Promise.all([
          developer.addGames(finishedPromises[0]),
          developer.addPublishers(finishedPromises[1]),
        ]);

        res.send("it worked good job");
        //res.redirect(genre.url);
      }
    }
  }),
];

// POST request to update a developer
exports.updateDeveloperPost = [
  body("name", "Genre name must be at least three characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const developer = await Developer.findOne({
      where: { id: req.body.id },
      include: [Game, Publisher],
    });

    const promises = [];

    const body = req.body;

    const allArray = [[], [], [], []];

    const [game, publisher, removedGames, removedPublishers] = allArray;

    promiseCreator(Game, body.Games, developer, game, removedGames, false);
    promiseCreator(
      Publisher,
      body.Publishers,
      developer,
      publisher,
      removedPublishers,
      false
    );

    for (let i = 0; i < allArray.length; i++) {
      promises.push(() => Promise.all(allArray[i].map((anon) => anon())));
    }

    const finishedPromises = await Promise.all(promises.map((anon) => anon()));

    const newBody = Object.keys(req.body)
      .filter((key) => key !== "Games" || key !== "Publishers")
      .reduce((cur, key) => {
        return Object.assign(cur, { [key]: req.body[key] });
      }, {});

    await Promise.all([
      developer.addGames(finishedPromises[0]),
      developer.addPublishers(finishedPromises[1]),
    ]);

    await Promise.all([
      developer.removeGames(finishedPromises[2]),
      developer.removePublishers(finishedPromises[3]),
    ]);

    await developer.update(newBody);
    await developer.reload();
    res.send(
      `update complete => name: ${developer.name} desc: ${developer.description}`
    );
  }),
];

// POST request to delete a developer
exports.deleteDeveloperPost = asyncHandler(async (req, res) => {
  const developer = await Developer.findOne({ where: { id: req.body.id } });
  console.log(`developer is being destroyed => name: ${developer.name}`);
  await developer.destroy();
  res.send("destruction confirmation");
});
