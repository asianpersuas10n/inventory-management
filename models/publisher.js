module.exports = (sequelize, DataTypes) => {
  const Publisher = sequelize.define("Publisher", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    founded: {
      type: DataTypes.DATEONLY,
    },
    url: {
      type: DataTypes.VIRTUAL,
      get() {
        return `/catalog/publisher/${this.id}`;
      },
    },
  });

  Publisher.associate = function (models) {
    Publisher.belongsToMany(models.Game, { through: "GamePublisher" });
    Publisher.belongsToMany(models.Developer, {
      through: "PublisherDeveloper",
    });
  };

  return Publisher;
};
