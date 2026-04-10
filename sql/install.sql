-- ═══════════════════════════════════════════════════════════
--  SQL Install Schema – webcom_loadscreen
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `webcom_loadscreen_designs` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(128) NOT NULL DEFAULT 'Untitled',
    `description` VARCHAR(512) DEFAULT NULL,
    `thumbnail` TEXT DEFAULT NULL,
    `canvas_width` INT NOT NULL DEFAULT 1920,
    `canvas_height` INT NOT NULL DEFAULT 1080,
    `background_color` VARCHAR(64) NOT NULL DEFAULT '#0a0a0a',
    `elements` LONGTEXT NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 0,
    `is_template` TINYINT(1) NOT NULL DEFAULT 0,
    `created_by` VARCHAR(64) DEFAULT NULL,
    `updated_by` VARCHAR(64) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `webcom_loadscreen_permissions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `citizenid` VARCHAR(64) NOT NULL,
    `permission_key` VARCHAR(64) NOT NULL,
    `granted_by` VARCHAR(64) DEFAULT NULL,
    `granted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_citizen_perm` (`citizenid`, `permission_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `webcom_loadscreen_playtime` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `license` VARCHAR(64) NOT NULL,
    `player_name` VARCHAR(128) DEFAULT NULL,
    `total_seconds` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `last_join` TIMESTAMP NULL DEFAULT NULL,
    `last_leave` TIMESTAMP NULL DEFAULT NULL,
    `session_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `first_seen` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_license` (`license`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;