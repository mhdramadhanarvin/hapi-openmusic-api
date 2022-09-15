/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    albumId: {
      type: "TEXT",
      notNull: true,
      references: '"albums"',
      onDelete: 'cascade',
    },
    title: {
      type: "TEXT",
      notNull: true,
    },
    year: {
      type: "TEXT",
      notNull: true,
    }, 
    genre: {
      type: "TEXT",
      notNull: true,
    }, 
    performer: {
      type: "TEXT",
      notNull: true,
    }, 
    duration: {
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

  pgm.createIndex('songs', 'albumId')
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
