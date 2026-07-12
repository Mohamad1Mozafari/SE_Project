USE PublicParkingSystem;
GO
SELECT * FROM Account;
SELECT * FROM Admin;
SELECT * FROM Operator;
SELECT * FROM Owner;
SELECT * FROM Spot;
SELECT * FROM Vehicle;
SELECT * FROM LogVehicle;
SELECT * FROM CostPolicy;
SELECT * FROM WagePolicy;
SELECT * FROM ShiftManagement;
SELECT * FROM ShiftRequest;
SELECT * FROM ShiftReview;
SELECT * FROM LogTraffic;
SELECT * FROM ShiftManagement;
SELECT * FROM VIEW_RecentActivity;


--DROP TABLE IF EXISTS TrafficLog;
--DROP TABLE IF EXISTS VehicleLog;
--DROP TABLE IF EXISTS OwnerReviewsShiftReq;
--DROP TABLE IF EXISTS ShiftChangeReq;
--DROP TABLE IF EXISTS OperatorShift;
--DROP TABLE IF EXISTS VehicleMovement;
--DROP TABLE IF EXISTS Vehicle;
--DROP TABLE IF EXISTS WagePolicy;
--DROP TABLE IF EXISTS CostPolicy;

---- Drop remaining tables
--DROP TABLE IF EXISTS Spot;
DROP TABLE IF EXISTS ShiftReview;
--DROP TABLE IF EXISTS ShiftRequest;
--DROP TABLE IF EXISTS ShiftManagement;

---- Now drop parent tables (these are referenced by foreign keys)
--DROP TABLE IF EXISTS Operator;
--DROP TABLE IF EXISTS Admin;
--DROP TABLE IF EXISTS Owner;
--DROP TABLE IF EXISTS Account;
--drop table LogVehicle
---- Drop remaining tables
--USE PublicParkingSystem;
--GO


--DELETE FROM ShiftReview;
--DELETE FROM ShiftRequest;
--DELETE FROM ShiftManagement;

--DELETE FROM LogTraffic;

--DELETE FROM LogVehicle;
--DELETE FROM Vehicle;

--DELETE FROM WagePolicy;
--DELETE FROM CostPolicy;

--DELETE FROM Spot;

--DELETE FROM Operator;
--DELETE FROM Owner;
--DELETE FROM Admin;

--DELETE FROM Account;
--GO

---- Account Table
--CREATE TABLE Account (
--    username VARCHAR(20) NOT NULL,
--    password NVARCHAR(20) NOT NULL,
--    full_name VARCHAR(50) NULL,
--    Email NVARCHAR(20) , 
--    PRIMARY KEY (username)
--);
--GO

---- Admin Table
--CREATE TABLE Admin (
--    username VARCHAR(20) NOT NULL,
--    PRIMARY KEY (username),
--    FOREIGN KEY (username) REFERENCES Account(username) ON UPDATE CASCADE ON DELETE CASCADE
--);
--GO

---- Operator Table
--CREATE TABLE Operator (
--    username VARCHAR(20) NOT NULL,
--    join_date DATETIME NULL,
--    PRIMARY KEY (username),
--    FOREIGN KEY (username) REFERENCES Account(username) ON UPDATE CASCADE ON DELETE CASCADE
--);
--GO

---- Owner Table
--CREATE TABLE Owner (
--    username VARCHAR(20) NOT NULL,
--    PRIMARY KEY (username),
--    FOREIGN KEY (username) REFERENCES Account(username) ON UPDATE CASCADE ON DELETE CASCADE
--);
--GO

---- Spot Table
--CREATE TABLE Spot (
--    location CHAR(4) NOT NULL,
--    PRIMARY KEY (location)
--);
--GO

---- Vehicle Table
--CREATE TABLE Vehicle (
--    plate_number CHAR(11) NOT NULL,
--    entrance_time DATETIME NULL,
--    brand VARCHAR(30) NULL,
--    location CHAR(4) NULL,
--    PRIMARY KEY (plate_number),
--    FOREIGN KEY (location) REFERENCES Spot(location) ON UPDATE CASCADE ON DELETE SET NULL
--);
--GO

---- LogVehicle Table
--CREATE TABLE LogVehicle (
--    plate_number CHAR(11) NOT NULL,
--    entrance_time DATETIME NOT NULL,
--    exit_time DATETIME NOT NULL,
--    cost_paid MONEY NULL,
--    location CHAR(4) NULL,
--    PRIMARY KEY (plate_number, entrance_time, exit_time)
--);
--GO

---- CostPolicy Table
--CREATE TABLE CostPolicy (
--    costID INT IDENTITY(1,1) NOT NULL,
--    entrance_fee MONEY NULL,
--    hourly_fee MONEY NULL,
--    managed_by VARCHAR(20) NULL,
--    PRIMARY KEY (costID),
--    FOREIGN KEY (managed_by) REFERENCES Owner(username) ON UPDATE CASCADE ON DELETE SET NULL
--);
--GO

---- WagePolicy Table
--CREATE TABLE WagePolicy (
--    wageID INT IDENTITY(1,1) NOT NULL,
--    hourly_wage MONEY NULL,
--    deduction_rate MONEY NULL,
--    managed_by VARCHAR(20) NULL,
--    PRIMARY KEY (wageID),
--    FOREIGN KEY (managed_by) REFERENCES Owner(username) ON UPDATE CASCADE ON DELETE SET NULL
--);
--GO

---- ShiftManagement Table
--CREATE TABLE ShiftManagement (
--    shiftID INT IDENTITY(1,1) NOT NULL,
--    operatorID VARCHAR(20) NOT NULL,
--    shiftDate DATE NOT NULL,
--    shiftType VARCHAR(10) NOT NULL,
--    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
--    PRIMARY KEY (shiftID),
--    CONSTRAINT UQ_ShiftManagement_Slot UNIQUE (operatorID, shiftDate, shiftType),
--    CONSTRAINT FK_ShiftManagement_Operator FOREIGN KEY (operatorID) REFERENCES Operator(username) ON UPDATE CASCADE ON DELETE CASCADE,
--    CONSTRAINT CK_ShiftManagement_ShiftType CHECK (shiftType IN ('Morning', 'Evening', 'Night')),
--    CONSTRAINT CK_ShiftManagement_Status CHECK (status IN ('Scheduled', 'Completed', 'Cancelled'))
--);
--GO

---- ShiftRequest Table
--CREATE TABLE ShiftRequest (
--    requestID INT IDENTITY(1,1) NOT NULL,
--    currentShiftID INT NOT NULL,
--    requestedShiftID INT NULL,
--    shiftDate DATE NOT NULL , 
--    shiftType VARCHAR(10) NOT NULL , 
--    operatorusername VARCHAR(20) NOT NULL,
--    requestType VARCHAR(20) NOT NULL DEFAULT 'ShiftChange',
--    reason_comment VARCHAR(255) NULL,
--    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
--    requestDate DATETIME NULL DEFAULT GETDATE(),
--    PRIMARY KEY (requestID),
--    CONSTRAINT FK_ShiftRequest_CurrentShift FOREIGN KEY (currentShiftID) REFERENCES ShiftManagement(shiftID),
--    CONSTRAINT FK_ShiftRequest_RequestedShift FOREIGN KEY (requestedShiftID) REFERENCES ShiftManagement(shiftID),
--    CONSTRAINT FK_ShiftRequest_Operator FOREIGN KEY (operatorusername) REFERENCES Operator(username) ON DELETE CASCADE,
--    CONSTRAINT CK_ShiftRequest_Status CHECK (status IN ('Pending', 'Approved', 'Rejected'))
--);
--GO

---- ShiftReview Table
--CREATE TABLE ShiftReview (
--    reviewID INT IDENTITY(1,1) NOT NULL,
--    requestID INT NOT NULL,
--    ownerID VARCHAR(20) NOT NULL,
--    decision VARCHAR(20) NOT NULL,
--    feedback VARCHAR(255) NULL,
--    reviewDate DATETIME NULL DEFAULT GETDATE(),
--    PRIMARY KEY (reviewID),
--    CONSTRAINT FK_ShiftReview_Request FOREIGN KEY (requestID) REFERENCES ShiftRequest(requestID) ON DELETE CASCADE,
--    CONSTRAINT FK_ShiftReview_Owner FOREIGN KEY (ownerID) REFERENCES Owner(username),
--    CONSTRAINT CK_ShiftReview_Decision CHECK (decision IN ('Pending', 'Accepted', 'Rejected'))
--);
--GO

-- LogTraffic Table
--CREATE TABLE LogTraffic (
--    username VARCHAR(20) NOT NULL,
--    event_time DATETIME NOT NULL,
--    action_description VARCHAR(MAX) NOT NULL,
--    PRIMARY KEY (username, event_time)
--);
--GO
--drop table LogVehicle
--CREATE TABLE LogVehicle (
--    plate_number CHAR(11) NOT NULL,
--    entrance_time DATETIME NOT NULL,
--    exit_time DATETIME NOT NULL,
--    cost_paid MONEY NULL,
--    location CHAR(4) NULL,
--    PRIMARY KEY (plate_number, entrance_time, exit_time)
--);
--GO

---- ============================================
---- CREATE VIEW
---- ============================================
--CREATE VIEW VIEW_RecentActivity AS
--SELECT plate_number, 'entry' AS action, entrance_time AS event_time, location AS spot FROM Vehicle
--UNION ALL
--SELECT plate_number, 'entry' AS action, entrance_time AS event_time, location AS spot FROM LogVehicle
--UNION ALL
--SELECT plate_number, 'exit' AS action, exit_time AS event_time, location AS spot FROM LogVehicle;
--GO

---- ============================================
---- CREATE STORED PROCEDURE
---- ============================================
--CREATE PROCEDURE RegisterVehicleExit
--    @plate_number CHAR(11)
--AS
--BEGIN
--    SET NOCOUNT ON;
--    SET XACT_ABORT ON;

--    DECLARE @entrance_time DATETIME;
--    DECLARE @exit_time DATETIME = GETDATE();
--    DECLARE @location CHAR(4);
--    DECLARE @entrance_fee MONEY;
--    DECLARE @hourly_fee MONEY;
--    DECLARE @duration_hours INT;
--    DECLARE @total_cost MONEY;

--    SELECT @entrance_time = entrance_time, @location = location
--    FROM Vehicle 
--    WHERE plate_number = @plate_number;

--    IF @entrance_time IS NULL
--    BEGIN
--        RAISERROR('This Vehicle not found in the parking!', 16, 1);
--        RETURN;
--    END

--    SELECT TOP 1 @entrance_fee = entrance_fee, @hourly_fee = hourly_fee 
--    FROM CostPolicy 
--    ORDER BY costID DESC;

--    IF @entrance_fee IS NULL OR @hourly_fee IS NULL
--    BEGIN
--        RAISERROR('No tariff is defined in the database!', 16, 1);
--        RETURN;
--    END

--    SET @duration_hours = CEILING(DATEDIFF(MINUTE, @entrance_time, @exit_time) / 60.0);

--    IF @duration_hours < 1
--        SET @duration_hours = 1;

--    SET @total_cost = @entrance_fee + ((@duration_hours - 1) * @hourly_fee);

--    BEGIN TRANSACTION;
--    BEGIN TRY
--        INSERT INTO LogVehicle (plate_number, entrance_time, exit_time, cost_paid, location)
--        VALUES (@plate_number, @entrance_time, @exit_time, @total_cost, @location);

--        DELETE FROM Vehicle WHERE plate_number = @plate_number;

--        COMMIT TRANSACTION;

--        SELECT 
--            @entrance_time AS EntranceTime,
--            @exit_time AS ExitTime,
--            @duration_hours AS DurationHours,
--            @total_cost AS TotalCost;
--    END TRY
--    BEGIN CATCH
--        IF @@TRANCOUNT > 0
--            ROLLBACK TRANSACTION;
--        THROW;
--    END CATCH
--END;
--GO

--CREATE PROCEDURE usp_UpsertShift
--    @requestID     INT,
--    @shiftID       INT OUTPUT  -- Returns the shiftID
--AS
--BEGIN
--    DECLARE @shiftDate     DATE;
--    DECLARE @shiftType     VARCHAR(10);
--    DECLARE @operatorID    VARCHAR(20);

--    SELECT
--        @shiftDate  = shiftDate,
--        @shiftType  = shiftType,
--        @operatorID = operatorusername
--    FROM ShiftRequest
--    WHERE requestID = @requestID;

--    IF @shiftDate IS NULL AND @shiftType IS NULL AND @operatorID IS NULL
--    BEGIN
--        RAISERROR('ShiftRequest record not found for requestID %d.', 16, 1, @requestID);
--        RETURN;
--    END

--    MERGE ShiftManagement AS target
--    USING (SELECT @shiftDate AS shiftDate, @shiftType AS shiftType) AS source
--        ON target.shiftDate = source.shiftDate
--        AND target.shiftType = source.shiftType
--    WHEN MATCHED THEN
--        UPDATE SET operatorID = @operatorID
--    WHEN NOT MATCHED THEN
--        INSERT (operatorID, shiftDate, shiftType, status)
--        VALUES (@operatorID, @shiftDate, @shiftType, 'Scheduled');

--    -- Retrieve the shiftID (either updated or inserted)
--    SELECT @shiftID = shiftID
--    FROM ShiftManagement
--    WHERE shiftDate = @shiftDate
--    AND shiftType = @shiftType;
--END;
-- ============================================
-- SEED DATA
-- Insert order respects FK dependencies:
-- Account -> Admin/Operator/Owner -> Spot -> Vehicle ->
-- LogVehicle -> CostPolicy/WagePolicy -> ShiftManagement ->
-- ShiftRequest -> ShiftReview -> LogTraffic
-- ============================================

-- ============================================
-- Account
-- ============================================
--INSERT INTO Account (username, password, full_name, Email) VALUES
--('admin1',    'Adm!n2024',   'Nguyen Van A',    'admin1@x.com'),
--('owner1',    'Own3rPass1',  'Tran Thi B',      'owner1@x.com'),
--('owner2',    'Own3rPass2',  'Le Van C',        'owner2@x.com'),
--('operator1', 'Op3rat0r1!',  'Pham Thi D',      'op1@x.com'),
--('operator2', 'Op3rat0r2!',  'Hoang Van E',     'op2@x.com'),
--('operator3', 'Op3rat0r3!',  'Vu Thi F',        'op3@x.com');
--GO

---- ============================================
---- Admin
---- ============================================
--INSERT INTO Admin (username) VALUES
--('admin1');
--GO

---- ============================================
---- Owner
---- ============================================
--INSERT INTO Owner (username) VALUES
--('owner1'),
--('owner2');
--GO

---- ============================================
---- Operator
---- ============================================
--INSERT INTO Operator (username, join_date) VALUES
--('operator1', '2024-01-15'),
--('operator2', '2024-03-10'),
--('operator3', '2025-02-01');
--GO

---- ============================================
---- Spot
---- ============================================
--INSERT INTO Spot (location) VALUES
--('A101'),
--('A102'),
--('B201'),
--('B202'),
--('C301');
--GO

---- ============================================
---- Vehicle (currently parked, occupying some spots)
---- ============================================
--INSERT INTO Vehicle (plate_number, entrance_time, brand, location) VALUES
--('30A-123.45', '2026-07-12 08:15:00', 'Toyota',   'A101'),
--('29B-678.90', '2026-07-12 09:30:00', 'Honda',    'A102'),
--('51G-111.22', '2026-07-12 10:05:00', 'Ford',     'B201');
---- B202 and C301 left empty/available on purpose
--GO

---- ============================================
---- LogVehicle (historical, completed entry/exit records)
---- ============================================
--INSERT INTO LogVehicle (plate_number, entrance_time, exit_time, cost_paid, location) VALUES
--('30A-123.45', '2026-07-10 07:00:00', '2026-07-10 12:00:00', 25000.00, 'B202'),
--('29B-678.90', '2026-07-10 08:00:00', '2026-07-10 09:30:00', 15000.00, 'C301'),
--('51G-111.22', '2026-07-11 13:00:00', '2026-07-11 20:00:00', 40000.00, 'A101'),
--('43H-999.88', '2026-07-11 06:30:00', '2026-07-11 07:15:00', 10000.00, 'A102');
--GO

---- ============================================
---- CostPolicy
---- ============================================
--INSERT INTO CostPolicy (entrance_fee, hourly_fee, managed_by) VALUES
--(10000.00, 5000.00, 'owner1'),
--(12000.00, 6000.00, 'owner2');
--GO

---- ============================================
---- WagePolicy
---- ============================================
--INSERT INTO WagePolicy (hourly_wage, deduction_rate, managed_by) VALUES
--(25000.00, 0.10, 'owner1'),
--(27000.00, 0.08, 'owner2');
--GO

---- ============================================
---- ShiftManagement
---- ============================================
--INSERT INTO ShiftManagement (operatorID, shiftDate, shiftType, status) VALUES
--('operator1', '2026-07-13', 'Morning', 'Scheduled'),
--('operator2', '2026-07-13', 'Evening', 'Scheduled'),
--('operator3', '2026-07-13', 'Night',   'Scheduled'),
--('operator1', '2026-07-14', 'Evening', 'Scheduled'),
--('operator2', '2026-07-14', 'Morning', 'Completed');
--GO

---- ============================================
---- ShiftRequest
---- (currentShiftID / requestedShiftID reference the shiftIDs generated above;
----  adjust if your identities don't start at 1)
---- ============================================
--INSERT INTO ShiftRequest
--    (currentShiftID, requestedShiftID, shiftDate, shiftType, operatorusername, requestType, reason_comment, status)
--VALUES
--    (1, 4, '2026-07-13', 'Morning', 'operator1', 'ShiftChange', 'Doctor appointment that morning', 'Pending'),
--    (2, NULL, '2026-07-13', 'Evening', 'operator2', 'ShiftChange', 'Requesting shift cancellation', 'Pending'),
--    (3, 5, '2026-07-13', 'Night', 'operator3', 'ShiftChange', 'Swap with operator2', 'Approved');
--GO

---- ============================================
---- ShiftReview
---- ============================================
--INSERT INTO ShiftReview (requestID, ownerID, decision, feedback) VALUES
--(1, 'owner1', 'Pending',  NULL),
--(2, 'owner1', 'Rejected', 'No replacement available for that evening'),
--(3, 'owner2', 'Accepted', 'Swap approved, please confirm with operator2');
--GO

---- ============================================
---- LogTraffic
---- ============================================
--INSERT INTO LogTraffic (username, event_time, action_description) VALUES
--('admin1',    '2026-07-12 07:55:00', 'Logged in to admin dashboard'),
--('operator1', '2026-07-12 08:00:00', 'Logged in and started morning shift'),
--('operator1', '2026-07-12 08:15:00', 'Registered vehicle entry 30A-123.45 at spot A101'),
--('operator2', '2026-07-12 09:30:00', 'Registered vehicle entry 29B-678.90 at spot A102'),
--('owner1',    '2026-07-12 09:45:00', 'Updated CostPolicy hourly_fee to 5000.00'),
--('operator3', '2026-07-12 10:05:00', 'Registered vehicle entry 51G-111.22 at spot B201');
--GO



