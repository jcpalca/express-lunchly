"use strict";

const request = require("supertest");

const app = require("./app");
const db = require("./db");

beforeEach(async function () {
  await db.query("DELETE FROM reservations");
  await db.query("DELETE FROM customers");
  await db.query("SELECT setval('reservations_id_seq', 1, false)");
  await db.query("SELECT setval('customers_id_seq', 1, false)");
  await db.query(`
    INSERT INTO customers (first_name, last_name, phone, notes)
    VALUES ('Ezra', 'Chung', '1234567890', 'test'),
           ('Joel', 'Alcaraz', '0987654321', 'test2')`);
  await db.query(`
    INSERT INTO reservations (customer_id, num_guests, start_at, notes)
    VALUES (1, 2, '2022-11-02 11:13 am', 'test'),
           (1, 3, '2022-11-03 11:13 am', 'test2'),
           (2, 5, '2022-11-04 11:13 am', 'test3')`);
});


describe("GET / ", function() {
  it("gets all customers", async function() {
    const resp = await request(app).get("/");

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Ezra Chung");
    expect(resp.text).toContain("Joel Alcaraz");
  });

  it("gets specific customers from search query", async function() {
    const resp = await request(app).get("/?search=ezra");

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Ezra Chung");
    expect(resp.text).not.toContain("Joel Alcaraz");
  });
});


describe("GET /add", function() {
  it("displays add customer form", async function() {
    const resp = await request(app).get("/add");

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Add a Customer");
  });
});


describe("POST /add", function() {
  it("adds a new customer to the database", async function() {
    let results = await db.query(`SELECT * FROM customers`);
    expect(results.rows.length).toEqual(2);

    const newCustomerData = {
      firstName: "Brit",
      lastName: "Juravic",
      phone: "1230984567",
      notes: "advisor"
    }

    const resp = await request(app)
      .post("/add/")
      .type("form")
      .send(newCustomerData);

    results = await db.query(`SELECT * FROM customers`);

    expect(results.rows.length).toEqual(3);
    expect(results.rows[2]).toEqual({
      id: 3,
      first_name: "Brit",
      last_name: "Juravic",
      phone: "1230984567",
      notes: "advisor"
    });
    expect(resp.status).toEqual(302);
  });
});

describe("GET /top-ten", function() {
  it("displays top ten customer list", async function() {
    const resp = await request(app).get("/top-ten");

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Ezra Chung");
    expect(resp.text).toContain("Joel Alcaraz");
  });
});

// ################ RESERVATIONS TESTS ############################ //

describe("POST /:id/add-reservation/", function() {
  it("adds a new reservation", async function () {
    let result = await db.query(
      `SELECT * FROM reservations WHERE customer_id = 2`
    );
    expect(result.rows.length).toEqual(1);

    const newReservation = {
      customerId: 2,
      numGuests: 7,
      startAt: "2022-11-02 11:13 am",
      notes: "test reservation"
    }

    const resp = await request(app)
      .post("/2/add-reservation")
      .type("form")
      .send(newReservation);

    result = await db.query(
      `SELECT * FROM reservations WHERE customer_id = 2`
    );

    expect(result.rows.length).toEqual(2);
    expect(result.rows[1]).toEqual({
      id: expect.any(Number),
      num_guests:7,
      customer_id:2,
      start_at: expect.any(Date),
      notes: "test reservation"
    })
    expect(resp.status).toEqual(302);

  });
});