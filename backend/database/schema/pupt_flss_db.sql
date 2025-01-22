-- PUPT-FLSS 2025 Official Database Schema
-- Last Updated: 2025-01-20

START TRANSACTION;

-- 1. Independent tables
CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `suffix_name` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique user identification code',
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('faculty','admin','superadmin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_code_unique` (`code`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_email_status_index` (`email`,`status`),
  KEY `users_role_status_index` (`role`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `programs` (
  `program_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `program_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `program_title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `program_info` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `number_of_years` int NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`program_id`),
  UNIQUE KEY `programs_program_code_unique` (`program_code`),
  KEY `programs_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `academic_years` (
  `academic_year_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `year_start` int NOT NULL,
  `year_end` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`academic_year_id`),
  KEY `academic_years_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `courses` (
  `course_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lec_hours` int NOT NULL,
  `lab_hours` int NOT NULL,
  `units` int NOT NULL,
  `tuition_hours` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  KEY `courses_course_code_index` (`course_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `curricula` (
  `curriculum_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `curriculum_year` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`curriculum_id`),
  KEY `curricula_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `buildings` (
  `building_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `building_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `floor_levels` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`building_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `room_types` (
  `room_type_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `type_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`room_type_id`),
  UNIQUE KEY `room_types_type_name_unique` (`type_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `faculty_type` (
  `faculty_type_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `faculty_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `regular_units` int NOT NULL,
  `additional_units` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`faculty_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tables with single dependencies
CREATE TABLE `faculty` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `faculty_type_id` bigint UNSIGNED NOT NULL,
  `hris_user_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `faculty_hris_user_id_unique` (`hris_user_id`),
  KEY `faculty_user_id_foreign` (`user_id`),
  CONSTRAINT `faculty_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `faculty_faculty_type_id_foreign` FOREIGN KEY (`faculty_type_id`) REFERENCES `faculty_type` (`faculty_type_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rooms` (
  `room_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `building_id` bigint UNSIGNED NOT NULL,
  `room_code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `floor_level` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_type_id` bigint UNSIGNED DEFAULT NULL,
  `capacity` int NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`room_id`),
  KEY `rooms_room_code_index` (`room_code`),
  KEY `rooms_status_index` (`status`),
  CONSTRAINT `rooms_building_id_foreign` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`building_id`) ON DELETE CASCADE,
  CONSTRAINT `rooms_room_type_id_foreign` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `curricula_program` (
  `curricula_program_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `curriculum_id` int UNSIGNED DEFAULT NULL,
  `program_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`curricula_program_id`),
  KEY `curricula_program_program_id_index` (`program_id`),
  KEY `curricula_program_curriculum_id_index` (`curriculum_id`),
  CONSTRAINT `curricula_program_curriculum_id_foreign` FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `curricula_program_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `year_levels` (
  `year_level_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `curricula_program_id` int UNSIGNED DEFAULT NULL,
  `year` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`year_level_id`),
  KEY `year_levels_curricula_program_id_index` (`curricula_program_id`),
  CONSTRAINT `year_levels_curricula_program_id_foreign` FOREIGN KEY (`curricula_program_id`) REFERENCES `curricula_program` (`curricula_program_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `semesters` (
  `semester_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `year_level_id` int UNSIGNED DEFAULT NULL,
  `semester` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`semester_id`),
  KEY `semesters_year_level_id_index` (`year_level_id`),
  CONSTRAINT `semesters_year_level_id_foreign` FOREIGN KEY (`year_level_id`) REFERENCES `year_levels` (`year_level_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `active_semesters` (
  `active_semester_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `academic_year_id` int UNSIGNED DEFAULT NULL,
  `semester_id` int UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`active_semester_id`),
  KEY `active_semesters_academic_year_id_index` (`academic_year_id`),
  KEY `active_semesters_semester_id_index` (`semester_id`),
  KEY `active_semesters_is_active_index` (`is_active`),
  CONSTRAINT `active_semesters_academic_year_id_foreign` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE SET NULL,
  CONSTRAINT `active_semesters_semester_id_foreign` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `course_assignments` (
  `course_assignment_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `curricula_program_id` int UNSIGNED NOT NULL,
  `semester_id` int UNSIGNED NOT NULL,
  `course_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`course_assignment_id`),
  KEY `course_assignments_curricula_program_id_index` (`curricula_program_id`),
  KEY `course_assignments_semester_id_index` (`semester_id`),
  KEY `course_assignments_course_id_index` (`course_id`),
  CONSTRAINT `course_assignments_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `course_assignments_curricula_program_id_foreign` FOREIGN KEY (`curricula_program_id`) REFERENCES `curricula_program` (`curricula_program_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `course_assignments_semester_id_foreign` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `course_requirements` (
  `requirement_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` int UNSIGNED DEFAULT NULL,
  `requirement_type` enum('pre','co') COLLATE utf8mb4_unicode_ci NOT NULL,
  `required_course_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`requirement_id`),
  KEY `course_requirements_course_id_index` (`course_id`),
  KEY `course_requirements_required_course_id_index` (`required_course_id`),
  CONSTRAINT `course_requirements_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `course_requirements_required_course_id_foreign` FOREIGN KEY (`required_course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `academic_year_curricula` (
  `academic_year_curricula_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `academic_year_id` int UNSIGNED NOT NULL,
  `curriculum_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`academic_year_curricula_id`),
  KEY `academic_year_curricula_academic_year_id_index` (`academic_year_id`),
  KEY `academic_year_curricula_curriculum_id_index` (`curriculum_id`),
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE,
  FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tables with multiple dependencies
CREATE TABLE `preferences` (
  `preferences_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `faculty_id` bigint UNSIGNED NOT NULL,
  `active_semester_id` int UNSIGNED NOT NULL,
  `course_assignment_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`preferences_id`),
  UNIQUE KEY `unique_preference` (`faculty_id`, `active_semester_id`, `course_assignment_id`),
  KEY `preferences_faculty_id_index` (`faculty_id`),
  KEY `preferences_active_semester_id_index` (`active_semester_id`),
  KEY `preferences_course_assignment_id_index` (`course_assignment_id`),
  FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`active_semester_id`) REFERENCES `active_semesters` (`active_semester_id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_assignment_id`) REFERENCES `course_assignments` (`course_assignment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `preference_days` (
  `preference_day_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `preference_id` bigint UNSIGNED NOT NULL,
  `preferred_day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') COLLATE utf8mb4_unicode_ci NOT NULL,
  `preferred_start_time` time NOT NULL,
  `preferred_end_time` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`preference_day_id`),
  KEY `preference_days_preference_id_index` (`preference_id`),
  KEY `preference_days_preferred_day_index` (`preferred_day`),
  FOREIGN KEY (`preference_id`) REFERENCES `preferences` (`preferences_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `preferences_settings` (
  `preferences_settings_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `faculty_id` bigint UNSIGNED DEFAULT NULL,
  `has_request` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 for request made, 0 for no request',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 for enabled, 0 for disabled',
  `global_start_date` date DEFAULT NULL,
  `global_deadline` date DEFAULT NULL,
  `individual_start_date` date DEFAULT NULL,
  `individual_deadline` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`preferences_settings_id`),
  UNIQUE KEY `unique_faculty_setting` (`faculty_id`),
  KEY `preferences_settings_faculty_id_index` (`faculty_id`),
  KEY `preferences_settings_has_request_index` (`has_request`),
  KEY `preferences_settings_is_enabled_index` (`is_enabled`),
  KEY `preferences_settings_global_start_date_index` (`global_start_date`),
  KEY `preferences_settings_global_deadline_index` (`global_deadline`),
  KEY `preferences_settings_individual_start_date_index` (`individual_start_date`),
  KEY `preferences_settings_individual_deadline_index` (`individual_deadline`),
  FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `program_year_level_curricula` (
  `program_year_level_curricula_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `academic_year_id` int UNSIGNED NOT NULL,
  `program_id` int UNSIGNED NOT NULL,
  `year_level` int NOT NULL,
  `curriculum_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`program_year_level_curricula_id`),
  KEY `program_year_level_curricula_academic_year_id_index` (`academic_year_id`),
  KEY `program_year_level_curricula_program_id_index` (`program_id`),
  KEY `program_year_level_curricula_curriculum_id_index` (`curriculum_id`),
  KEY `program_year_level_curricula_year_level_index` (`year_level`),
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE,
  FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE,
  FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sections_per_program_year` (
  `sections_per_program_year_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `academic_year_id` int UNSIGNED NOT NULL,
  `program_id` int UNSIGNED NOT NULL,
  `year_level` int NOT NULL,
  `section_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`sections_per_program_year_id`),
  KEY `sections_per_program_year_academic_year_id_index` (`academic_year_id`),
  KEY `sections_per_program_year_program_id_index` (`program_id`),
  KEY `sections_per_program_year_year_level_index` (`year_level`),
  KEY `sections_per_program_year_section_name_index` (`section_name`),
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE,
  FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `section_courses` (
  `section_course_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sections_per_program_year_id` bigint UNSIGNED NOT NULL,
  `course_assignment_id` int UNSIGNED NOT NULL,
  `is_copy` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`section_course_id`),
  KEY `section_courses_sections_per_program_year_id_index` (`sections_per_program_year_id`),
  KEY `section_courses_course_assignment_id_index` (`course_assignment_id`),
  FOREIGN KEY (`sections_per_program_year_id`) REFERENCES `sections_per_program_year` (`sections_per_program_year_id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_assignment_id`) REFERENCES `course_assignments` (`course_assignment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `schedules` (
  `schedule_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_course_id` bigint UNSIGNED NOT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `faculty_id` bigint UNSIGNED DEFAULT NULL,
  `room_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`schedule_id`),
  KEY `schedules_section_course_id_index` (`section_course_id`),
  KEY `schedules_faculty_id_index` (`faculty_id`),
  KEY `schedules_room_id_index` (`room_id`),
  KEY `schedules_day_index` (`day`),
  KEY `schedules_start_time_index` (`start_time`),
  KEY `schedules_end_time_index` (`end_time`),
  FOREIGN KEY (`section_course_id`) REFERENCES `section_courses` (`section_course_id`) ON DELETE CASCADE,
  FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `faculty_schedule_publication` (
  `faculty_schedule_publication_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `faculty_id` bigint UNSIGNED NOT NULL,
  `academic_year_id` int UNSIGNED NOT NULL,
  `semester_id` int UNSIGNED NOT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`faculty_schedule_publication_id`),
  UNIQUE KEY `unique_faculty_publication` (`faculty_id`,`academic_year_id`,`semester_id`),
  KEY `faculty_schedule_publication_faculty_id_index` (`faculty_id`),
  KEY `faculty_schedule_publication_academic_year_id_index` (`academic_year_id`),
  KEY `faculty_schedule_publication_semester_id_index` (`semester_id`),
  KEY `faculty_schedule_publication_is_published_index` (`is_published`),
  CONSTRAINT `faculty_schedule_publication_faculty_id_foreign` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE,
  CONSTRAINT `faculty_schedule_publication_academic_year_id_foreign` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE, -- Added foreign key constraint for academic_year_id
  CONSTRAINT `faculty_schedule_publication_semester_id_foreign` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`) ON DELETE CASCADE -- Added foreign key constraint for semester_id
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `faculty_notifications` (
  `faculty_notifications_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `faculty_id` BIGINT UNSIGNED NOT NULL,
  `message` TEXT COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`faculty_notifications_id`),
  KEY `faculty_notifications_faculty_id_index` (`faculty_id`),
  KEY `faculty_notifications_is_read_index` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. System-related tables
CREATE TABLE `api_keys` (
  `api_keys_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `system` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `encrypted_key` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`api_keys_id`),
  KEY `api_keys_system_index` (`system`),
  KEY `api_keys_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `password_reset_tokens` (
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;