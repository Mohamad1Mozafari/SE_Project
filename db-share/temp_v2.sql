USE PublicParkingSystem;
GO

---- ============================================
---- DROP STORED PROCEDURES
---- ============================================
--DROP PROCEDURE IF EXISTS RegisterVehicleExit;
--GO

--DROP PROCEDURE IF EXISTS usp_UpsertShift;
--GO

---- ============================================
---- DROP VIEWS
---- ============================================
--DROP VIEW IF EXISTS VIEW_RecentActivity;
--GO

---- ============================================
---- DROP TABLES (in correct order to respect foreign keys)
---- ============================================

---- First drop tables with foreign key dependencies
--DROP TABLE IF EXISTS ShiftReview;
--GO

--DROP TABLE IF EXISTS ShiftRequest;
--GO

--DROP TABLE IF EXISTS ShiftManagement;
--GO

--DROP TABLE IF EXISTS LogTraffic;
--GO

--DROP TABLE IF EXISTS LogVehicle;
--GO

--DROP TABLE IF EXISTS Vehicle;
--GO

--DROP TABLE IF EXISTS WagePolicy;
--GO

--DROP TABLE IF EXISTS CostPolicy;
--GO

-- Drop remaining tables (these are referenced by foreign keys)
--DROP TABLE IF EXISTS Spot;
--GO

--DROP TABLE IF EXISTS Operator;
--GO

--DROP TABLE IF EXISTS Owner;
--GO

--DROP TABLE IF EXISTS Admin;
--GO

---- Finally drop the Account table (parent table)
--DROP TABLE IF EXISTS Account;
--GO

DROP VIEW IF EXISTS VIEW_RecentActivity;
GO
DROP PROCEDURE IF EXISTS RegisterVehicleExit;
GO
DROP PROCEDURE IF EXISTS usp_UpsertShift;
GO

DROP TABLE IF EXISTS LogTraffic;
DROP TABLE IF EXISTS ShiftReview;
DROP TABLE IF EXISTS ShiftRequest;
DROP TABLE IF EXISTS ShiftManagement;
DROP TABLE IF EXISTS LogVehicle;
DROP TABLE IF EXISTS Vehicle;
DROP TABLE IF EXISTS WagePolicy;
DROP TABLE IF EXISTS CostPolicy;
DROP TABLE IF EXISTS Spot;
DROP TABLE IF EXISTS Operator;
DROP TABLE IF EXISTS Admin;
DROP TABLE IF EXISTS Owner;
DROP TABLE IF EXISTS Account;
GO

-- ============================================
-- CREATE TABLES
-- ============================================

-- Account
CREATE TABLE Account (
    username  VARCHAR(20) NOT NULL,
    password  NVARCHAR(20) NOT NULL,
    full_name VARCHAR(50) NULL,
    Email     NVARCHAR(20) NULL,
    PRIMARY KEY (username)
);
GO

-- Admin
CREATE TABLE Admin (
    username VARCHAR(20) NOT NULL,
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES Account(username) ON UPDATE CASCADE ON DELETE CASCADE
);
GO

-- Operator
CREATE TABLE Operator (
    username  VARCHAR(20) NOT NULL,
    join_date DATETIME NULL,
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES Account(username) ON UPDATE CASCADE ON DELETE CASCADE
);
GO

-- Owner
CREATE TABLE Owner (
    username VARCHAR(20) NOT NULL,
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES Account(username) ON UPDATE CASCADE ON DELETE CASCADE
);
GO

-- Spot
CREATE TABLE Spot (
    location CHAR(4) NOT NULL,
    PRIMARY KEY (location)
);
GO

-- Vehicle
CREATE TABLE Vehicle (
    plate_number  CHAR(11) NOT NULL,
    entrance_time DATETIME NULL,
    brand         VARCHAR(30) NULL,
    location      CHAR(4) NULL,
    PRIMARY KEY (plate_number),
    FOREIGN KEY (location) REFERENCES Spot(location) ON UPDATE CASCADE ON DELETE SET NULL
);
GO

-- LogVehicle
CREATE TABLE LogVehicle (
    plate_number  CHAR(11) NOT NULL,
    entrance_time DATETIME NOT NULL,
    exit_time     DATETIME NOT NULL,
    cost_paid     MONEY NULL,
    location      CHAR(4) NULL,
    PRIMARY KEY (plate_number, entrance_time, exit_time)
);
GO

-- CostPolicy
CREATE TABLE CostPolicy (
    costID       INT IDENTITY(1,1) NOT NULL,
    entrance_fee MONEY NULL,
    hourly_fee   MONEY NULL,
    managed_by   VARCHAR(20) NULL,
    PRIMARY KEY (costID),
    FOREIGN KEY (managed_by) REFERENCES Owner(username) ON UPDATE CASCADE ON DELETE SET NULL
);
GO

-- WagePolicy
CREATE TABLE WagePolicy (
    wageID         INT IDENTITY(1,1) NOT NULL,
    hourly_wage    MONEY NULL,
    deduction_rate MONEY NULL,
    managed_by     VARCHAR(20) NULL,
    PRIMARY KEY (wageID),
    FOREIGN KEY (managed_by) REFERENCES Owner(username) ON UPDATE CASCADE ON DELETE SET NULL
);
GO

-- ShiftManagement
CREATE TABLE ShiftManagement (
    shiftID    INT IDENTITY(1,1) NOT NULL,
    operatorID VARCHAR(20) NOT NULL,
    shiftDate  DATE NOT NULL,
    shiftType  VARCHAR(10) NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
    PRIMARY KEY (shiftID),
    CONSTRAINT UQ_ShiftManagement_Slot UNIQUE (operatorID, shiftDate, shiftType),
    CONSTRAINT FK_ShiftManagement_Operator FOREIGN KEY (operatorID) REFERENCES Operator(username) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT CK_ShiftManagement_ShiftType CHECK (shiftType IN ('Morning', 'Evening', 'Night')),
    CONSTRAINT CK_ShiftManagement_Status CHECK (status IN ('Scheduled', 'Completed', 'Cancelled'))
);
GO

-- ShiftRequest (updated schema)
CREATE TABLE ShiftRequest (
    requestID        INT IDENTITY(1,1) PRIMARY KEY,
    currentShiftID   INT,
    requestedShiftID INT,
    operatorusername VARCHAR(20) NOT NULL,
    requestType       VARCHAR(20) NOT NULL DEFAULT 'ShiftChange',
    reason_comment    VARCHAR(255),
    status            VARCHAR(20) NOT NULL DEFAULT 'Pending',
    requestDate       DATETIME DEFAULT GETDATE(),
    shiftDate         DATE NOT NULL,
    shiftType         VARCHAR(10) NOT NULL,

    CONSTRAINT FK_ShiftRequest_CurrentShift
        FOREIGN KEY (currentShiftID) REFERENCES ShiftManagement(shiftID)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT FK_ShiftRequest_RequestedShift
        FOREIGN KEY (requestedShiftID) REFERENCES ShiftManagement(shiftID),

    CONSTRAINT FK_ShiftRequest_Operator
        FOREIGN KEY (operatorusername) REFERENCES Operator(username)
        ON DELETE NO ACTION,

    CONSTRAINT CK_ShiftRequest_Status
        CHECK (status IN ('Pending', 'Approved', 'Rejected'))
);
GO

-- ShiftReview (updated schema)
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
        CHECK (decision IN ('Approved', 'Pending', 'Rejected'))
);
GO

-- LogTraffic
CREATE TABLE LogTraffic (
    username            VARCHAR(20) NOT NULL,
    event_time          DATETIME NOT NULL,
    action_description  VARCHAR(MAX) NOT NULL,
    PRIMARY KEY (username, event_time)
);
GO

-- ============================================
-- VIEW
-- ============================================
CREATE VIEW VIEW_RecentActivity AS
SELECT plate_number, 'entry' AS action, entrance_time AS event_time, location AS spot FROM Vehicle
UNION ALL
SELECT plate_number, 'entry' AS action, entrance_time AS event_time, location AS spot FROM LogVehicle
UNION ALL
SELECT plate_number, 'exit' AS action, exit_time AS event_time, location AS spot FROM LogVehicle;
GO

-- ============================================
-- STORED PROCEDURES
-- ============================================
CREATE PROCEDURE RegisterVehicleExit
    @plate_number CHAR(11)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @entrance_time DATETIME;
    DECLARE @exit_time DATETIME = GETDATE();
    DECLARE @location CHAR(4);
    DECLARE @entrance_fee MONEY;
    DECLARE @hourly_fee MONEY;
    DECLARE @duration_hours INT;
    DECLARE @total_cost MONEY;

    SELECT @entrance_time = entrance_time, @location = location
    FROM Vehicle
    WHERE plate_number = @plate_number;

    IF @entrance_time IS NULL
    BEGIN
        RAISERROR('This Vehicle not found in the parking!', 16, 1);
        RETURN;
    END

    SELECT TOP 1 @entrance_fee = entrance_fee, @hourly_fee = hourly_fee
    FROM CostPolicy
    ORDER BY costID DESC;

    IF @entrance_fee IS NULL OR @hourly_fee IS NULL
    BEGIN
        RAISERROR('No tariff is defined in the database!', 16, 1);
        RETURN;
    END

    SET @duration_hours = CEILING(DATEDIFF(MINUTE, @entrance_time, @exit_time) / 60.0);

    IF @duration_hours < 1
        SET @duration_hours = 1;

    SET @total_cost = @entrance_fee + ((@duration_hours - 1) * @hourly_fee);

    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO LogVehicle (plate_number, entrance_time, exit_time, cost_paid, location)
        VALUES (@plate_number, @entrance_time, @exit_time, @total_cost, @location);

        DELETE FROM Vehicle WHERE plate_number = @plate_number;

        COMMIT TRANSACTION;

        SELECT
            @entrance_time AS EntranceTime,
            @exit_time AS ExitTime,
            @duration_hours AS DurationHours,
            @total_cost AS TotalCost;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE PROCEDURE usp_UpsertShift
    @requestID     INT,
    @shiftID       INT OUTPUT  -- Returns the shiftID
AS
BEGIN
    DECLARE @shiftDate     DATE;
    DECLARE @shiftType     VARCHAR(10);
    DECLARE @operatorID    VARCHAR(20);
    DECLARE @currentShift  INT;

    SELECT
        @shiftDate    = shiftDate,
        @shiftType    = shiftType,
        @operatorID   = operatorusername,
        @currentShift = currentShiftID
    FROM ShiftRequest
    WHERE requestID = @requestID;

    IF @shiftDate IS NULL AND @shiftType IS NULL AND @operatorID IS NULL
    BEGIN
        RAISERROR('ShiftRequest record not found for requestID %d.', 16, 1, @requestID);
        RETURN;
    END

    MERGE ShiftManagement AS target
    USING (SELECT @shiftDate AS shiftDate, @shiftType AS shiftType) AS source
        ON target.shiftDate = source.shiftDate
        AND target.shiftType = source.shiftType
    WHEN MATCHED THEN
        UPDATE SET operatorID = @operatorID
    WHEN NOT MATCHED THEN
        INSERT (operatorID, shiftDate, shiftType, status)
        VALUES (@operatorID, @shiftDate, @shiftType, 'Scheduled');

    DELETE FROM ShiftManagement
    WHERE shiftID = @currentShift;

    -- Retrieve the shiftID (either updated or inserted)
    SELECT @shiftID = shiftID
    FROM ShiftManagement
    WHERE shiftDate = @shiftDate
    AND shiftType = @shiftType;
END;
GO

-- ============================================
-- SEED DATA (simple names)
-- ============================================

INSERT INTO Account (username, password, full_name, Email) VALUES
('admin1',    'Pass123',  'Admin One',    'admin1@mail.com'),
('owner1',    'Pass123',  'Owner One',    'owner1@mail.com'),
('owner2',    'Pass123',  'Owner Two',    'owner2@mail.com'),
('operator1', 'Pass123',  'Operator One', 'op1@mail.com'),
('operator2', 'Pass123',  'Operator Two', 'op2@mail.com'),
('operator3', 'Pass123',  'Operator Three','op3@mail.com');
GO

-- Admin
INSERT INTO Admin (username) VALUES
('admin1');
GO

-- Owner
INSERT INTO Owner (username) VALUES
('owner1'),
('owner2');
GO

-- Operator
INSERT INTO Operator (username, join_date) VALUES
('operator1', '2024-01-15'),
('operator2', '2024-03-10'),
('operator3', '2025-02-01');
GO

-- Spot
INSERT INTO Spot (location) VALUES
('A101'),
('A102'),
('B201'),
('B202'),
('C301');
GO

-- Vehicle (currently parked)
INSERT INTO Vehicle (plate_number, entrance_time, brand, location) VALUES
('30A-12345', '2026-07-12 08:15:00', 'Toyota', 'A101'),
('29B-67890', '2026-07-12 09:30:00', 'Honda',  'A102'),
('51G-11122', '2026-07-12 10:05:00', 'Ford',   'B201');
GO

-- LogVehicle (historical records)
INSERT INTO LogVehicle (plate_number, entrance_time, exit_time, cost_paid, location) VALUES
('30A-12345', '2026-07-10 07:00:00', '2026-07-10 12:00:00', 25000.00, 'B202'),
('29B-67890', '2026-07-10 08:00:00', '2026-07-10 09:30:00', 15000.00, 'C301'),
('51G-11122', '2026-07-11 13:00:00', '2026-07-11 20:00:00', 40000.00, 'A101'),
('43H-99988', '2026-07-11 06:30:00', '2026-07-11 07:15:00', 10000.00, 'A102');
GO

-- CostPolicy
INSERT INTO CostPolicy (entrance_fee, hourly_fee, managed_by) VALUES
(10000.00, 5000.00, 'owner1'),
(12000.00, 6000.00, 'owner2');
GO

-- WagePolicy
INSERT INTO WagePolicy (hourly_wage, deduction_rate, managed_by) VALUES
(25000.00, 0.10, 'owner1'),
(27000.00, 0.08, 'owner2');
GO

-- ShiftManagement
INSERT INTO ShiftManagement (operatorID, shiftDate, shiftType, status) VALUES
('operator1', '2026-07-13', 'Morning', 'Scheduled'),
('operator2', '2026-07-13', 'Evening', 'Scheduled'),
('operator3', '2026-07-13', 'Night',   'Scheduled'),
('operator1', '2026-07-14', 'Evening', 'Scheduled'),
('operator2', '2026-07-14', 'Morning', 'Completed');
GO

-- ShiftRequest (shiftID 1,4,2,3,5 assumed from identity order above)
INSERT INTO ShiftRequest
    (currentShiftID, requestedShiftID, operatorusername, requestType, reason_comment, status, shiftDate, shiftType)
VALUES
    (1, 4,    'operator1', 'ShiftChange', 'Doctor appointment that morning', 'Pending',  '2026-07-13', 'Morning'),
    (2, NULL, 'operator2', 'ShiftChange', 'Requesting shift cancellation',   'Pending',  '2026-07-13', 'Evening'),
    (3, 5,    'operator3', 'ShiftChange', 'Swap with operator2',             'Approved', '2026-07-13', 'Night');
GO

-- ShiftReview
INSERT INTO ShiftReview (requestID, ownerID, decision, feedback) VALUES
(1, 'owner1', 'Pending',  NULL),
(2, 'owner1', 'Rejected', 'No replacement available for that evening'),
(3, 'owner2', 'Approved', 'Swap approved, please confirm with operator2');
GO

-- LogTraffic
INSERT INTO LogTraffic (username, event_time, action_description) VALUES
('admin1',    '2026-07-12 07:55:00', 'Logged in to admin dashboard'),
('operator1', '2026-07-12 08:00:00', 'Logged in and started morning shift'),
('operator1', '2026-07-12 08:15:00', 'Registered vehicle entry 30A-12345 at spot A101'),
('operator2', '2026-07-12 09:30:00', 'Registered vehicle entry 29B-67890 at spot A102'),
('owner1',    '2026-07-12 09:45:00', 'Updated CostPolicy hourly_fee to 5000.00'),
('operator3', '2026-07-12 10:05:00', 'Registered vehicle entry 51G-11122 at spot B201');
GO