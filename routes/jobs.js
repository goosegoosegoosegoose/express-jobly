"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** post new { job } => { job }
 * 
 * admin required
 */

router.post("/", ensureAdmin, async (req, res, next) => {
  try{
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    };
    
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (e) {
    return next(e)
  }
});

/** get list of jobs
 *  { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
 *  use filter for
 * - title
 * - minSalary
 * - hasEquity
 */

 router.get("/", async function (req, res, next) {
  try {
    if (Object.keys(req.query).length !== 0) {
      const jobs = await Job.filter(req.query.title, req.query.minSalary, req.query.hasEquity);
      return res.json({ jobs });
    }
    const jobs = await Job.findAll();
    return res.json({ jobs });
  } catch (e) {
    return next(e);
  }
});
