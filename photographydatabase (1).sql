-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 12, 2025 at 04:22 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `photographydatabase`
--

-- --------------------------------------------------------

--
-- Table structure for table `bankdeposits`
--

CREATE TABLE `bankdeposits` (
  `bankDepositId` int(11) NOT NULL,
  `referenceNo` varchar(100) NOT NULL,
  `depositDate` date NOT NULL,
  `depositAmount` decimal(10,2) NOT NULL,
  `receiptImage` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bankdeposits`
--

INSERT INTO `bankdeposits` (`bankDepositId`, `referenceNo`, `depositDate`, `depositAmount`, `receiptImage`, `notes`) VALUES
(1, 'BOC12345678', '2023-06-15', 20000.00, 'uploads/receipts/receipt_boc_12345.jpg', 'Advance payment for wedding package'),
(2, 'COM87654321', '2023-06-20', 20000.00, 'uploads/receipts/receipt_com_87654.jpg', 'Deposit for birthday event'),
(3, 'NSB45678912', '2023-06-25', 150000.00, 'uploads/receipts/receipt_nsb_45678.jpg', 'Full payment for corporate event'),
(4, 'PEO98765432', '2023-06-28', 65000.00, 'uploads/receipts/receipt_peo_98765.jpg', 'Payment for engagement shoot'),
(5, 'HNB56781234', '2023-07-01', 200000.00, 'uploads/receipts/receipt_hnb_56781.jpg', 'Complete payment for Taj event');

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `bookingId` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `packageId` int(11) NOT NULL,
  `eventDate` date NOT NULL,
  `eventTime` time NOT NULL,
  `venue` varchar(255) NOT NULL,
  `bookingStatus` varchar(100) NOT NULL,
  `bookingType` varchar(100) NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`bookingId`, `customerId`, `packageId`, `eventDate`, `eventTime`, `venue`, `bookingStatus`, `bookingType`, `notes`) VALUES
(1, 1, 1, '2025-03-06', '14:00:00', 'Grand Plaza Hotel, 789 Ballroom Lane, Cityville', 'COMPLETED', 'advance', 'Bride requested extra focus on family group photos'),
(2, 2, 2, '2025-03-06', '09:30:00', 'Tech Conference Center, 101 Innovation Blvd, Townsburg', 'COMPLETED', 'Corporate', 'Annual shareholders meeting, CEO speech at 10:30 AM');

-- --------------------------------------------------------

--
-- Table structure for table `creditcard`
--

CREATE TABLE `creditcard` (
  `creditCardId` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `cardholderName` varchar(100) NOT NULL,
  `cardNumber` varchar(255) NOT NULL,
  `expiryDate` varchar(7) NOT NULL,
  `cvv` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `creditcard`
--

INSERT INTO `creditcard` (`creditCardId`, `customerId`, `cardholderName`, `cardNumber`, `expiryDate`, `cvv`) VALUES
(1, 1, 'John Smith', 'XXXX-XXXX-XXXX-1234', '12/2027', 'XXX'),
(2, 2, 'Sarah Johnson', 'XXXX-XXXX-XXXX-5678', '09/2026', 'XXX');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `customerId` int(11) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `billingAddress` varchar(255) DEFAULT NULL,
  `billingMobile` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`customerId`, `fullName`, `email`, `billingAddress`, `billingMobile`) VALUES
(1, 'John Smith', 'john.smith@example.com', '123 Main Street, Cityville, ST 12345', '+1-555-123-4567'),
(2, 'Sarah Johnson', 'sarah.j@example.com', '456 Park Avenue, Townsburg, ST 67890', '+1-555-987-6543');

-- --------------------------------------------------------

--
-- Table structure for table `cutomizationoptions`
--

CREATE TABLE `cutomizationoptions` (
  `optionID` varchar(10) NOT NULL,
  `optionName` varchar(45) NOT NULL,
  `additionalPrice` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `details`
--

CREATE TABLE `details` (
  `detailId` int(11) NOT NULL,
  `detailDescription` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `details`
--

INSERT INTO `details` (`detailId`, `detailDescription`) VALUES
(1, '10 Hours Event Coverage'),
(2, 'Main Photo Session at Preferred Location'),
(3, 'Getting Ready at Hotel'),
(4, 'Unedited Images Included'),
(5, 'Professionally Retouched Images');

-- --------------------------------------------------------

--
-- Table structure for table `event`
--

CREATE TABLE `event` (
  `eventId` int(11) NOT NULL,
  `eventName` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event`
--

INSERT INTO `event` (`eventId`, `eventName`, `description`) VALUES
(1, 'Wedding', 'Capturing the most special day of a couple\'s life'),
(2, 'Homecoming', 'Celebrating return or milestone events'),
(3, 'Engagement', 'Pre-wedding celebration and photo session'),
(4, 'Birthday', 'Marking another year of life'),
(5, 'Graduation', 'Commemorating academic achievements');

-- --------------------------------------------------------

--
-- Table structure for table `imagegallery`
--

CREATE TABLE `imagegallery` (
  `imageID` varchar(10) NOT NULL,
  `imageURL` longtext DEFAULT NULL,
  `uploadDate` date DEFAULT NULL,
  `description` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `itemId` int(11) NOT NULL,
  `itemType` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`itemId`, `itemType`) VALUES
(1, 'Digital Images'),
(2, 'Wooden Framed Portrait'),
(3, 'Thankyou Cards'),
(4, 'Fine Art Album'),
(5, 'Slideshow');

-- --------------------------------------------------------

--
-- Table structure for table `package`
--

CREATE TABLE `package` (
  `packageId` int(11) NOT NULL,
  `packageName` varchar(100) NOT NULL,
  `eventId` int(11) DEFAULT NULL,
  `packageTierId` int(11) DEFAULT NULL,
  `investedAmount` decimal(10,2) NOT NULL,
  `coverageHours` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package`
--

INSERT INTO `package` (`packageId`, `packageName`, `eventId`, `packageTierId`, `investedAmount`, `coverageHours`) VALUES
(1, 'Wedding Lite Package', 1, 2, 90000.00, 10),
(2, 'Wedding Classic Package', 1, 2, 100000.00, 10),
(3, 'Homecoming Basic Package', 2, 3, 50000.00, 8);

-- --------------------------------------------------------

--
-- Table structure for table `packagedetails`
--

CREATE TABLE `packagedetails` (
  `packageId` int(11) NOT NULL,
  `detailId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `packagedetails`
--

INSERT INTO `packagedetails` (`packageId`, `detailId`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `packageitems`
--

CREATE TABLE `packageitems` (
  `packageId` int(11) NOT NULL,
  `itemId` int(11) NOT NULL,
  `quantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `packageitems`
--

INSERT INTO `packageitems` (`packageId`, `itemId`, `quantity`) VALUES
(1, 2, 1),
(1, 5, 1);

-- --------------------------------------------------------

--
-- Table structure for table `packagetier`
--

CREATE TABLE `packagetier` (
  `packageTierId` int(11) NOT NULL,
  `packageTierName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `packagetier`
--

INSERT INTO `packagetier` (`packageTierId`, `packageTierName`) VALUES
(1, 'Lite'),
(2, 'Classic'),
(3, 'Basic'),
(4, 'Premium'),
(5, 'Luxury');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `paymentId` int(11) NOT NULL,
  `bookingId` int(11) NOT NULL,
  `paymentAmount` decimal(10,2) NOT NULL,
  `paymentDate` datetime NOT NULL DEFAULT current_timestamp(),
  `paymentMethod` varchar(50) NOT NULL,
  `bankDepositId` int(11) DEFAULT NULL,
  `creditCardId` int(11) DEFAULT NULL,
  `paymentStatus` varchar(50) NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`paymentId`, `bookingId`, `paymentAmount`, `paymentDate`, `paymentMethod`, `bankDepositId`, `creditCardId`, `paymentStatus`, `notes`) VALUES
(1, 1, 1250.00, '2025-02-15 14:30:22', 'Bank Transfer', 1, NULL, 'Completed', 'Initial 50% deposit payment for Wedding Platinum package'),
(2, 1, 1250.00, '2025-05-01 10:15:45', 'Credit Card', NULL, 1, 'Completed', 'Final balance payment for Wedding Platinum package');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `userID` varchar(10) NOT NULL,
  `username` varchar(45) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(45) NOT NULL,
  `role` varchar(30) NOT NULL,
  `mobile` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`userID`, `username`, `email`, `password`, `role`, `mobile`) VALUES
('01', 'samod', 'samoda@example.com', '123456789', 'admin', 1234567890),
('011', 'test01', 'test01@gmail.com', 'test01Samoda', 'customer', 703804216),
('0111', 'samoda', 'samodawijesooriya@gmail.com', 'Photo1234', 'photographer', 703804216),
('01111', 'hiruni', 'test04@gmail.com', 'Photo1234', 'user', 703804216);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bankdeposits`
--
ALTER TABLE `bankdeposits`
  ADD PRIMARY KEY (`bankDepositId`);

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`bookingId`),
  ADD KEY `customerId` (`customerId`),
  ADD KEY `packageId` (`packageId`);

--
-- Indexes for table `creditcard`
--
ALTER TABLE `creditcard`
  ADD PRIMARY KEY (`creditCardId`),
  ADD KEY `customerId` (`customerId`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`customerId`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `cutomizationoptions`
--
ALTER TABLE `cutomizationoptions`
  ADD PRIMARY KEY (`optionID`);

--
-- Indexes for table `details`
--
ALTER TABLE `details`
  ADD PRIMARY KEY (`detailId`);

--
-- Indexes for table `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`eventId`);

--
-- Indexes for table `imagegallery`
--
ALTER TABLE `imagegallery`
  ADD PRIMARY KEY (`imageID`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`itemId`);

--
-- Indexes for table `package`
--
ALTER TABLE `package`
  ADD PRIMARY KEY (`packageId`),
  ADD KEY `eventId` (`eventId`),
  ADD KEY `packageTierId` (`packageTierId`);

--
-- Indexes for table `packagedetails`
--
ALTER TABLE `packagedetails`
  ADD PRIMARY KEY (`packageId`,`detailId`),
  ADD KEY `detailId` (`detailId`);

--
-- Indexes for table `packageitems`
--
ALTER TABLE `packageitems`
  ADD PRIMARY KEY (`packageId`,`itemId`),
  ADD KEY `itemId` (`itemId`);

--
-- Indexes for table `packagetier`
--
ALTER TABLE `packagetier`
  ADD PRIMARY KEY (`packageTierId`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`paymentId`),
  ADD KEY `bankDepositId` (`bankDepositId`),
  ADD KEY `bookingId` (`bookingId`),
  ADD KEY `creditCardId` (`creditCardId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bankdeposits`
--
ALTER TABLE `bankdeposits`
  MODIFY `bankDepositId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `bookingId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `creditcard`
--
ALTER TABLE `creditcard`
  MODIFY `creditCardId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `customerId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `details`
--
ALTER TABLE `details`
  MODIFY `detailId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `event`
--
ALTER TABLE `event`
  MODIFY `eventId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `itemId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `package`
--
ALTER TABLE `package`
  MODIFY `packageId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `packagetier`
--
ALTER TABLE `packagetier`
  MODIFY `packageTierId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `paymentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customer` (`customerId`),
  ADD CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`packageId`) REFERENCES `package` (`packageId`);

--
-- Constraints for table `creditcard`
--
ALTER TABLE `creditcard`
  ADD CONSTRAINT `creditcard_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customer` (`customerId`) ON DELETE CASCADE;

--
-- Constraints for table `package`
--
ALTER TABLE `package`
  ADD CONSTRAINT `package_ibfk_1` FOREIGN KEY (`eventId`) REFERENCES `event` (`eventId`),
  ADD CONSTRAINT `package_ibfk_2` FOREIGN KEY (`packageTierId`) REFERENCES `packagetier` (`packageTierId`);

--
-- Constraints for table `packagedetails`
--
ALTER TABLE `packagedetails`
  ADD CONSTRAINT `packagedetails_ibfk_1` FOREIGN KEY (`packageId`) REFERENCES `package` (`packageId`),
  ADD CONSTRAINT `packagedetails_ibfk_2` FOREIGN KEY (`detailId`) REFERENCES `details` (`detailId`);

--
-- Constraints for table `packageitems`
--
ALTER TABLE `packageitems`
  ADD CONSTRAINT `packageitems_ibfk_1` FOREIGN KEY (`packageId`) REFERENCES `package` (`packageId`),
  ADD CONSTRAINT `packageitems_ibfk_2` FOREIGN KEY (`itemId`) REFERENCES `items` (`itemId`);

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`bankDepositId`) REFERENCES `bankdeposits` (`bankDepositId`),
  ADD CONSTRAINT `payment_ibfk_2` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`bookingId`),
  ADD CONSTRAINT `payment_ibfk_3` FOREIGN KEY (`creditCardId`) REFERENCES `creditcard` (`creditCardId`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
