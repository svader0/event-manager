CREATE DATABASE IF NOT EXISTS appdb;

USE appdb;

CREATE TABLE IF NOT EXISTS `location` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `address` VARCHAR(100) NOT NULL,
  `seats` INT NOT NULL CHECK (seats > 0)
);

CREATE TABLE IF NOT EXISTS `eventtest` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS `event` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `organizer` VARCHAR(50) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  `name` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `location_id` INT NOT NULL,
  FOREIGN KEY (location_id) REFERENCES location(id)
);

CREATE TABLE IF NOT EXISTS `user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(50) NOT NULL,
  `password` VARCHAR(50) NOT NULL,
  `role` VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS `review` (
  `event_id` INT NOT NULL,
  `rating` DECIMAL(10, 2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  `comment` TEXT NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` INT NOT NULL,
  -- Timestamp will basically just always set itself to the current time
  FOREIGN KEY (event_id) REFERENCES event(id),
  FOREIGN KEY (user_id) REFERENCES user(id),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS `ticket` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `event_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `purchase_date` DATE NOT NULL,
  `quantity` INT NOT NULL CHECK (quantity > 0),
  `amount_paid` DECIMAL(10, 2) NOT NULL CHECK (amount_paid >= 0),
  FOREIGN KEY (event_id) REFERENCES event(id),
  FOREIGN KEY (user_id) REFERENCES user(id)
);