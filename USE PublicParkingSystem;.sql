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
    shiftID     INT IDENTITY(1,1) PRIMARY KEY,
    operatorID  VARCHAR(20) NOT NULL,
    shiftDate   DATE        NOT NULL,
    shiftType   VARCHAR(10) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'Scheduled',

    CONSTRAINT FK_ShiftManagement_Operator
        FOREIGN KEY (operatorID) REFERENCES Operator(username)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT CK_ShiftManagement_ShiftType
        CHECK (shiftType IN ('Morning', 'Evening', 'Night')),

    CONSTRAINT CK_ShiftManagement_Status
        CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),

    -- Prevents the same operator being double-booked into the same slot
    CONSTRAINT UQ_ShiftManagement_Slot
        UNIQUE (operatorID, shiftDate, shiftType)
);
GO

-- =========================================================
-- ShiftRequest
-- An operator's request to move from one scheduled shift (currentShiftID)
-- to another (requestedShiftID).
-- Renamed operatorID -> operatorusername and reason -> reason_comment,
-- as you asked. Also fixed the FK, which pointed at a column
-- (operatorID) that didn't exist in your draft.
-- =========================================================
CREATE TABLE ShiftRequest (
    requestID         INT IDENTITY(1,1) PRIMARY KEY,
    currentShiftID    INT NOT NULL,
    requestedShiftID  INT NULL,
    operatorusername  VARCHAR(20) NOT NULL,
    requestType       VARCHAR(20) NOT NULL DEFAULT 'ShiftChange',
    reason_comment    VARCHAR(255),
    status            VARCHAR(20) NOT NULL DEFAULT 'Pending',
    requestDate       DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_ShiftRequest_CurrentShift
        FOREIGN KEY (currentShiftID) REFERENCES ShiftManagement(shiftID),

    CONSTRAINT FK_ShiftRequest_RequestedShift
        FOREIGN KEY (requestedShiftID) REFERENCES ShiftManagement(shiftID),

    CONSTRAINT FK_ShiftRequest_Operator
        FOREIGN KEY (operatorusername) REFERENCES Operator(username)
        ON DELETE CASCADE,

    CONSTRAINT CK_ShiftRequest_Status
        CHECK (status IN ('Pending', 'Approved', 'Rejected'))
);
GO

-- =========================================================
-- ShiftReview
-- An admin/owner's decision on a ShiftRequest.
-- =========================================================
CREATE TABLE ShiftReview (
    reviewID    INT IDENTITY(1,1) PRIMARY KEY,
    requestID   INT NOT NULL,
    ownerID     VARCHAR(20) NOT NULL,
    decision    VARCHAR(20) NOT NULL,
    feedback    VARCHAR(255),
    reviewDate  DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_ShiftReview_Request
        FOREIGN KEY (requestID) REFERENCES ShiftRequest(requestID)
        ON DELETE CASCADE,

    CONSTRAINT FK_ShiftReview_Owner
        FOREIGN KEY (ownerID) REFERENCES Owner(username),

    CONSTRAINT CK_ShiftReview_Decision
        CHECK (decision IN ('Accepted', 'Pending', 'Rejected'))
);
GO

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
