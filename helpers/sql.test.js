const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");
const Company = require("../models/company");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("../models/_testCommon");

  
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("sqlForPartialUpdate", () => {
    test("Partial update user", async () => {
        const company = Company.get("c1")
        const changes = {
            name: "C4",
            numEmployees: 5
        };
        const result = sqlForPartialUpdate(changes, {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
          });
        
        expect(result).toEqual({
            setCols: "\"name\"=$1, \"num_employees\"=$2",
            // what
            values: ["C4", 5]
        })
    })
});