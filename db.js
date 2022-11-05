"use strict";

/** Database for lunchly */

const { Client } = require("pg");

const DB_URI = process.env.NODE_ENV === "test"
    // ? "postgresql:///lunchly_test"
    // : "postgresql:///lunchly";
    ? "postgresql://ezray:secret@localhost/lunchly_test"
    : "postgresql://ezray:secret@localhost/lunchly";
    // ? "postgresql://jcpalca:hello@localhost/lunchly_test"
    // : "postgresql://jcpalca:hello@localhost/lunchly";

let db = new Client({
  connectionString: DB_URI,
});

db.connect();


module.exports = db;
