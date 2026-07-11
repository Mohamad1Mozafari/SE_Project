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



// * Dashboard (Dashboard.tsx) *

// GET summary statistics for the dashboard stat cards
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      DECLARE @today DATE = CAST(GETDATE() AS DATE);
      DECLARE @yesterday DATE = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE);

      SELECT
        (SELECT COUNT(*) FROM Spot) AS total_capacity,
        (SELECT COUNT(*) FROM Vehicle) AS occupied_spaces,
        (
          (SELECT COUNT(*) FROM Vehicle WHERE CAST(entrance_time AS DATE) = @today)
          +
          (SELECT COUNT(*) FROM LogVehicle WHERE CAST(entrance_time AS DATE) = @today)
        ) AS entries_today,
        (SELECT COUNT(*) FROM LogVehicle WHERE CAST(exit_time AS DATE) = @today) AS exits_today,
        (SELECT ISNULL(SUM(cost_paid), 0) FROM LogVehicle WHERE CAST(exit_time AS DATE) = @today) AS todays_revenue,
        (SELECT ISNULL(SUM(cost_paid), 0) FROM LogVehicle WHERE CAST(exit_time AS DATE) = @yesterday) AS yesterdays_revenue
    `);

    const row = result.recordset[0];
    const totalCapacity = row.total_capacity;
    const occupiedSpaces = row.occupied_spaces;
    const entriesToday = row.entries_today;
    const exitsToday = row.exits_today;
    const todaysRevenue = Number(row.todays_revenue);
    const yesterdaysRevenue = Number(row.yesterdays_revenue);

    let revenueTrendPct = null;
    if (yesterdaysRevenue > 0) {
      revenueTrendPct = Math.round(((todaysRevenue - yesterdaysRevenue) / yesterdaysRevenue) * 100);
    }

    res.json({
      total_capacity: totalCapacity,
      occupied_spaces: occupiedSpaces,
      available_spaces: totalCapacity - occupiedSpaces,
      net_change_today: entriesToday - exitsToday,
      todays_revenue: todaysRevenue,
      revenue_trend_pct: revenueTrendPct,
    });
  } catch (err) {
    handleDbError(res, err);
  }
});

// GET the 10 most recent entries/exits (uses the existing VIEW_RecentActivity view)
app.get("/api/dashboard/recent_activity", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 10 plate_number, action, event_time, spot
      FROM VIEW_RecentActivity
      ORDER BY event_time DESC
    `);

    res.json(
      result.recordset.map((r) => ({
        plate_number: r.plate_number ? r.plate_number.trim() : null,
        action: r.action,
        event_time: r.event_time,
        spot: r.spot ? r.spot.trim() : null,
      }))
    );
  } catch (err) {
    handleDbError(res, err);
  }
});




// * Vehicle Entry (VehicleEntry.tsx) *

// GET available parking spots
app.get("/api/vehicle_entry/available_spots", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT s.location
      FROM Spot s
      WHERE s.location NOT IN (
        SELECT v.location
        FROM Vehicle v
        WHERE v.location IS NOT NULL
      )
      ORDER BY s.location
    `);
    res.json(result.recordset.map((r) => r.location));
  } catch (err) {
    handleDbError(res, err);
  }
});

// Vehicle Registration
app.post("/api/vehicle_entry", async (req, res) => {
  const { plate_number, brand, location } = req.body;
  if (!plate_number || !location) {
    return res.status(400).json({ error: "Plate number and location is required" });
  }

  try {
    const pool = await poolPromise;

    // Check whether the Vehicle is not already in parking
    const plateCheck = await pool
      .request()
      .input("plate_number", sql.Char(11), plate_number)
      .query("SELECT plate_number FROM Vehicle WHERE plate_number = @plate_number ;");
    if (plateCheck.recordset.length > 0) {
      return res.status(409).json({ error: "This Vehicle is Already in Parking" });
    }

    // Check whether the selected location is not already occupied (Check Parking Spot Availability)
    const spotCheck = await pool
      .request()
      .input("location", sql.Char(4), location)
      .query("SELECT plate_number FROM Vehicle WHERE location = @location");
    if (spotCheck.recordset.length > 0) {
      return res.status(409).json({ error: "This location is full for now" });
    }

    // Insert Vehicle in database
    await pool
      .request()
      .input("plate_number", sql.Char(11), plate_number)
      .input("brand", sql.VarChar(30), brand || null)
      .input("location", sql.Char(4), location)
      .query(`
        INSERT INTO Vehicle (plate_number, entrance_time, brand, location)
        VALUES (@plate_number, GETDATE(), @brand, @location)
      `);

    res.status(201).json({success:true, message: "Vehicle entry has been successfully recorded" });
  } catch (err) {
    handleDbError(res, err);
  }
});



// * Vehicle Exit (VehicleExit.tsx) *

// Get current cost policy to show in the sidebar(under '$ pricing' text)
app.get("/api/vehicle_exit/pricing", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 1 entrance_fee, hourly_fee
      FROM CostPolicy
      ORDER BY costID DESC
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "No pricing policy has been defined yet" });
    }

    res.json({
      entrance_fee: result.recordset[0].entrance_fee,
      hourly_fee: result.recordset[0].hourly_fee,
    });
  } catch (err) {
    handleDbError(res, err);
  }
});

// Get Vehicle information before exit confirmation
app.get("/api/vehicle/:plate_number", async (req, res) => {
  const { plate_number } = req.params;

  try {
    const pool = await poolPromise;
    const vehicleResult = await pool
      .request()
      .input("plate_number", sql.Char(11), plate_number)
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

    // fee preview for the operator (final cost will calculate by a stored procedure in the database at confirm time)
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

// Confirm Vehicle Exit
// Uses the 'RegisterVehicleExit' stored procedure, to calculate the final cost and move the record from Vehicle to LogVehicle
app.post("/api/vehicle-exit", async (req, res) => {
  const { plate_number } = req.body;
  if (!plate_number) {
    return res.status(400).json({ error: "Plate number is required" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("plate_number", sql.Char(11), plate_number)
      .execute("RegisterVehicleExit");

    res.json(result.recordset[0]); // { EntranceTime, ExitTime, DurationHours, TotalCost }
  } catch (err) {
    handleDbError(res, err);
  }
});


// * Parking Status (ParkingStatus.tsx) *

// GET the current status of every parking spot (occupied or available)
app.get("/api/parking_status", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT s.location, v.plate_number, v.entrance_time
      FROM Spot s
      LEFT JOIN Vehicle v ON v.location = s.location
      ORDER BY s.location
    `);

    const spots = result.recordset.map((row) => ({
      location: row.location.trim(),
      is_occupied: row.plate_number !== null,
      plate_number: row.plate_number ? row.plate_number.trim() : null,
      entrance_time: row.entrance_time,
    }));

    res.json(spots);
  } catch (err) {
    handleDbError(res, err);
  }
});



app.get("/api/getTariffs", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 1 entrance_fee, hourly_fee
      FROM CostPolicy
      ORDER BY costID DESC
    `);
    const row = result.recordset[0];
    const tariffs = [
      {
        id: 1,
        type: "Entrance fee",
        rate: row.entrance_fee,
        description: "First hour entrance"
      },
      {
        id: 2,
        type: "Hourly",
        rate: row.hourly_fee,
        description: "Hourly fee after the first hour"
      }
    ];
    res.json(tariffs);
  }
  catch (err) {
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
    const pool = await poolPromise;
    const affected_tariff = 
      id === 1 
        ? "entrance_fee" 
        : "hourly_fee";
    await pool.request()
      .input("rate", sql.Money, rate)
      .query(`
        UPDATE CostPolicy
        SET ${affected_tariff} = @rate
      `); // TODO: this command may be susceptible to SQL-injection. Fix later
    res.json({
      success: true,
      message: "Tariff updated."
    });
  }
  catch (err) {
    handleDbError(res, err);
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
