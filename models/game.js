module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define("Game", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    published: {
      type: DataTypes.DATEONLY,
    },
    price: {
      type: DataTypes.FLOAT(6, 2),
    },
    stock: {
      type: DataTypes.INTEGER,
    },
    url: {
      type: DataTypes.VIRTUAL,
      get() {
        return `/catalog/game/${this.id}`;
      },
    },
  });

  Game.associate = function (models) {
    Game.belongsToMany(models.Genre, { through: "GameGenre" });
    Game.belongsToMany(models.Publisher, { through: "GamePublisher" });
    Game.belongsToMany(models.Developer, { through: "GameDeveloper" });
    Game.belongsToMany(models.Console, { thorugh: "ConsoleGame" });
  };

  return Game;
};
