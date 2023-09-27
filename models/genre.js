module.exports = (sequelize, DataTypes) => {
  const Genre = sequelize.define("Genre", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.VIRTUAL,
      get() {
        return `/catalog/genre/${this.id}`;
      },
    },
  });

  Genre.associate = function (models) {
    Genre.belongsToMany(models.Game, { through: "GameGenre" });
  };

  return Genre;
};
