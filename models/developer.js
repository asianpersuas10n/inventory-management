module.exports = (sequelize, DataTypes) => {
  const Developer = sequelize.define("Developer", {
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
        return `/catalog/developer/${this.id}`;
      },
    },
  });

  Developer.associate = function (models) {
    Developer.belongsToMany(models.Publisher, {
      through: "PublisherDeveloper",
    });
    Developer.belongsToMany(models.Game, { through: "GameDeveloper" });
  };

  return Developer;
};
