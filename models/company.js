"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`);
    return companiesRes.rows;
  }

  /** Filters companies by name and number of employees
   * 
   * name, minEmployees, maxEmployees are entered as querystrings in a  and passed through as params
   * 
   * type of sql query done depends on which params are unidentified (as in not in querystring)
   * 
   * returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   */

  static async filter(name, minEmployees, maxEmployees) {
    if (minEmployees > maxEmployees) {
      throw new ExpressError("Minimum employees cannot be greater than maximum", 400);
    }
    if (!name && !minEmployees) {
      const companiesRes = await db.query(
      `SELECT handle, name, description, num_employees AS "numEmployees", logo_url as "logoUrl"
        FROM companies 
        WHERE num_employees <= $1`,
        [maxEmployees]
      );
      if (!companiesRes.rows[0]) throw new NotFoundError(`No company found`);
      return companiesRes.rows;
    };
    if (!name && !maxEmployees) {
      const companiesRes = await db.query(
      `SELECT handle, name, description, num_employees AS "numEmployees", logo_url as "logoUrl"
        FROM companies
        WHERE num_employees >= $1`,
        [minEmployees]
      );
      if (!companiesRes.rows[0]) throw new NotFoundError(`No company found`);
      return companiesRes.rows;
    };
    if (!minEmployees && !maxEmployees) {
      console.log("HIT")
      const companiesRes = await db.query(
      `SELECT handle, name, description, num_employees AS "numEmployees", logo_url as "logoUrl"
        FROM companies
        WHERE name ILIKE '%' || $1 || '%'`,
        [name]
      );
      if (!companiesRes.rows[0]) throw new NotFoundError(`No company found`);
      return companiesRes.rows;
    };
    if (!name) {
      const companiesRes = await db.query(
      `SELECT handle, name, description, num_employees AS "numEmployees", logo_url as "logoUrl"
        FROM companies 
        WHERE num_employees BETWEEN $1 AND $2`,
        [minEmployees, maxEmployees]
      );
    if (!companiesRes.rows[0]) throw new NotFoundError(`No company found`);
    return companiesRes.rows;
    };
    if (!minEmployees){
      const companiesRes = await db.query(
        `SELECT handle, name, description, num_employees AS "numEmployees", logo_url as "logoUrl"
          FROM companies
          WHERE name ILIKE '%' || $1 || '%' 
          AND num_employees <= $2`,
          [name, maxEmployees]
      );
      if (!companiesRes.rows[0]) throw new NotFoundError(`No company found`);
      return companiesRes.rows;
    };
    if (!maxEmployees){
      const companiesRes = await db.query(
        `SELECT handle, name, description, num_employees AS "numEmployees", logo_url as "logoUrl"
          FROM companies
          WHERE name ILIKE '%' || $1 || '%' 
          AND num_employees >= $2`,
          [name, minEmployees]
      );
      if (!companiesRes.rows[0]) throw new NotFoundError(`No company found`);
      return companiesRes.rows;
    };
    const companiesRes = await db.query(
      `SELECT handle, name, description, num_employees AS "numEmployees", logo_url as "logoUrl"
        FROM companies
        WHERE name ILIKE '%' || $1 || '%' 
        AND num_employees BETWEEN $2 AND $3`,
        [name, minEmployees, maxEmployees]
    );
    if (!companiesRes.rows[0]) throw new NotFoundError(`No company found`);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
