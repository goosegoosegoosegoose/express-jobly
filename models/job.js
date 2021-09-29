"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  /** Create job, update job db, return new job data
   * 
   * data is { id, title, salary, equity, companyHandle }, returns same
   * 
   * throws BadRequestError 
   **/

  static async create({ id, title, salary, equity, companyHandle }) {
    const dupeCheck = await db.query(`
        SELECT title
          FROM jobs
          WHERE title = $1`,
        [title]);

    if (dupeCheck.rows[0]) throw new BadRequestError(`Duplicate job: ${id}`);

    const result = await db.query(`
        INSERT INTO jobs 
          (title, salary, equity, company_handle)
          VALUES ($1, $2, $3, $4)
          RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [title, salary, equity, companyHandle]
    );
    return result.rows[0];
  }

  /** Find all jobs 
   * 
   * returns [{ id, title, salary, equity, companyHandle }, ...]
  */

  static async findAll() {
    const jobsRes = await db.query(`
          SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            ORDER BY title`);
    return jobsRes.rows;
  }


  // filter jobs through parameters
  static async filter(title, minSalary, hasEquity) {
    if(!title && !minSalary && hasEquity == true){
      const jobRes = await db.query(`
          SELECT id, title, salary, equity, company_handle as "companyHandle"
            FROM jobs
            WHERE equity > 0`);
      if (!jobRes.rows[0]) throw new NotFoundError(`No job found`);
      return jobRes.rows;
    }
    if(!title && (hasEquity == false || !hasEquity)){
      const jobRes = await db.query(`
          SELECT id, title, salary, equity, company_handle as "companyHandle"
            FROM jobs
            WHERE salary >= $1`,
          [minSalary]);
      if (!jobRes.rows[0]) throw new NotFoundError(`No job found`);
      return jobRes.rows;
    }
    if(!minSalary && (hasEquity == false || !hasEquity)){
      const jobRes = await db.query(`
          SELECT id, title, salary, equity, company_handle as "companyHandle"
            FROM jobs
            WHERE title ILIKE '%' || $1 || '%'`,
          [title]);
      if (!jobRes.rows[0]) throw new NotFoundError(`No job found`);
      return jobRes.rows;
    }
    if(!title && hasEquity == true){
      const jobRes = await db.query(`
          SELECT id, title, salary, equity, company_handle as "companyHandle"
            FROM jobs
            WHERE salary >= $1
            AND equity > 0`,
          [minSalary]);
      if (!jobRes.rows[0]) throw new NotFoundError(`No job found`);
      return jobRes.rows;
    }
    if(!minSalary && hasEquity == true){
      const jobRes = await db.query(`
          SELECT id, title, salary, equity, company_handle as "companyHandle"
            FROM jobs
            WHERE title ILIKE '%' || $1 || '%'
            AND equity > 0`,
        [title]);
      if (!jobRes.rows[0]) throw new NotFoundError(`No job found`);
      return jobRes.rows;
    }
    if(hasEquity == false || !hasEquity){
      const jobRes = await db.query(`
          SELECT id, title, salary, equity, company_handle as "companyHandle"
            FROM jobs
            WHERE title ILIKE '%' || $1 || '%'
            AND salary >= $2`,
          [title, minSalary]);
      if (!jobRes.rows[0]) throw new NotFoundError(`No job found`);
      return jobRes.rows;
    }
    const jobRes = await db.query(`
        SELECT id, title, salary, equity, company_handle as "companyHandle"
          FROM jobs
          WHERE title ILIKE '%' || $1 || '%'
          AND salary >= $2
          AND equity > 0`,
        [title, minSalary]);
    if (!jobRes.rows[0]) throw new NotFoundError(`No job found`);
    return jobRes.rows;
  }

  // Get a job's data through id
  static async get(id){
    const jobRes = await db.query(`
        SELECT id, title, salary, equity, company_handle AS "companyHandle"
          FROM jobs
          WHERE id=$1`,
        [id]);
    const job = jobRes.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);
    return job;
  }

  // update job partially
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        companyHandle: "company_handle"
      });
    const handleVarIdx = "$" + (values.length + 1);
    
    const querySql = `UPDATE jobs
                      SET ${setCols}
                      WHERE id = ${handleVarIdx}
                      RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);
    return job;
  }

  // delete job by id
  static async remove(id){
    const result = await db.query(`
          DELETE
            FROM jobs
            WHERE id=$1
            RETURNING id`,
          [id]);
    const job = result.rows[0];
    if(!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job