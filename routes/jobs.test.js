"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// POST
describe("POST /jobs", () => {
  const newJob = {
    title: "new",
    salary: 100,
    equity: 0,
    companyHandle: "c1"
  };

  test("ok for admins", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: newJob.title,
        salary: newJob.salary,
        equity: "0",
        companyHandle: newJob.companyHandle
      }
    })
  });

  test("bad request with missing data", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 5
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request invalid data", async () => {
    const resp = await request(app)
    .post("/jobs")
    .send({
      title: 100,
      salary: "5",
      equity: 9000
    })
    .set("authorization", `Bearer ${u1Token}`);
  expect(resp.statusCode).toEqual(400);
  });

  test("unath because not admin", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  })
});

// GET
describe("GET /jobs", () => {
  test("works", async () => {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: 
        [
          {
            id: 1,
            title: "j1",
            salary: 1,
            equity: "0",
            companyHandle: "c1"
          },
          {
            id: 2,
            title: "j2",
            salary: 2,
            equity: "0.01",
            companyHandle: "c2"
          },
          {
            id: 3,
            title: "j3",
            salary: 3,
            equity: "0.1",
            companyHandle: "c3"
          }
        ]
    })
  });

  test("hits filter if query string exists", async () => {
    const resp = await request(app).get("/jobs?title=j&minSalary=2");
    expect(resp.body).toEqual({
      jobs: 
        [
          {
            id: 2,
            title: "j2",
            salary: 2,
            equity: "0.01",
            companyHandle: "c2"
          },
          {
            id: 3,
            title: "j3",
            salary: 3,
            equity: "0.1",
            companyHandle: "c3"
          }
        ]
    })
  });
});

// GET:id
describe("GET /jobs/:id", () => {
  test("works", async () => {
    const resp = await request(app).get("/jobs/1");
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1",
        salary: 1,
        equity: "0",
        companyHandle: "c1"
      }
    })
  });

  test("invalid id", async function () {
    const resp = await request(app).get(`/companies/3473829974`);
    expect(resp.statusCode).toEqual(404);
  });
})

// PATCH
describe("PATCH /jobs/:id", () => {
  test("works for admin", async () => {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "j1-new"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1-new",
        salary: 1,
        equity: "0",
        companyHandle: "c1"       
      }
    })
  });

  test("unauth for non-admin", async () => {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "j1-new"
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "j1-new"
        })
    expect(resp.statusCode).toEqual(401);
  });

  test("invalid id", async () => {
    const resp = await request(app)
        .patch(`/jobs/21939`)
        .send({
          title: "invalid"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request (try to change id)", async () => {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          id: "j1-new"
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("invalid data", async () => {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: 100
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

// DELETE
describe("DELETE /jobs/:id", () => {
  test("works for admins", async () => {
    const resp = await request(app)
      .delete("/jobs/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("unauth for non-admin", async () => {
    const resp = await request(app)
      .delete("/jobs/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("works for anon", async () => {
    const resp = await request(app)
      .delete("/jobs/1");
    expect(resp.statusCode).toEqual(401);
  });

  test("invalid id", async () => {
    const resp = await request(app)
      .delete("/jobs/43431")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
})