module.exports = (sequelize, DataTypes) => {
  const Console = sequelize.define("Console", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    released: {
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
        return `/catalog/console/${this.id}`;
      },
    },
  });

  Console.associate = function (models) {
    Console.belongsToMany(models.Game, { thorugh: "ConsoleGame" });
  };

  return Console;
};
