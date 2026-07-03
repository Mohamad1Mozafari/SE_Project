const express = require("express");
const cors = require("cors");
const { sql, poolPromise } = require("./db");

const app = express();
app.use(cors());
app.use(express.json()); 
const PORT = 3000;

function handleDbError(res, err) {
  console.error(err);
  res.status(500).json({ error: err.message || "Server Error" });
}

// User Login Verification (Login.tsx)
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and Password is required" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("username", sql.VarChar(20), username)
      .input("password", sql.NVarChar(20), password)
      .query(`
        SELECT a.username, a.fullName,
          CASE
            WHEN o.username IS NOT NULL THEN 'operator'
            WHEN ow.username IS NOT NULL THEN 'owner'
            WHEN ad.username IS NOT NULL THEN 'admin'
          END AS role
        FROM Account a
        LEFT JOIN Operator o ON o.username = a.username
        LEFT JOIN Owner    ow ON ow.username = a.username
        LEFT JOIN Admin    ad ON ad.username = a.username
        WHERE a.username = @username AND a.pass = @password;
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Username or Password is wrong" });
    }

    res.json(result.recordset[0]); // { username, fullName, role }
  } catch (err) {
    handleDbError(res, err);
  }
});


// Get the Spots status (ParkingStatus.tsx & VehicleEntry.tsx)
app.get("/api/parking-status", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT s.location, v.plate_number, v.brand, v.entrance_time
      FROM Spot s
      LEFT JOIN Vehicle v ON v.location = s.location
      ORDER BY s.location;
    `);
    res.json(result.recordset);
  } catch (err) {
    handleDbError(res, err);
  }
});

// General statistics of Dashboard (Dashboard.tsx)
app.get("/api/dashboard-stats", async (req, res) => {
  try {
    const pool = await poolPromise;
                                                    // Total Parking Capacity
    const capacityResult = await pool.request().query("SELECT COUNT(*) AS total FROM Spot;");
    const occupiedResult = await pool
      .request()
      // Occupied Vehicles Count
      .query("SELECT COUNT(*) AS occupied FROM Vehicle WHERE location IS NOT NULL;");
      // Today's Revenue calculation
    const revenueResult = await pool.request().query(`
      SELECT ISNULL(SUM(cost_paid), 0) AS todayRevenue
      FROM LogVehicle
      WHERE CAST(exit_time AS DATE) = CAST(GETDATE() AS DATE);
    `);

    const totalCapacity = capacityResult.recordset[0].total;
    const occupied = occupiedResult.recordset[0].occupied;

    res.json({
      totalCapacity,
      occupied,
      available: totalCapacity - occupied,
      todayRevenue: revenueResult.recordset[0].todayRevenue,
    });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Recent Entry/Exit Activity of Vehicles (Dashboard.tsx)
app.get("/api/recent-activity", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 10 * FROM VIEW_RecentActivity
      ORDER BY event_time DESC;
    `);
    res.json(result.recordset);
  } catch (err) {
    handleDbError(res, err);
  }
});

// VehicleEntry.tsx
app.post("/api/vehicle-entry", async (req, res) => {
  const { plate_number, brand, location } = req.body;
  if (!plate_number || !location) {
    return res.status(400).json({ error: "Plate number and location is required" });
  }

  try {
    const pool = await poolPromise;

    // Check whether the Vehicle is not already in parking
    const plateCheck = await pool
      .request()
      .input("plate_number", sql.Char(9), plate_number)
      .query("SELECT plate_number FROM Vehicle WHERE plate_number = @plate_number ;");
    if (plateCheck.recordset.length > 0) {
      return res.status(409).json({ error: "This Vehicle is Already in Parking" });
    }

    // Check whether the selected location is not already occupied (Check Parking Spot Availability)
    const spotCheck = await pool
      .request()
      .input("location", sql.Char(3), location)
      .query("SELECT plate_number FROM Vehicle WHERE location = @location");
    if (spotCheck.recordset.length > 0) {
      return res.status(409).json({ error: "This location is full for now" });
    }

    // Insert Vehicle Entry
    await pool
      .request()
      .input("plate_number", sql.Char(9), plate_number)
      .input("brand", sql.VarChar(30), brand || null)
      .input("location", sql.Char(3), location)
      .query(`
        INSERT INTO Vehicle (plate_number, entrance_time, brand, location)
        VALUES (@plate_number, GETDATE(), @brand, @location)
      `);

    res.status(201).json({ message: "Vehicle entry has been successfully recorded" });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Get Vehicle information before exit confirmation (VehicleExit.tsx)
app.get("/api/vehicle/:plate_number", async (req, res) => {
  const { plate_number } = req.params;

  try {
    const pool = await poolPromise;
    const vehicleResult = await pool
      .request()
      .input("plate_number", sql.Char(9), plate_number)
      .query(`SELECT plate_number, entrance_time, location, brand
              FROM Vehicle
              WHERE plate_number = @plate_number`);

    if (vehicleResult.recordset.length === 0) {
      return res.status(404).json({ error: "This Vehicle was not found in the Parking" });
    }

    const vehicle = vehicleResult.recordset[0];

    const costResult = await pool
      .request()
      .query(`SELECT TOP 1 entrance_fee, hourly_fee
              FROM CostPolicy
              ORDER BY costID DESC`);
    const entranceFee = costResult.recordset[0]?.entrance_fee ?? 0;
    const hourlyFee = costResult.recordset[0]?.hourly_fee ?? 0;

    // Cost Preview for user
    const entranceTime = new Date(vehicle.entrance_time);
    const now = new Date();
    const durationMinutes = Math.round((now - entranceTime) / 60000);
    const durationHours = Math.ceil(durationMinutes / 60);
    const estimatedFee = Number(entranceFee) + durationHours * Number(hourlyFee);

    res.json({
      plate_number: vehicle.plate_number,
      location: vehicle.location,
      brand: vehicle.brand,
      entrance_time: vehicle.entrance_time,
      estimated_exit_time: now,
      estimated_duration_hours: durationHours,
      estimated_fee: estimatedFee,
    });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Confirm Vehicle Exit (VehicleExit.tsx)
// Using Stored Procedure(RegisterVehicleExit) in SQL Server that i made before, to calculate the cost
app.post("/api/vehicle-exit", async (req, res) => {
  const { plate_number } = req.body;
  if (!plate_number) {
    return res.status(400).json({ error: "Plate number is required" });
  }
  // Execute "EXEC RegisterVehicleExit @plate_number = ....;"  in SQL Server
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("plate_number", sql.Char(9), plate_number)
      .execute("RegisterVehicleExit");

    res.json(result.recordset[0]); // { EntranceTime, ExitTime, DurationHours, TotalCost }
  } catch (err) {
    handleDbError(res, err);
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
