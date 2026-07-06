USE PublicParkingSystem;
GO

-- =========================


CREATE TABLE Account (
    username VARCHAR(20) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    full_name VARCHAR(50),
    email NVARCHAR(50) ,  
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

CREATE TABLE ShiftManagement (

    shiftID INT IDENTITY(1,1) PRIMARY KEY,

    operatorID VARCHAR(20),

    shiftDate DATE,

    startTime TIME,

    endTime TIME,

    status VARCHAR(20)

);



CREATE TABLE ShiftRequest (

    requestID INT IDENTITY(1,1) PRIMARY KEY,

    shiftID INT,

    operatorID VARCHAR(20),

    requestType VARCHAR(20),

    reason VARCHAR(255),

    status VARCHAR(20),

    requestDate DATETIME DEFAULT GETDATE(),



    FOREIGN KEY (shiftID) REFERENCES ShiftManagement(shiftID),

    FOREIGN KEY (operatorID) REFERENCES Operator(username)

);



CREATE TABLE ShiftReview (

    reviewID INT IDENTITY(1,1) PRIMARY KEY,

    requestID INT,

    ownerID VARCHAR(20),

    decision VARCHAR(20),

    feedback VARCHAR(255),

    reviewDate DATETIME DEFAULT GETDATE(),



    FOREIGN KEY (requestID) REFERENCES ShiftRequest(requestID),

    FOREIGN KEY (ownerID) REFERENCES Owner(username)

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
