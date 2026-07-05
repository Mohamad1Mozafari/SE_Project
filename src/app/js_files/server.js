//server.js
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

// 3. EDIT USER (Fixed transaction error throwing and tracking)
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

      // Bind basic parameters
      request.input("username", sql.VarChar(20), username);
      request.input("name", sql.VarChar(50), name);
      request.input("email", sql.NVarChar(50), email);

      // 1. Update core Account information
      if (password && password.trim() !== "") {
        request.input("password", sql.NVarChar(255), password);
        await request.query(`
          UPDATE Account 
          SET full_name = @name, email = @email, password = @password
          WHERE username = @username
        `);
      } else {
        await request.query(`
          UPDATE Account 
          SET full_name = @name, email = @email
          WHERE username = @username
        `);
      }

      // 2. Handle Role Changes safely
      if (role) {
        const cleanedRole = role.toLowerCase();

        // Remove from all child tables first safely
        await request.query(`
          DELETE FROM Admin WHERE username = @username;
          DELETE FROM Operator WHERE username = @username;
          DELETE FROM Owner WHERE username = @username;
        `);

        // Re-insert into the single target role table
        if (cleanedRole === 'admin') {
          await request.query(`INSERT INTO Admin (username) VALUES (@username)`);
        } else if (cleanedRole === 'operator') {
          await request.query(`INSERT INTO Operator (username, join_date) VALUES (@username, GETDATE())`);
        } else if (cleanedRole === 'manager' || cleanedRole === 'owner') {
          await request.query(`INSERT INTO Owner (username) VALUES (@username)`);
        }
      }

      await transaction.commit();
      res.json("success");
    } catch (txErr) {
      // Safe rollback execution
      try {
        await transaction.rollback();
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr.message);
      }
      
      // Log the exact schema constraint issue to your backend terminal
      console.error("DUE TO DB SCHEMA RULE CONSTRAINT:", txErr.message);
      
      // Crucial Fix: Use handleDbError immediately instead of re-throwing
      return handleDbError(res, txErr);
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});