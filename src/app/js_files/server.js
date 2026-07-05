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
app.post("/api/user_management/get_all_userInfo", async (req, res) => {
  // console.log ("check2");

  try {
    const pool = await poolPromise;
    
    // FIX: Maintained proper chain syntax and utilized safe parameterization
    const result = await pool
      .request()
      .input("username", sql.VarChar(20), username)
      .input("password", sql.NVarChar(255), password) 
      .query(`
        SELECT 
 
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

app.get("/api/user_management/delete_user", async (req, res) => {
  // console.log ("check2");

  try {
    const pool = await poolPromise;
    const username ; // must get from the API it is get block 
    // FIX: Maintained proper chain syntax and utilized safe parameterization
    const result = await pool
      .request()
      .input("username", sql.VarChar(20), username)
      .input("password", sql.NVarChar(255), password) 
      .query(`
        DELETE FROM  WHERE username = {username};
 
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

app.get("/api/user_management/edit_user", async (req, res) => {
  // console.log ("check2");

  try {
    const pool = await poolPromise;
    const new_username, old_username , name , role   ,email ,status ;    
    const result = await pool
      .request()
  
      .query(`
        update useranme , name , role , email ,status  from where username = old_username  set
        useranme = {new_username} , name =  {new_name}, role = {new_role} , email = {email},status = {status} 
 
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



app.get("/api/user_management/add_user", async (req, res) => {
  // console.log ("check2");

  try {
    const pool = await poolPromise;
    const username , name , role   ,email ,status ;    
    const result = await pool
      .request()
  
      .query(`
        inserts into 
        values (username , name , role   ,email ,status)
 
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


app.get("/api/user_management/last_login_time", async (req, res) => {
  // console.log ("check2");

  try {
    const pool = await poolPromise;
    const username ;    
    const result = await pool
      .request()
  
      .query(`
       select where username {username}
 
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



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});