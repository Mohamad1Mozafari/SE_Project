CREATE DATABASE PublicParkingSystem;
GO

USE PublicParkingSystem;
GO

-- =========================
-- 1. ACCOUNT
-- =========================
CREATE TABLE Account (
    username VARCHAR(20) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    full_name VARCHAR(50),
    PRIMARY KEY (username)
);

-- =========================
-- 2. ROLE TABLES
-- =========================
CREATE TABLE Operator (
    username VARCHAR(20) NOT NULL,
    join_date DATETIME NOT NULL,
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES Account(username)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE Owner (
    username VARCHAR(20) NOT NULL,
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES Account(username)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE Admin (
    username VARCHAR(20) NOT NULL,
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES Account(username)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =========================
-- 3. SPOT
-- =========================
CREATE TABLE Spot (
    location CHAR(3) NOT NULL,
    PRIMARY KEY (location)
);

-- =========================
-- 4. VEHICLE
-- =========================
CREATE TABLE Vehicle (
    plate_number CHAR(9) NOT NULL,
    brand VARCHAR(30),
    current_location CHAR(3),
    PRIMARY KEY (plate_number),
    FOREIGN KEY (current_location) REFERENCES Spot(location)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- =========================
-- 5. VEHICLE MOVEMENT
-- =========================
CREATE TABLE VehicleMovement (
    movement_id INT IDENTITY(1,1) PRIMARY KEY,
    plate_number CHAR(9) NOT NULL,
    entrance_time DATETIME NOT NULL,
    exit_time DATETIME NULL,
    location CHAR(3),

    FOREIGN KEY (plate_number) REFERENCES Vehicle(plate_number)
        ON DELETE CASCADE,
    FOREIGN KEY (location) REFERENCES Spot(location)
);

-- =========================
-- 6. COST POLICY
-- =========================
CREATE TABLE CostPolicy (
    costID INT NOT NULL,
    entrance_fee MONEY,
    hourly_fee MONEY,
    managed_by VARCHAR(20),
    PRIMARY KEY (costID),
    FOREIGN KEY (managed_by) REFERENCES Owner(username)
        ON DELETE SET NULL
);

-- =========================
-- 7. WAGE POLICY
-- =========================
CREATE TABLE WagePolicy (
    wageID INT NOT NULL,
    hourly_wage MONEY,
    deduction_rate MONEY,
    managed_by VARCHAR(20),
    PRIMARY KEY (wageID),
    FOREIGN KEY (managed_by) REFERENCES Owner(username)
        ON DELETE SET NULL
);

-- =========================
-- 8. OPERATOR SHIFT
-- =========================
CREATE TABLE OperatorShift (
    operator_id VARCHAR(20) NOT NULL,
    expected_startTime DATETIME NOT NULL,
    expected_endTime DATETIME NOT NULL,
    realized_startTime DATETIME NULL,
    realized_endTime DATETIME NULL,

    PRIMARY KEY (operator_id, expected_startTime, expected_endTime),

    FOREIGN KEY (operator_id) REFERENCES Operator(username)
        ON DELETE CASCADE
);

-- =========================
-- 9. SHIFT CHANGE REQUEST
-- =========================
CREATE TABLE ShiftChangeReq (
    reqID INT NOT NULL,
    operator_id VARCHAR(20) NOT NULL,
    type VARCHAR(6) NOT NULL,
    reason VARCHAR(MAX),
    expected_startTime DATETIME NOT NULL,
    expected_endTime DATETIME NOT NULL,

    PRIMARY KEY (reqID),

    FOREIGN KEY (operator_id, expected_startTime, expected_endTime)
        REFERENCES OperatorShift(operator_id, expected_startTime, expected_endTime)
        ON DELETE CASCADE,

    CHECK (type IN ('change', 'delete'))
);

-- =========================
-- 10. OWNER REVIEWS SHIFT REQUEST (FIXED)
-- =========================
CREATE TABLE OwnerReviewsShiftReq (
    owner_id VARCHAR(20) NOT NULL,
    reqID INT NOT NULL,
    status VARCHAR(8) NOT NULL,
    feedback VARCHAR(MAX),

    PRIMARY KEY (owner_id, reqID),

    -- FIX: removed cascading path issue
    FOREIGN KEY (owner_id) REFERENCES Owner(username)
        ON DELETE NO ACTION,

    FOREIGN KEY (reqID) REFERENCES ShiftChangeReq(reqID)
        ON DELETE CASCADE,

    CHECK (status IN ('accepted', 'denied'))
);

-- =========================
-- 11. VEHICLE LOG
-- =========================
CREATE TABLE VehicleLog (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    plate_number CHAR(9) NOT NULL,
    entrance_time DATETIME NOT NULL,
    exit_time DATETIME NULL,

    FOREIGN KEY (plate_number) REFERENCES Vehicle(plate_number)
        ON DELETE CASCADE
);

-- =========================
-- 12. TRAFFIC LOG
-- =========================
CREATE TABLE TrafficLog (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    event_time DATETIME NOT NULL,
    action_description VARCHAR(MAX) NOT NULL,

    FOREIGN KEY (username) REFERENCES Account(username)
        ON DELETE CASCADE
);



You have a **working schema now**, but your last line is dangerous:

```sql
drop table Account
```

⚠️ This will fail anyway because **Account is referenced by many FK constraints**. Don’t use it unless you drop everything in correct order.

---

# ✅ INSERT DATA SCRIPT (FULL SAMPLE DATA SET)

This is a **clean, dependency-safe insert order** for SQL Server.

---

## 1. ACCOUNTS (must be first)

```sql
INSERT INTO Account (username, password, full_name) VALUES
('owner1', 'pass123', 'Main Owner'),
('admin1', 'pass123', 'System Admin'),
('op1', 'pass123', 'Operator One'),
('op2', 'pass123', 'Operator Two');
```

---

## 2. ROLES

```sql
INSERT INTO Owner (username) VALUES ('owner1');

INSERT INTO Admin (username) VALUES ('admin1');

INSERT INTO Operator (username, join_date) VALUES
('op1', GETDATE()),
('op2', GETDATE());
```

---

## 3. SPOTS

```sql
INSERT INTO Spot (location) VALUES
('A01'),
('A02'),
('B01'),
('B02');
```

---

## 4. VEHICLES

```sql
INSERT INTO Vehicle (plate_number, brand, current_location) VALUES
('12B345-51', 'Toyota', 'A01'),
('34C678-22', 'Honda', 'A02'),
('88X999-11', 'Tesla', 'B01');
```

---

## 5. VEHICLE MOVEMENT

```sql
INSERT INTO VehicleMovement (plate_number, entrance_time, exit_time, location) VALUES
('12B345-51', '2026-07-05 08:00:00', NULL, 'A01'),
('34C678-22', '2026-07-05 09:00:00', '2026-07-05 11:00:00', 'A02');
```

---

## 6. COST POLICY

```sql
INSERT INTO CostPolicy (costID, entrance_fee, hourly_fee, managed_by) VALUES
(1, 5.00, 2.50, 'owner1');
```

---

## 7. WAGE POLICY

```sql
INSERT INTO WagePolicy (wageID, hourly_wage, deduction_rate, managed_by) VALUES
(1, 15.00, 0.10, 'owner1');
```

---

## 8. OPERATOR SHIFT

```sql
INSERT INTO OperatorShift (
    operator_id,
    expected_startTime,
    expected_endTime,
    realized_startTime,
    realized_endTime
)
VALUES
('op1', '2026-07-05 08:00:00', '2026-07-05 16:00:00', '2026-07-05 08:05:00', NULL),
('op2', '2026-07-05 16:00:00', '2026-07-05 23:00:00', NULL, NULL);
```

---

## 9. SHIFT CHANGE REQUEST

```sql
INSERT INTO ShiftChangeReq (
    reqID,
    operator_id,
    type,
    reason,
    expected_startTime,
    expected_endTime
)
VALUES
(1, 'op1', 'change', 'Medical appointment', '2026-07-05 08:00:00', '2026-07-05 16:00:00');
```

---

## 10. OWNER REVIEWS SHIFT REQUEST

```sql
INSERT INTO OwnerReviewsShiftReq (
    owner_id,
    reqID,
    status,
    feedback
)
VALUES
('owner1', 1, 'accepted', 'Approved due to valid reason');
```

---

## 11. VEHICLE LOG

```sql
INSERT INTO VehicleLog (plate_number, entrance_time, exit_time)
VALUES
('12B345-51', '2026-07-05 08:00:00', NULL),
('34C678-22', '2026-07-05 09:00:00', '2026-07-05 11:00:00');
```

---

## 12. TRAFFIC LOG

```sql
INSERT INTO TrafficLog (username, event_time, action_description)
VALUES
('admin1', GETDATE(), 'System initialized'),
('op1', GETDATE(), 'Checked in for shift'),
('op2', GETDATE(), 'Checked in for shift');
```

---

# ⚠️ IMPORTANT ORDER RULES (EXAM TRICK)

You MUST always insert in this order:

1. Account
2. Role tables (Owner/Admin/Operator)
3. Spot
4. Vehicle
5. Movement + Logs
6. Policies
7. Shift tables
8. Requests
9. Reviews

---

# ❗ If you want next upgrade

I can also generate:

* 🔥 50+ realistic dummy rows (exam dataset)
* 🔥 stored procedures (check-in / check-out vehicle)
* 🔥 triggers (auto log traffic + vehicle movement)
* 🔥 full ER diagram

Just tell me.









------------------
USE PublicParkingSystem;
GO
SELECT * FROM Account;
SELECT * FROM Operator;
SELECT * FROM Owner;
SELECT * FROM Admin;
SELECT * FROM Spot;
SELECT * FROM Vehicle;
SELECT * FROM VehicleMovement;
SELECT * FROM CostPolicy;
SELECT * FROM WagePolicy;
SELECT * FROM OperatorShift;
SELECT * FROM ShiftChangeReq;
SELECT * FROM OwnerReviewsShiftReq;
SELECT * FROM VehicleLog;
SELECT * FROM TrafficLog;
-----
USE master;
GO

CREATE LOGIN parking_user
WITH PASSWORD = '123456';
GO


