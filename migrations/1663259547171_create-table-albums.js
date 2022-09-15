/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("albums", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    name: {
      type: "TEXT",
      notNull: true,
    },
    year: {
      type: "TEXT",
      notNull: true,
    }, 
    createdAt: {
      type: "timestamp",
      notNull: true, 
    },
    updatedAt: {
      type: "timestamp",
      notNull: true, 
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
};
