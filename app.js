const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");

const app = express();
app.use(express.json());
module.exports = app;

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3004, () => {
      console.log("Server is running at http://localhost:3004 Successfully");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
            SELECT 
                  * 
            FROM state;
    `;

  const statesArray = await db.all(getStatesQuery);
  response.send(
    statesArray.map((eachState) => {
      return {
        stateId: eachState.state_id,
        stateName: eachState.state_name,
        population: eachState.population,
      };
    })
  );
});

//API 2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;

  const getStateQuery = `
        SELECT 
            * 
        FROM state 
        WHERE state_id = '${stateId}';
    `;

  const state = await db.get(getStateQuery);
  response.send({
    stateId: state["state_id"],
    stateName: state["state_name"],
    population: state["population"],
  });
});

//API 3
app.post("/districts/", async (request, response) => {
  const requestDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = requestDetails;
  const postQuery = `
        INSERT INTO district (district_name, state_id, cases, cured, active, deaths)
        VALUES(
            '${districtName}',
            '${stateId}',
            '${cases}',
            '${cured}',
            '${active}',
            '${deaths}'
        );

    `;

  await db.run(postQuery);
  response.send("District Successfully Added");
});

//API 4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
        SELECT 
            * 
        FROM 
            district 
        WHERE 
            district_id ='${districtId}';
    `;
  const district = await db.get(getDistrictQuery);
  response.send({
    districtId: district["district_id"],
    districtName: district["district_name"],
    stateId: district["state_id"],
    cases: district["cases"],
    cured: district["cured"],
    active: district["active"],
    death: district["death"],
  });
});

//API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `
    DELETE FROM 
      district 
      WHERE district_id = '${districtId}'
    `;
  await db.run(deleteQuery);
  response.send("District Removed");
});

//API 6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const updateDetails = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = updateDetails;
  const updateQuery = `
    UPDATE district 
    SET 
        district_name = '${districtName}',
        state_id = '${stateId}',
        cases = '${cases}',
        cured = '${cured}',
        active = '${active}',
        deaths = '${deaths}'
    WHERE district_id = '${districtId}';
    `;

  await db.run(updateQuery);
  response.send("District Details Updated");
});

//API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatsQuery = `
        SELECT 
          SUM(cases),
          SUM(cured),
          SUM(active),
          SUM(deaths)
        FROM district
        WHERE state_id = '${stateId}';
    `;
  const stats = await db.get(getStatsQuery);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});

//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateIdQuery = `
    SELECT 
       state_id
    FROM 
       district 
    WHERE 
       district_id = '${districtId}';
    `;
  const stateId = await db.get(getStateIdQuery);

  const getStateNameQuery = `
    SELECT 
       state_name 
    FROM state 
    WHERE state_id = '${stateId.state_id}';
  `;

  const stateName = await db.get(getStateNameQuery);
  response.send({ stateName: stateName });
});
