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
  // console.log ("check2");
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and Password are required" });
  }

  try {
    const pool = await poolPromise;
    
    // FIX: Maintained proper chain syntax and utilized safe parameterization
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

    // Sends back { username, fullName, role }
    res.json(result.recordset[0]); 
  } catch (err) {
    handleDbError(res, err);
  }
});



///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// server.js or your routes file
import sql from 'mssql'; // or const sql = require('mssql');

// Helper to deduce a user's role string based on sub-table presence
// or to map custom input roles to the respective DB sub-tables
const VALID_ROLES = ['admin', 'operator', 'owner'];

// 1. GET ALL USERS
app.post("/api/user_management/get_all_userInfo", async (req, res) => {
  try {
    const pool = await poolPromise;
    
    // Explicitly joining Account with Admin, Operator, and Owner sub-tables
    const result = await pool.request().query(`
      SELECT 
        a.username,
        a.full_name,
        a.email,
        a.status,
        CASE 
          WHEN adm.username IS NOT NULL THEN 'Admin'
          WHEN op.username IS NOT NULL THEN 'Operator'
          WHEN ow.username IS NOT NULL THEN 'Manager' -- Maps 'Owner' table to 'Manager' UI role
          ELSE 'Operator'                             -- Fallback role if not found in any
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

// 2. DELETE USER
app.post("/api/user_management/delete_user", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Missing username" });

    const pool = await poolPromise;
    
    // Cascading deletes in schema will auto-clean sub-tables (Operator, Owner, Admin)
    await pool.request()
      .input("username", sql.VarChar(20), username)
      .query(`DELETE FROM Account WHERE username = @username`);

    res.json("success"); 
  } catch (err) {
    handleDbError(res, err);
  }
});

// 3. EDIT USER
app.post("/api/user_management/edit_user", async (req, res) => {
  try {
    const { old_username, new_username, name, role } = req.body;
    
    if (!old_username || !new_username) {
      return res.status(400).json({ error: "User identifiers missing" });
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    await transaction.begin();
    try {
      // 1. Update primary account information
      await transaction.request()
        .input("old_username", sql.VarChar(20), old_username)
        .input("new_username", sql.VarChar(20), new_username)
        .input("name", sql.VarChar(50), name)
        .query(`
          UPDATE Account 
          SET username = @new_username, full_name = @name 
          WHERE username = @old_username
        `);

      // 2. Clear old role entries out of structural sub-tables
      await transaction.request().input("username", sql.VarChar(20), new_username).query(`
        DELETE FROM Admin WHERE username = @username;
        DELETE FROM Operator WHERE username = @username;
        DELETE FROM Owner WHERE username = @username;
      `);

      // 3. Insert user context into the newly mapped target role table
      const cleanedRole = role?.toLowerCase();
      if (cleanedRole === 'admin') {
        await transaction.request().input("username", sql.VarChar(20), new_username)
          .query(`INSERT INTO Admin (username) VALUES (@username)`);
      } else if (cleanedRole === 'operator') {
        await transaction.request().input("username", sql.VarChar(20), new_username)
          .query(`INSERT INTO Operator (username, join_date) VALUES (@username, GETDATE())`);
      } else if (cleanedRole === 'owner') {
        await transaction.request().input("username", sql.VarChar(20), new_username)
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

// 4. ADD USER
app.post("/api/user_management/add_user", async (req, res) => {
  try {
    const { username, new_name, new_role } = req.body;
    
    if (!username) return res.status(400).json({ error: "Username required" });

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    await transaction.begin();
    try {
      // 1. Create Base Account (Generating a default password placeholder)
      await transaction.request()
        .input("username", sql.VarChar(20), username)
        .input("password", sql.NVarChar(255), "TemporaryPassword123!") 
        .input("name", sql.VarChar(50), new_name)
        .query(`
          INSERT INTO Account (username, password, full_name) 
          VALUES (@username, @password, @name)
        `);

      // 2. Bind specific role sub-table matching the input string
      const cleanedRole = new_role?.toLowerCase();
      if (cleanedRole === 'admin') {
        await transaction.request().input("username", sql.VarChar(20), username)
          .query(`INSERT INTO Admin (username) VALUES (@username)`);
      } else if (cleanedRole === 'operator') {
        await transaction.request().input("username", sql.VarChar(20), username)
          .query(`INSERT INTO Operator (username, join_date) VALUES (@username, GETDATE())`);
      } else if (cleanedRole === 'owner') {
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

// 5. LAST LOGIN TIME
app.post("/api/user_management/last_login_time", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });

    const pool = await poolPromise;
    
    // Finds recent login tracking records inside the TrafficLog event table
    const result = await pool.request()
      .input("username", sql.VarChar(20), username)
      .query(`
        SELECT TOP 1 event_time AS time 
        FROM TrafficLog 
        WHERE username = @username AND action_description LIKE '%login%'
        ORDER BY event_time DESC
      `);

    if (result.recordset.length === 0) {
      return res.json({ time: "Never" });
    }

    res.json({ time: result.recordset[0].time }); 
  } catch (err) {
    handleDbError(res, err);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});