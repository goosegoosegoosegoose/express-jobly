const { BadRequestError } = require("../expressError");

// Accepts req.body json object that includes the columns and values to change as dataToUpdate param
// jsToSql is dependent of if it is used to change User or Company model data
// it essentially maps the columns and values separately so they could be plugged into a sql query easily

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
