CREATE DATABASE IF NOT EXISTS ai_meal_planner
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ai_meal_planner;

CREATE TABLE IF NOT EXISTS meal_plans (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  dietary_preference VARCHAR(40) NOT NULL,
  cuisine VARCHAR(80) NOT NULL,
  allergies TEXT NULL,
  disliked_foods TEXT NULL,
  budget_per_day DECIMAL(10,2) NULL,
  meals_per_day TINYINT UNSIGNED NOT NULL,
  plan_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
