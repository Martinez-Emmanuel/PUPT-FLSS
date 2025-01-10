-- PUPT-FLSS 2025 Official Database Schema (Version 1.9.1)
-- Key Changes from the previous version:
-- (+) Add `hris_user_id` to `faculty` table

-- Table structure for table `users`
CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `last_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `suffix_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('faculty','admin','superadmin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `programs`
CREATE TABLE `programs` (
  `program_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `program_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `program_title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `program_info` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `number_of_years` int(11) NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`program_id`),
  UNIQUE KEY `programs_program_code_unique` (`program_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `academic_years`
CREATE TABLE `academic_years` (
  `academic_year_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `year_start` int(11) NOT NULL,
  `year_end` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`academic_year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `faculty`
CREATE TABLE faculty (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `hris_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `faculty_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `faculty_units` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `faculty_hris_user_id_unique` (`hris_user_id`),
  KEY `faculty_user_id_hris_user_id_index` (`user_id`, `hris_user_id`),
  KEY `faculty_user_id_foreign` (`user_id`),
  CONSTRAINT `faculty_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `rooms`
CREATE TABLE `rooms` (
  `room_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `floor_level` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int(11) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `courses`
CREATE TABLE `courses` (
  `course_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lec_hours` int(11) NOT NULL,
  `lab_hours` int(11) NOT NULL,
  `units` int(11) NOT NULL,
  `tuition_hours` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `curricula`
CREATE TABLE `curricula` (
  `curriculum_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `curriculum_year` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`curriculum_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `curricula_program`
CREATE TABLE `curricula_program` (
  `curricula_program_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `curriculum_id` int(10) UNSIGNED DEFAULT NULL,
  `program_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`curricula_program_id`),
  KEY `curricula_program_curriculum_id_foreign` (`curriculum_id`),
  KEY `curricula_program_program_id_foreign` (`program_id`),
  CONSTRAINT `curricula_program_curriculum_id_foreign` FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `curricula_program_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `year_levels`
CREATE TABLE `year_levels` (
  `year_level_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `curricula_program_id` int(10) UNSIGNED DEFAULT NULL,
  `year` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`year_level_id`),
  KEY `year_levels_curricula_program_id_foreign` (`curricula_program_id`),
  CONSTRAINT `year_levels_curricula_program_id_foreign` FOREIGN KEY (`curricula_program_id`) REFERENCES `curricula_program` (`curricula_program_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `semesters`
CREATE TABLE `semesters` (
  `semester_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `year_level_id` int(10) UNSIGNED DEFAULT NULL,
  `semester` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`semester_id`),
  KEY `semesters_year_level_id_foreign` (`year_level_id`),
  CONSTRAINT `semesters_year_level_id_foreign` FOREIGN KEY (`year_level_id`) REFERENCES `year_levels` (`year_level_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `active_semesters`
CREATE TABLE `active_semesters` (
  `active_semester_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `academic_year_id` int(10) UNSIGNED DEFAULT NULL,
  `semester_id` int(10) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`active_semester_id`),
  KEY `active_semesters_academic_year_id_foreign` (`academic_year_id`),
  KEY `active_semesters_semester_id_foreign` (`semester_id`),
  CONSTRAINT `active_semesters_academic_year_id_foreign` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE SET NULL,
  CONSTRAINT `active_semesters_semester_id_foreign` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `course_assignments`
CREATE TABLE `course_assignments` (
  `course_assignment_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `curricula_program_id` int(10) UNSIGNED NOT NULL,
  `semester_id` int(10) UNSIGNED NOT NULL,
  `course_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`course_assignment_id`),
  KEY `course_assignments_curricula_program_id_foreign` (`curricula_program_id`),
  KEY `course_assignments_semester_id_foreign` (`semester_id`),
  KEY `course_assignments_course_id_foreign` (`course_id`),
  CONSTRAINT `course_assignments_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `course_assignments_curricula_program_id_foreign` FOREIGN KEY (`curricula_program_id`) REFERENCES `curricula_program` (`curricula_program_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `course_assignments_semester_id_foreign` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `course_requirements`
CREATE TABLE `course_requirements` (
  `requirement_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` int(10) UNSIGNED DEFAULT NULL,
  `requirement_type` enum('pre','co') COLLATE utf8mb4_unicode_ci NOT NULL,
  `required_course_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`requirement_id`),
  KEY `course_requirements_course_id_foreign` (`course_id`),
  KEY `course_requirements_required_course_id_foreign` (`required_course_id`),
  CONSTRAINT `course_requirements_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `course_requirements_required_course_id_foreign` FOREIGN KEY (`required_course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `preferences`
CREATE TABLE `preferences` (
  `preferences_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `faculty_id` bigint(20) UNSIGNED NOT NULL,
  `active_semester_id` int(10) UNSIGNED NOT NULL,
  `course_assignment_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`preferences_id`),
  UNIQUE KEY `unique_preference` (`faculty_id`, `active_semester_id`, `course_assignment_id`),
  FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`active_semester_id`) REFERENCES `active_semesters` (`active_semester_id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_assignment_id`) REFERENCES `course_assignments` (`course_assignment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `preference_days`
CREATE TABLE `preference_days` (
  `preference_day_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `preference_id` bigint(20) UNSIGNED NOT NULL,
  `preferred_day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') COLLATE utf8mb4_unicode_ci NOT NULL,
  `preferred_start_time` time NOT NULL,
  `preferred_end_time` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`preference_day_id`),
  FOREIGN KEY (`preference_id`) REFERENCES `preferences` (`preferences_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `preferences_settings`
CREATE TABLE `preferences_settings` (
  `preferences_settings_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `faculty_id` bigint(20) UNSIGNED DEFAULT NULL,
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
  FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `academic_year_curricula`
CREATE TABLE `academic_year_curricula` (
  `academic_year_curricula_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `curriculum_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`academic_year_curricula_id`),
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE,
  FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `program_year_level_curricula`
CREATE TABLE `program_year_level_curricula` (
  `program_year_level_curricula_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `program_id` int(10) UNSIGNED NOT NULL,
  `year_level` int(11) NOT NULL,
  `curriculum_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`program_year_level_curricula_id`),
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE,
  FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE,
  FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `sections_per_program_year`
CREATE TABLE `sections_per_program_year` (
  `sections_per_program_year_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `program_id` int(10) UNSIGNED NOT NULL,
  `year_level` int(11) NOT NULL,
  `section_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`sections_per_program_year_id`),
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE,
  FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `section_courses`
CREATE TABLE `section_courses` (
  `section_course_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `sections_per_program_year_id` bigint(20) UNSIGNED NOT NULL,
  `course_assignment_id` int(10) UNSIGNED NOT NULL,
  `is_copy` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`section_course_id`),
  FOREIGN KEY (`sections_per_program_year_id`) REFERENCES `sections_per_program_year` (`sections_per_program_year_id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_assignment_id`) REFERENCES `course_assignments` (`course_assignment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `schedules`
CREATE TABLE `schedules` (
  `schedule_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_course_id` bigint(20) UNSIGNED NOT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `faculty_id` bigint(20) UNSIGNED DEFAULT NULL,
  `room_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`schedule_id`),
  FOREIGN KEY (`section_course_id`) REFERENCES `section_courses` (`section_course_id`) ON DELETE CASCADE,
  FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `faculty_schedule_publication`
CREATE TABLE `faculty_schedule_publication` (
  `faculty_schedule_publication_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `faculty_id` bigint(20) UNSIGNED NOT NULL,
  `schedule_id` bigint(20) UNSIGNED NOT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`faculty_schedule_publication_id`),
  KEY `faculty_schedule_publication_faculty_id_foreign` (`faculty_id`),
  KEY `faculty_schedule_publication_schedule_id_foreign` (`schedule_id`),
  CONSTRAINT `faculty_schedule_publication_faculty_id_foreign` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE,
  CONSTRAINT `faculty_schedule_publication_schedule_id_foreign` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `faculty_notifications` (
  `faculty_notifications_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `faculty_id` BIGINT UNSIGNED NOT NULL,
  `message` TEXT COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`faculty_notifications_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `api_keys` (
  `api_keys_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `system` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `encrypted_key` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`api_keys_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;