/*
THIS IS A TEMP FILE SO THAT TARIFF SERVICES ARE SEPARATED FROM 'server.js'
Currently, 'server.js' is broken and does not function with any request
To not halt the progress of TariffManagement I added this file to host the related
APIs TEMPORARILY until we fix 'server.js'.
*/

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 4000;

function handleDbError(res, err) {
  console.error(err);
  res.status(500).json({
    error: err.message || "Server Error"
  });
}

let tariffs = [
  {
    id: 1,
    type: "Entrance fee",
    rate: 80.00,
    description: "First hour entrance"
  },
  {
    id: 2,
    type: "Hourly",
    rate: 40.00,
    description: "Hourly fee after the first hour"
  }
];

app.get("/api/getTariffs", async (req, res) => {

  try {
    res.json(tariffs);
  }
  catch (err) {
    console.log("GET /api/getTariffs failed");
    handleDbError(res, err);
  }

});

app.post("/api/updateTariff", async (req, res) => {

  const { id, rate } = req.body;

  if (id == null || rate == null) {
    return res.status(400).json({
      error: "id and rate are required"
    });
  }
  try {
    const tariff = tariffs.find(t => t.id === id);
    if (!tariff) {
      return res.status(404).json({
        error: "Tariff not found"
      });
    }
    tariff.rate = rate;
    res.json({
      success: true,
      message: "Tariff updated.",
      tariff
    });
  }
  catch (err) {
    console.log("POST /api/updateTariff failed");
    handleDbError(res, err);
  }

});


app.listen(PORT, () => {
  console.log(
    `Tariff server is running on http://localhost:${PORT}`
  );
});