//server.js
// import { sql, poolPromise } from "./db.js";
// import express from 'express' ;
// import cors from "cors"; 
const dayjs = require('dayjs');
const express = require("express");
const cors = require("cors");
const { sql, poolPromise } = require("./db");
const currentDate = dayjs();
let toDay = currentDate.format('YYYY-MM-DD') ; 

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
    return res.status(400).json({ error: "Username and Password are required" });
  }

  try {
    const pool = await poolPromise;
    
    const result = await pool
      .request()
      .input("username", sql.VarChar(20), username)
      .input("password", sql.NVarChar(255), password) 
      .query(`
        SELECT 
          a.username, 
          a.full_name AS fullName,
          CASE
            WHEN o.username IS NOT NULL THEN 'operator'
            WHEN ow.username IS NOT NULL THEN 'owner'
            WHEN ad.username IS NOT NULL THEN 'admin'
            ELSE 'user' 
          END AS role
        FROM Account a
        LEFT JOIN Operator o ON o.username = a.username
        LEFT JOIN Owner    ow ON ow.username = a.username
        LEFT JOIN Admin    ad ON ad.username = a.username
        WHERE a.username = @username AND a.password = @password;
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Username or Password is wrong" });
    }

    // Sends back the first record: { username, fullName, role }
    return res.json(result.recordset[0]); 
  } catch (err) {
    handleDbError(res, err);
  }
});



///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// server.js or your routes file


// Helper to deduce a user's role string based on sub-table presence
// or to map custom input roles to the respective DB sub-tables
const VALID_ROLES = ['admin', 'operator', 'owner'];



// 1. GET ALL USERS
app.get("/api/user_management/get_all_userInfo", async (req, res) => {
  try {
    const pool = await poolPromise;
    
    const result = await pool.request().query(`
      SELECT 
        a.username, 
        a.full_name,
        a.email,
        CASE 
          WHEN adm.username IS NOT NULL THEN 'Admin'
          WHEN ow.username IS NOT NULL THEN 'Manager'
          WHEN op.username IS NOT NULL THEN 'Operator'
          ELSE 'Operator' 
        END AS role
      FROM Account a
      LEFT JOIN Admin adm ON a.username = adm.username
      LEFT JOIN Operator op ON a.username = op.username
      LEFT JOIN Owner ow ON a.username = ow.username
    `);

    res.json(result.recordset); 
  } catch (err) {
    handleDbError(res, err);
  }
});

// Helper Function: Check if username is unique
async function check_username_unique(username) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("username", sql.VarChar(20), username)
    .query(`SELECT username FROM Account WHERE username = @username`);
  
  if (result.recordset.length > 0) {
    return { unique: false, message: "username used and not unique" };
  }
  return { unique: true, message: "username is unique" };
}

// 2. DELETE USER
app.post("/api/user_management/delete_user", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Missing username" });

    const pool = await poolPromise;
    
    await pool.request()
      .input("username", sql.VarChar(20), username)
      .query(`DELETE FROM Account WHERE username = @username`);

    res.json("success");
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



// 3. EDIT USER (Fixed transaction error throwing and tracking)
// 3. EDIT USER (Fixed parameter mismatch and role mapping variables)
app.post("/api/user_management/edit_user", async (req, res) => {
  try {
    const { username, name, email, role, password } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: "Username identifier missing" });
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    await transaction.begin();
    try {
      const request = new sql.Request(transaction);

      request.input("username", sql.VarChar(20), username);
      request.input("name", sql.VarChar(50), name);
      request.input("email", sql.NVarChar(50), email);

      // 1. Update core Account information and verify execution row counts
      let updateResult;
      if (password && password.trim() !== "") {
        request.input("password", sql.NVarChar(255), password);
        updateResult = await request.query(`
          UPDATE Account 
          SET full_name = @name, email = @email, password = @password
          WHERE username = @username
        `);
      } else {
        updateResult = await request.query(`
          UPDATE Account 
          SET full_name = @name, email = @email
          WHERE username = @username
        `);
      }

      if (updateResult.rowsAffected[0] === 0) {
        throw new Error("User account not found.");
      }

      // 2. Handle Role changes elegantly without erasing data unnecessarily
      if (role) {
        const cleanedRole = role.toLowerCase();

        // Safe verification check: does this person already belong to this role sub-table?
        let currentRoleMatch = false;
        if (cleanedRole === 'admin') {
          const check = await request.query(`SELECT 1 FROM Admin WHERE username = @username`);
          if (check.recordset.length > 0) currentRoleMatch = true;
        } else if (cleanedRole === 'operator') {
          const check = await request.query(`SELECT 1 FROM Operator WHERE username = @username`);
          if (check.recordset.length > 0) currentRoleMatch = true;
        } else if (cleanedRole === 'manager' || cleanedRole === 'owner') {
          const check = await request.query(`SELECT 1 FROM Owner WHERE username = @username`);
          if (check.recordset.length > 0) currentRoleMatch = true;
        }

        // Only swap sub-tables if the target destination role actually changed
        if (!currentRoleMatch) {
          await request.query(`
            DELETE FROM Admin WHERE username = @username;
            DELETE FROM Operator WHERE username = @username;
            DELETE FROM Owner WHERE username = @username;
          `);

          if (cleanedRole === 'admin') {
            await request.query(`INSERT INTO Admin (username) VALUES (@username)`);
          } else if (cleanedRole === 'operator') {
            await request.query(`INSERT INTO Operator (username, join_date) VALUES (@username, GETDATE())`);
          } else if (cleanedRole === 'manager' || cleanedRole === 'owner') {
            await request.query(`INSERT INTO Owner (username) VALUES (@username)`);
          }
        }
      }

      await transaction.commit();
      return res.json({ success: true });
    } catch (txErr) {
      await transaction.rollback();
      console.error("DUE TO DB SCHEMA RULE CONSTRAINT:", txErr.message);
      return res.status(400).json({ success: false, message: txErr.message });
    }
  } catch (err) {
    handleDbError(res, err);
  }
});

// 4. ADD USER
app.post("/api/user_management/add_user", async (req, res) => {
  try {
    const { username, new_name, email, new_role, password } = req.body;
    
    if (!username) return res.status(400).json({ error: "Username required" });
    
    // Check uniqueness (Fixed async/await invocation syntax)
    const checkStatus = await check_username_unique(username); 
    if (!checkStatus.unique) {
      return res.status(200).json("failed username is used");
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    await transaction.begin();
    try {
      await transaction.request()
        .input("username", sql.VarChar(20), username)
        .input("password", sql.NVarChar(255), password) 
        .input("name", sql.VarChar(50), new_name)
        .input("email", sql.NVarChar(50), email)
        .query(`
          INSERT INTO Account (username, password, full_name, email) 
          VALUES (@username, @password, @name, @email)
        `);

      const cleanedRole = new_role?.toLowerCase();
      if (cleanedRole === 'admin') {
        await transaction.request().input("username", sql.VarChar(20), username)
          .query(`INSERT INTO Admin (username) VALUES (@username)`);
      } else if (cleanedRole === 'operator') {
        await transaction.request().input("username", sql.VarChar(20), username)
          .query(`INSERT INTO Operator (username, join_date) VALUES (@username, GETDATE())`);
      } else if (cleanedRole === 'manager' || cleanedRole === 'owner') {
        await transaction.request().input("username", sql.VarChar(20), username)
          .query(`INSERT INTO Owner (username) VALUES (@username)`);
      }

      await transaction.commit();
      res.json("success");
    } catch (txErr) {
      await transaction.rollback();
      throw txErr;
    }
  } catch (err) {
    handleDbError(res, err);
  }
});
// =====================================================================
// SHIFT MANAGEMENT + SHIFT CHANGE REQUEST APIs
// Paste this block into server.js, above app.listen(...).
// Requires: sql, poolPromise, dayjs, toDay, handleDbError — all already
// declared at the top of your server.js, so no new imports needed.
// =====================================================================
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ---- helpers ---------------------------------------------------------

// ADDED: Missing helper function to resolve the select query layout for shift requests
function shiftRequestSelect(whereClause = "") {
  // to see the original query visit the previous commits
  return `
    SELECT
      sr.requestID AS id,
      sr.operatorusername AS requestedBy,
      FORMAT(sr.requestDate, 'yyyy-MM-dd HH:mm') AS date,
      sr.status,
      CONCAT(curr.shiftType, ' (', FORMAT(curr.shiftDate, 'yyyy-MM-dd'), ')') AS currentShift,
      CONCAT(sr.shiftType, ' (', FORMAT(sr.shiftDate, 'yyyy-MM-dd'), ')') AS requestedShift,
      sr.reason_comment AS reason
      FROM ShiftRequest AS sr LEFT JOIN ShiftManagement AS curr
      ON sr.currentShiftID = curr.shiftID
      ${whereClause}
      ORDER BY sr.requestID DESC
  `
}

async function resolveOperatorUsername(identifier) {
  if (!identifier) return null;
  const pool = await poolPromise;
  const result = await pool.request()
    .input("id", sql.VarChar(50), identifier)
    .query(`
      SELECT a.username
      FROM Account a
      INNER JOIN Operator o ON o.username = a.username
      WHERE a.username = @id OR a.full_name = @id
    `);
  return result.recordset[0]?.username || null;
}

function getWeekDates(offsetWeeks = 0) {
  const base = dayjs().add(offsetWeeks * 7, "day");
  const isoDay = base.day() === 0 ? 7 : base.day(); // Mon=1 ... Sun=7
  const monday = base.subtract(isoDay - 1, "day");
  const dates = [];
  for (let i = 0; i < 7; i++) dates.push(monday.add(i, "day"));
  return dates;
}

async function loadWeekSchedule(offsetWeeks) {
  const weekDates = getWeekDates(offsetWeeks);
  const startDate = weekDates[0].format("YYYY-MM-DD");
  const endDate = weekDates[6].format("YYYY-MM-DD");

  const pool = await poolPromise;
  const result = await pool.request()
    .input("start", sql.Date, startDate)
    .input("end", sql.Date, endDate)
    .query(`
      SELECT sm.shiftDate, sm.shiftType, a.full_name
      FROM ShiftManagement sm
      INNER JOIN Account a ON a.username = sm.operatorID
      WHERE sm.shiftDate BETWEEN @start AND @end
        AND sm.status <> 'Cancelled'
      ORDER BY sm.shiftDate
    `);

  const schedule = weekDates.map((d, idx) => ({
    day: DAY_NAMES[idx],
    date: d.format("YYYY-MM-DD"),
    morning: [],
    evening: [],
    night: []
  }));

  result.recordset.forEach(row => {
    const rowDate = dayjs(row.shiftDate).format("YYYY-MM-DD");
    const match = schedule.find(s => s.date === rowDate);
    if (!match) return;
    const key = row.shiftType.toLowerCase();
    if (match[key]) match[key].push(row.full_name);
  });

  return schedule;
}

async function loadTodayShift(shiftType) {
  const pool = await poolPromise;
  const currentTodayStr = dayjs().format('YYYY-MM-DD'); // Prevents stale values over long server runtimes
  const result = await pool.request()
    .input("today", sql.Date, currentTodayStr)
    .input("shiftType", sql.VarChar(10), shiftType)
    .query(`
      SELECT a.full_name
      FROM ShiftManagement sm
      INNER JOIN Account a ON a.username = sm.operatorID
      WHERE sm.shiftDate = @today AND sm.shiftType = @shiftType
        AND sm.status <> 'Cancelled'
    `);
  return result.recordset.map(r => r.full_name);
}

// =====================================================================
// SHIFT MANAGEMENT ENDPOINTS
// =====================================================================

// 1. Fetch all system operators dynamically from database
app.get("/api/shift_management/Operators", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.query(`
      SELECT a.full_name 
      FROM Account a
      INNER JOIN Operator o ON o.username = a.username
      ORDER BY a.full_name ASC
    `);
    const operatorNames = result.recordset.map(r => r.full_name);
    res.json(operatorNames);
  } catch (err) {
    handleDbError(res, err);
  }
});

app.get("/api/shift_management/Morning_shift_load", async (req, res) => {
  try { res.json({ operators: await loadTodayShift("Morning") }); }
  catch (err) { handleDbError(res, err); }
});

app.get("/api/shift_management/Evening_shift_load", async (req, res) => {
  try { res.json({ operators: await loadTodayShift("Evening") }); }
  catch (err) { handleDbError(res, err); }
});

app.get("/api/shift_management/Night_shift_load", async (req, res) => {
  try { res.json({ operators: await loadTodayShift("Night") }); }
  catch (err) { handleDbError(res, err); }
});

// Consolidates structural load routines into single dynamic offset processor
app.get("/api/shift_management/Weekly_Schedule_load", async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    res.json(await loadWeekSchedule(offset));
  } catch (err) { handleDbError(res, err); }
});

app.get("/api/shift_management/Shift_Coverage_load", async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const weekDates = getWeekDates(offset);
    const startDate = weekDates[0].format("YYYY-MM-DD");
    const endDate = weekDates[6].format("YYYY-MM-DD");

    const pool = await poolPromise;
    const result = await pool.request()
      .input("start", sql.Date, startDate)
      .input("end", sql.Date, endDate)
      .query(`
        SELECT DISTINCT shiftDate, shiftType
        FROM ShiftManagement
        WHERE shiftDate BETWEEN @start AND @end AND status <> 'Cancelled'
      `);
    
    const covered = result.recordset.length;
    const totalSlots = 7 * 3; 
    const uncovered = Math.max(totalSlots - covered, 0);

    res.json({ covered, uncovered });
  } catch (err) { handleDbError(res, err); }
});

app.post("/api/shift_management/Create_shift", async (req, res) => {
  try {
    const { usernames, time, date } = req.body;
    if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ error: "At least one operator is required" });
    }
    if (!["Morning", "Evening", "Night"].includes(time)) {
      return res.status(400).json({ error: "Invalid shift type" });
    }

    const pool = await poolPromise;
    const inserted = [];
    const skipped = [];
    for (const identifier of usernames) {
      const username = await resolveOperatorUsername(identifier);
      if (!username) { skipped.push(identifier); continue; }

      try {
        await pool.request()
          .input("operatorID", sql.VarChar(20), username)
          .input("shiftDate", sql.Date, date)
          .input("shiftType", sql.VarChar(10), time)
          .query(`
            INSERT INTO ShiftManagement (operatorID, shiftDate, shiftType, status)
            VALUES (@operatorID, @shiftDate, @shiftType, 'Scheduled')
          `);
        inserted.push(username);
      } catch (e) {
        skipped.push(identifier);
      }
    }
    res.json({ success: true, inserted, skipped });
  } catch (err) { handleDbError(res, err); }
});

app.post("/api/shift_management/Weekly_Schedule_edit", async (req, res) => {
  try {
    const { shift, day, username, date } = req.body; // Front-end now passes explicit target date
    const mappedUsername = await resolveOperatorUsername(username);

    if (!mappedUsername) {
      return res.status(400).json({ error: "Operator not found" });
    }

    const pool = await poolPromise;
    // Standardizes database casing formatting structure
    const formattedShift = shift.charAt(0).toUpperCase() + shift.slice(1).toLowerCase();

    await pool.request()
      .input("operatorID", sql.VarChar(20), mappedUsername)
      .input("shiftDate", sql.Date, date)
      .input("shiftType", sql.VarChar(10), formattedShift)
      .query(`
        IF NOT EXISTS (
          SELECT 1 FROM ShiftManagement 
          WHERE operatorID = @operatorID AND shiftDate = @shiftDate AND shiftType = @shiftType AND status <> 'Cancelled'
        )
        BEGIN
          INSERT INTO ShiftManagement (operatorID, shiftDate, shiftType, status)
          VALUES (@operatorID, @shiftDate, @shiftType, 'Scheduled')
        END
      `);

    res.json("success");
  } catch (err) {
    res.status(500).json(err.message);
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
    const estimatedFee = Number(entranceFee) + (durationHours - 1) * Number(hourlyFee);

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

// =====================================================================
// SHIFT CHANGE REQUEST — operator side (ShiftChangeRequest_operator_view.js)
// =====================================================================

app.post("/api/shift_change_reuqest_operator/new_request", async (req, res) => {
  try {
    const { username, id_shift_current, shiftDate, shiftType } = req.body;
    const operatorUsername = await resolveOperatorUsername(username);
    if (!operatorUsername) return res.status(404).json({ error: "Operator not found" });
    if (!id_shift_current) return res.status(400).json({ error: "id_shift_current is required" });

    const pool = await poolPromise;
    await pool.request()
      .input("currentShiftID", sql.Int, id_shift_current)
      .input("inputShiftDate", sql.Date, shiftDate)
      .input("inputShiftType", sql.VarChar(10), shiftType)
      .input("operatorusername", sql.VarChar(20), operatorUsername)
      .query(`
        INSERT INTO ShiftRequest (currentShiftID, requestedShiftID, operatorusername, requestType, status, shiftDate, shiftType)
        VALUES (@currentShiftID, NULL, @operatorusername, 'ShiftChange', 'Pending', @inputShiftDate, @inputShiftType)
      `);

    res.json("success");
  } catch (err) { handleDbError(res, err); }
});

// The operator's own upcoming scheduled shifts — used to pick "current shift" to change.
app.post("/api/shift_change_reuqest_operator/current_sift", async (req, res) => {
  try {
    const operatorUsername = await resolveOperatorUsername(req.body.username);
    if (!operatorUsername) return res.status(404).json({ error: "Operator not found" });

    const pool = await poolPromise;
    const result = await pool.request()
      .input("operatorID", sql.VarChar(20), operatorUsername)
      .input("today", sql.Date, toDay)
      .query(`
        SELECT shiftID, shiftDate, shiftType
        FROM ShiftManagement
        WHERE operatorID = @operatorID AND shiftDate >= @today AND status = 'Scheduled'
        ORDER BY shiftDate, shiftType
      `);

    res.json(result.recordset);
  } catch (err) { handleDbError(res, err); }
});

// select the operatros in the 
// SELECT the requested shifts available in the next 7 days
app.post("/api/shift_change_reuqest_operator/requested_shift", async (req, res) => {
  try {
    const operatorUsername = await resolveOperatorUsername(req.body.username);
    if (!operatorUsername) return res.status(404).json({ error: "Operator not found" });

    // FIX 1: Define the current date to prevent ReferenceError
    const toDay = new Date(); 

    const pool = await poolPromise;
    const result = await pool.request()
      .input("operatorID", sql.VarChar(20), operatorUsername)
      .input("today", sql.Date, toDay)
      .query(`
        SELECT shiftID, shiftDate, shiftType, status, operatorID
        FROM ShiftManagement
        WHERE 
            -- FIX 2 & 3: Find shifts with NO operator (free) 
            operatorID IS NULL 
            -- Find shifts from today up to 7 days from now
            AND shiftDate >= @today 
            AND shiftDate <= DATEADD(day, 7, @today)
            -- Ensure the shift is still valid
            AND status <> 'Cancelled'
        ORDER BY shiftDate, shiftType
      `);

    res.json(result.recordset);
  } catch (err) { 
      handleDbError(res, err); 
  }
});

async function loadOperatorRequests(operatorUsername, status) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("operatorID", sql.VarChar(20), operatorUsername)
    .input("status", sql.VarChar(20), status)
    .query(shiftRequestSelect("WHERE sr.operatorusername = @operatorID AND sr.status = @status"));
  return result.recordset;
}

app.post("/api/shift_change_reuqest_operator/pending_request", async (req, res) => {
  try {
    const operatorUsername = await resolveOperatorUsername(req.body.username);
    if (!operatorUsername) return res.status(404).json({ error: "Operator not found" });
    res.json(await loadOperatorRequests(operatorUsername, "Pending"));
  } catch (err) { handleDbError(res, err); }
});

app.post("/api/shift_change_reuqest_operator/aproved_request", async (req, res) => {
  try {
    const operatorUsername = await resolveOperatorUsername(req.body.username);
    if (!operatorUsername) return res.status(404).json({ error: "Operator not found" });
    res.json(await loadOperatorRequests(operatorUsername, "Approved"));
  } catch (err) { handleDbError(res, err); }
});

app.post("/api/shift_change_reuqest_operator/rejected_request", async (req, res) => {
  try {
    const operatorUsername = await resolveOperatorUsername(req.body.username);
    if (!operatorUsername) return res.status(404).json({ error: "Operator not found" });
    res.json(await loadOperatorRequests(operatorUsername, "Rejected"));
  } catch (err) { handleDbError(res, err); }
});

// =====================================================================
// SHIFT CHANGE REQUEST — admin/owner side (ShiftChangeRequest_admin_owner_view.js)
// =====================================================================

async function loadAllRequests(status) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("status", sql.VarChar(20), status)
    .query(shiftRequestSelect("WHERE sr.status = @status"));
  return result.recordset;
}

app.get("/api/shift_management/pending_request_all", async (req, res) => {
  try { res.json(await loadAllRequests("Pending")); }
  catch (err) { handleDbError(res, err); }
});

app.get("/api/shift_management/aproved_request_all", async (req, res) => {
  try { res.json(await loadAllRequests("Approved")); }
  catch (err) { handleDbError(res, err); }
});

app.get("/api/shift_management/rejected_request_all", async (req, res) => {
  try { res.json(await loadAllRequests("Rejected")); }
  catch (err) { handleDbError(res, err); }
});

// NOTE: your admin/owner view.js only sends { shiftchangerequestID } — no
// reviewer identity. ShiftReview.ownerID is NOT NULL + FK'd to Owner, so
// we can't safely insert a review row without knowing who reviewed it.
// These endpoints always update ShiftRequest.status, and will ALSO log a
// ShiftReview row IF you start sending reviewerUsername (and optionally
// feedback) in the request body — until then, review history just isn't
// recorded, only the status change.
app.post("/api/shift_management/pending_request_approve_button", async (req, res) => {
  try {
    const { shiftchangerequestID, reviewerUsername, feedback } = req.body;
    if (!shiftchangerequestID) return res.status(400).json({ error: "shiftchangerequestID required" });

    const pool = await poolPromise;
    const updateResult = await pool.request()
      .input("id", sql.Int, shiftchangerequestID)
      .query(`UPDATE ShiftRequest SET status = 'Approved' WHERE requestID = @id`);

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (reviewerUsername) {
      await pool.request()
        .input("requestID", sql.Int, shiftchangerequestID)
        .input("ownerID", sql.VarChar(20), reviewerUsername)
        .input("decision", sql.VarChar(20), "Accepted")
        .input("feedback", sql.VarChar(255), feedback || null)
        .query(`
          INSERT INTO ShiftReview (requestID, ownerID, decision, feedback)
          VALUES (@requestID, @ownerID, @decision, @feedback)
        `);
    }

    res.json("success");
  } catch (err) { handleDbError(res, err); }
});

app.post("/api/shift_management/pending_request_reject_button", async (req, res) => {
  try {
    const { shiftchangerequestID, reviewerUsername, feedback } = req.body;
    if (!shiftchangerequestID) return res.status(400).json({ error: "shiftchangerequestID required" });

    const pool = await poolPromise;
    const updateResult = await pool.request()
      .input("id", sql.Int, shiftchangerequestID)
      .query(`UPDATE ShiftRequest SET status = 'Rejected' WHERE requestID = @id`);

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (reviewerUsername) {
      await pool.request()
        .input("requestID", sql.Int, shiftchangerequestID)
        .input("ownerID", sql.VarChar(20), reviewerUsername)
        .input("decision", sql.VarChar(20), "Rejected")
        .input("feedback", sql.VarChar(255), feedback || null)
        .query(`
          INSERT INTO ShiftReview (requestID, ownerID, decision, feedback)
          VALUES (@requestID, @ownerID, @decision, @feedback)
        `);
    }

    res.json("success");
  } catch (err) { handleDbError(res, err); }
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

app.post("/api/acceptShiftChange", async (req, res) => {
  const { shiftDate, shiftType, operatorID } = req.body;

  if (shiftDate == null || shiftType == null || operatorID == null) {
    return res.status(400).json({
      error: "shiftDate, shiftType and operatorID are required"
    });
  }

  try {
    const pool = await poolPromise;

    const request = pool.request();

    request
      .input("shiftDate", sql.Date, shiftDate)
      .input("shiftType", sql.VarChar, shiftType)
      .input("operatorID", sql.VarChar, operatorID)
      .output("shiftID", sql.Int);

    const result = await request.execute("usp_UpsertShift");

    const shiftID = result.output.shiftID;

    res.json({
      success: true,
      shiftID: shiftID,
      message: "Shift inserted/updated successfully."
    });

  } catch (err) {
    handleDbError(res, err);
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});