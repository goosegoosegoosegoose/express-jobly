"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
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
        id: expect.any(Number),
        title: "j1",
        salary: 1,
        equity: "0",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: "0.01",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
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
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: "0.01",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
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
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: "0.01",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
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
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: "0.01",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
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
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: "0.01",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
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
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: "0.01",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
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
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: "0.01",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
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
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: "0.01",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
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
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: "0.01",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
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
        id: expect.any(Number),
        title: "j1",
        salary: 1,
        equity: "0",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: "0.01",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
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
        id: expect.any(Number),
        title: "j1",
        salary: 1,
        equity: "0",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: "0.01",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
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
