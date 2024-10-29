CREATE TABLE location (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `address` VARCHAR(100) NOT NULL,
  `seats` INT NOT NULL
);

CREATE TABLE event (
  `id` INT PRIMARY KEY,
  `organizer` VARCHAR(50) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `location_id` INT NOT NULL,
  FOREIGN KEY (location_id) REFERENCES location(id)
);

CREATE TABLE review (
  `event_id` INT NOT NULL,
  `rating` DECIMAL(10, 2) 
    NOT NULL 
    CHECK (rating >= 0 AND rating <= 5),
  `comment` TEXT NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` INT NOT NULL,
  -- Timestamp will basically just always set itself to the current time
  FOREIGN KEY (event_id) REFERENCES event(id),
  FOREIGN KEY (user_id) REFERENCES user(id),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE user (
  `id` INT PRIMARY KEY,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(50) NOT NULL,
  `password` VARCHAR(50) NOT NULL,
  `role` VARCHAR(20)
);

CREATE TABLE ticket (
  `id` INT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `purchase_date` DATE NOT NULL,
  `quantity` INT NOT NULL,
  `amount_paid` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (event_id) REFERENCES event(id),
  FOREIGN KEY (user_id) REFERENCES user(id)
);