USE PublicParkingSystem;
GO

-- 1. Account
CREATE TABLE Account (
    username VARCHAR(20) NOT NULL,
    password NVARCHAR(20) NOT NULL,
    full_name VARCHAR(50) NULL,
    PRIMARY KEY (username)
);
GO

-- 2. Admin
CREATE TABLE Admin (
    username VARCHAR(20) NOT NULL,
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES Account(username)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
GO

-- 3. Operator
CREATE TABLE Operator (
    username VARCHAR(20) NOT NULL,
    join_date DATETIME NULL,
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES Account(username)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
GO

-- 4. Owner
CREATE TABLE Owner (
    username VARCHAR(20) NOT NULL,
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES Account(username)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
GO

-- 5. Spot
CREATE TABLE Spot (
    location CHAR(4) NOT NULL,
    PRIMARY KEY (location)
);
GO

-- 6. Vehicle
CREATE TABLE Vehicle (
    plate_number CHAR(11) NOT NULL,
    entrance_time DATETIME NULL,
    brand VARCHAR(30) NULL,
    location CHAR(4) NULL,
    PRIMARY KEY (plate_number),
    FOREIGN KEY (location) REFERENCES Spot(location)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
GO

-- 7. LogVehicle
CREATE TABLE LogVehicle (
    plate_number CHAR(11) NOT NULL,
    entrance_time DATETIME NOT NULL,
    exit_time DATETIME NOT NULL,
    cost_paid MONEY NULL,
    PRIMARY KEY (plate_number, entrance_time, exit_time)
);
GO

-- 8. CostPolicy
CREATE TABLE CostPolicy (
    costID INT IDENTITY(1,1) NOT NULL,
    entrance_fee MONEY NULL,
    hourly_fee MONEY NULL,
    managed_by VARCHAR(20) NULL,
    PRIMARY KEY (costID),
    FOREIGN KEY (managed_by) REFERENCES Owner(username)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
GO

-- 9. WagePolicy
CREATE TABLE WagePolicy (
    wageID INT IDENTITY(1,1) NOT NULL,
    hourly_wage MONEY NULL,
    deduction_rate MONEY NULL,
    managed_by VARCHAR(20) NULL,
    PRIMARY KEY (wageID),
    FOREIGN KEY (managed_by) REFERENCES Owner(username)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
GO

-- 10. ShiftManagement
CREATE TABLE ShiftManagement (
    shiftID INT IDENTITY(1,1) NOT NULL,
    operatorID VARCHAR(20) NOT NULL,
    shiftDate DATE NOT NULL,
    shiftType VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
    PRIMARY KEY (shiftID),
    FOREIGN KEY (operatorID) REFERENCES Operator(username)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT UQ_ShiftManagement_Slot UNIQUE (operatorID, shiftDate, shiftType),
    CONSTRAINT CK_ShiftManagement_ShiftType CHECK (shiftType IN ('Morning','Evening','Night')),
    CONSTRAINT CK_ShiftManagement_Status CHECK (status IN ('Scheduled','Completed','Cancelled'))
);
GO

-- 11. ShiftRequest
CREATE TABLE ShiftRequest (
    requestID INT IDENTITY(1,1) NOT NULL,
    currentShiftID INT NOT NULL,
    requestedShiftID INT NULL,
    operatorusername VARCHAR(20) NOT NULL,
    requestType VARCHAR(20) NOT NULL DEFAULT 'ShiftChange',
    reason_comment VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    requestDate DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (requestID),
    FOREIGN KEY (currentShiftID) REFERENCES ShiftManagement(shiftID),
    FOREIGN KEY (requestedShiftID) REFERENCES ShiftManagement(shiftID),
    FOREIGN KEY (operatorusername) REFERENCES Operator(username)
        ON DELETE CASCADE,
    CONSTRAINT CK_ShiftRequest_Status CHECK (status IN ('Pending','Approved','Rejected'))
);
GO

-- 12. ShiftReview
CREATE TABLE ShiftReview (
    reviewID INT IDENTITY(1,1) NOT NULL,
    requestID INT NOT NULL,
    ownerID VARCHAR(20) NOT NULL,
    decision VARCHAR(20) NOT NULL,
    feedback VARCHAR(255) NULL,
    reviewDate DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (reviewID),
    FOREIGN KEY (requestID) REFERENCES ShiftRequest(requestID)
        ON DELETE CASCADE,
    FOREIGN KEY (ownerID) REFERENCES Owner(username),
    CONSTRAINT CK_ShiftReview_Decision CHECK (decision IN ('Pending','Accepted','Rejected'))
);
GO

-- 13. LogTraffic
CREATE TABLE LogTraffic (
    username VARCHAR(20) NOT NULL,
    event_time DATETIME NOT NULL,
    action_description VARCHAR(MAX) NOT NULL,
    PRIMARY KEY (username, event_time)
);
GO

-- 14. View
CREATE VIEW VIEW_RecentActivity AS
SELECT
    plate_number,
    'entry' AS action,
    entrance_time AS event_time,
    location AS spot
FROM Vehicle

UNION ALL

SELECT
    plate_number,
    'exit' AS action,
    exit_time AS event_time,
    NULL AS spot
FROM LogVehicle;
GO