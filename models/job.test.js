"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { update } = require("./job.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// create
describe("create", () => {
  const newJob = {
      title: "New",
      salary: 0,
      equity: 0,
      companyHandle: "c1"
  };

  test("works", async () => {
    await Job.create(newJob);
    const result = await db.query(`
        SELECT id, title, salary, equity, company_handle
        FROM jobs
        where title='New'`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "New",
        salary: 0,
        equity: "0",
        company_handle: "c1"
      }
    ]);
  });

  test("bad request with dupe", async () => {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (e) {
      expect (e instanceof BadRequestError).toBeTruthy();
    }
  });
});

// findAll()
describe("findAll", () => {
  test("works", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
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
    ])
  })
})

// filter
describe("filter", () => {
  test("works: nothing missing", async () => {
    let jobs = await Job.filter("j", 2, true);
    expect(jobs).toEqual([
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
    ])
  });

  test("works: title missing", async () => {
    let jobs = await Job.filter(undefined, 2, true);
    expect(jobs).toEqual([
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
    ])
  });

  test("works: minSalary missing", async () => {
    let jobs = await Job.filter("j", undefined, true);
    expect(jobs).toEqual([
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
    ])
  });

  test("works: equity false", async () => {
    let jobs = await Job.filter("j", 2, false);
    expect(jobs).toEqual([
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
    ])
  });

  test("works: equity missing", async () => {
    let jobs = await Job.filter("j", 2, undefined);
    expect(jobs).toEqual([
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
    ])
  });

  test("works: title and minSalary missing", async () => {
    let jobs = await Job.filter(undefined, undefined, true);
    expect(jobs).toEqual([
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
    ])
  });

  test("works: title missing and hasEquity false", async () => {
    let jobs = await Job.filter(undefined, 2, false);
    expect(jobs).toEqual([
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
    ])
  });

  test("works: title and hasEquity missing", async () => {
    let jobs = await Job.filter(undefined, 2, undefined);
    expect(jobs).toEqual([
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
    ])
  });

  test("works: minSalary missing and hasEquity false", async () => {
    let jobs = await Job.filter("j", undefined, false);
    expect(jobs).toEqual([
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
    ])
  });

  test("works: minSalary and hasEquity missing", async () => {
    let jobs = await Job.filter("j", undefined, undefined);
    expect(jobs).toEqual([
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
    ])
  });

  test("fail if title doesnt exist", async () => {
    try {
      await Job.filter("invalid", 0, true);
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
})

describe("get", () =>  {
  test("works", async () => {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "j1",
      salary: 1,
      equity: "0",
      companyHandle: "c1"
    })
  });

  test("not found if no such company", async () => {
    try {
      await Job.get(10);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// update
describe("update", () => {
  const updateData = {
    title: "New",
    salary: 0,
    equity: 0
  };

  test("works", async () =>  {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      title: updateData.title,
      salary: updateData.salary,
      equity: "0",
      companyHandle: "c1"
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id=1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "New",
      salary: 0,
      equity: "0",
      company_handle: "c1"
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      title: "New",
      salary: null,
      equity: null,
      companyHandle: "c1"
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id=1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "New",
      salary: null,
      equity: null,
      company_handle: "c1"
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(10, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("j1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// remove
describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(10);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});