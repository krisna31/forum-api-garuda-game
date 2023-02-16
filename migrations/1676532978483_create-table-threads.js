/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("threads", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    content: {
      type: "TEXT",
      notNull: true,
    },
    owner: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });
  pgm.addConstraint("threads", "fk_threads.owner_users.id", "FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE");
};

exports.down = (pgm) => {
  pgm.dropTable("threads");
  pgm.dropConstraint("threads", "fk_threads.owner_users.id", {
    ifExists: true,
  });
};
