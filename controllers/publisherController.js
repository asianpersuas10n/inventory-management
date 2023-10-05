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

// GET request for all publisher
exports.publisherList = asyncHandler(async (req, res) => {
  const allPublishers = await Publisher.findAll({ include: [Game, Developer] });
  res.send(allPublishers);
});

// GET request for a single publisher
exports.publisherDetail = asyncHandler(async (req, res) => {
  const publisher = await Publisher.findOne({
    where: { name: req.body.name },
    include: [Game, Developer],
  });
  res.send(publisher);
});

// POST request to create publisher if it doesn't exist
exports.createPublisherPost = [
  body("name", "Genre name must be at least three characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const newBody = Object.keys(req.body)
      .filter((key) => key !== "Games" || key !== "Developers")
      .reduce((cur, key) => {
        return Object.assign(cur, { [key]: req.body[key] });
      }, {});
    const publisher = Publisher.build(newBody);
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
      const publisherExists = await Publisher.findOne({
        where: { name: req.body.name },
      });
      if (publisherExists) {
        //res.redirect(genreExists.url);
        res.send("already exist");
      } else {
        const promises = [];

        const body = req.body;

        const allArray = [[], []];

        const [game, developer] = allArray;

        promiseCreator(Game, body.Games, publisher, game, [], true);
        promiseCreator(
          Developer,
          body.Developers,
          publisher,
          developer,
          [],
          true
        );

        for (let i = 0; i < allArray.length; i++) {
          promises.push(() => Promise.all(allArray[i].map((anon) => anon())));
        }

        const finishedPromises = await Promise.all(
          promises.map((anon) => anon())
        );

        await publisher.save();
        await Promise.all([
          publisher.addGames(finishedPromises[0]),
          publisher.addDevelopers(finishedPromises[1]),
        ]);

        res.send("it worked good job");
        //res.redirect(genre.url);
      }
    }
  }),
];

// POST request to update a publisher
exports.updatePublisherPost = [
  body("name", "Genre name must be at least three characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const publisher = await Publisher.findOne({
      where: { id: req.body.id },
      include: [Game, Developer],
    });

    const promises = [];

    const body = req.body;

    const allArray = [[], [], [], []];

    const [game, developer, removedGames, removedDevelopers] = allArray;

    promiseCreator(Game, body.Publishers, publisher, game, removedGames, false);
    promiseCreator(
      Developer,
      body.Developers,
      publisher,
      developer,
      removedDevelopers,
      false
    );

    for (let i = 0; i < allArray.length; i++) {
      promises.push(() => Promise.all(allArray[i].map((anon) => anon())));
    }

    const finishedPromises = await Promise.all(promises.map((anon) => anon()));

    const newBody = Object.keys(req.body)
      .filter((key) => key !== "Games" || key !== "Developers")
      .reduce((cur, key) => {
        return Object.assign(cur, { [key]: req.body[key] });
      }, {});

    await Promise.all([
      publisher.addGames(finishedPromises[0]),
      publisher.addDevelopers(finishedPromises[1]),
    ]);

    await Promise.all([
      publisher.removeGames(finishedPromises[2]),
      publisher.removeDevelopers(finishedPromises[3]),
    ]);

    await publisher.update(newBody);
    await publisher.reload();
    res.send(
      `update complete => name: ${publisher.name} desc: ${publisher.description}`
    );
  }),
];

// POST request to delete a publisher
exports.deletePublisherPost = asyncHandler(async (req, res) => {
  const publisher = await Publisher.findOne({ where: { id: req.body.id } });
  console.log(`publisher is being destroyed => name: ${publisher.name}`);
  await publisher.destroy();
  res.send("destruction confirmation");
});
