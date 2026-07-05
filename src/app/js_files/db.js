const sql = require("mssql");

const config = {
  user: "parking_user",
  password: "12345",
  server: "localhost",
  database: "ParkingDB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  port: 1433,
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to the SQL Server (ParkingDB)");
    return pool;
  })
  .catch((err) => {
    console.error("can not connect to the Database!", err.message);
    process.exit(1);
  });

module.exports = { sql, poolPromise };
