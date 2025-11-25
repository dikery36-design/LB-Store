-- This file defines the database schema for the billing feature.
-- Run these SQL commands in your MySQL database to create the necessary tables.

-- Table to store items in the inventory
CREATE TABLE `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `category` varchar(100),
  `image` longtext,
  PRIMARY KEY (`id`)
);

-- Table to store high-level bill information
CREATE TABLE `bills` (
  `bill_id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `bill_date` datetime NOT NULL,
  PRIMARY KEY (`bill_id`)
);

-- Table to store the individual items associated with each bill
CREATE TABLE `bill_items` (
  `bill_item_id` int NOT NULL AUTO_INCREMENT,
  `bill_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`bill_item_id`),
  KEY `bill_id_idx` (`bill_id`),
  -- This foreign key links bill items back to the main bill.
  -- ON DELETE CASCADE means if a bill is deleted, all its associated items are also deleted.
  CONSTRAINT `fk_bill_id` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`bill_id`) ON DELETE CASCADE
);

-- Note: This schema assumes you have an 'items' table with an 'item_id' column
-- that the 'item_id' in the 'bill_items' table refers to.
-- You may need to add a foreign key constraint for `item_id` if you want to enforce that relationship.
-- For example:
-- ALTER TABLE `bill_items` ADD CONSTRAINT `fk_item_id` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);
