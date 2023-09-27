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
      allowNull: false,
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
  };

  //Game.belongsToMany("publisher");
  //Game.belongsToMany("developer");
  //Game.belongsToMany("console");

  return Game;
};
