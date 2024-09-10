-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 10, 2024 at 03:17 PM
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
-- Database: `flss_0910_1804`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_years`
--

CREATE TABLE `academic_years` (
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `year_start` int(11) NOT NULL,
  `year_end` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_years`
--

INSERT INTO `academic_years` (`academic_year_id`, `year_start`, `year_end`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 2023, 2024, 0, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(2, 2024, 2025, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01');

-- --------------------------------------------------------

--
-- Table structure for table `academic_year_curricula`
--

CREATE TABLE `academic_year_curricula` (
  `academic_year_curricula_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `curriculum_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_year_curricula`
--

INSERT INTO `academic_year_curricula` (`academic_year_curricula_id`, `academic_year_id`, `curriculum_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(2, 1, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(3, 2, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(4, 2, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01');

-- --------------------------------------------------------

--
-- Table structure for table `active_semesters`
--

CREATE TABLE `active_semesters` (
  `active_semester_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED DEFAULT NULL,
  `semester_id` int(10) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `active_semesters`
--

INSERT INTO `active_semesters` (`active_semester_id`, `academic_year_id`, `semester_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(2, 1, 1, 0, '2024-09-10 10:13:54', '2024-09-10 10:13:54'),
(3, 1, 2, 0, '2024-09-10 10:13:54', '2024-09-10 10:13:54'),
(4, 1, 3, 0, '2024-09-10 10:13:54', '2024-09-10 10:13:54');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `course_id` int(10) UNSIGNED NOT NULL,
  `course_code` varchar(10) NOT NULL,
  `course_title` varchar(100) NOT NULL,
  `lec_hours` int(11) NOT NULL,
  `lab_hours` int(11) NOT NULL,
  `units` int(11) NOT NULL,
  `tuition_hours` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`course_id`, `course_code`, `course_title`, `lec_hours`, `lab_hours`, `units`, `tuition_hours`, `created_at`, `updated_at`) VALUES
(1, 'BSIT101', 'Introduction to IT', 3, 1, 4, 4, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(2, 'BSIT102', 'Programming 101', 2, 2, 4, 4, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(3, 'BSIT103', 'Web Development Basics', 3, 0, 3, 3, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(4, 'BSME101', 'Engineering Mechanics', 3, 0, 3, 3, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(5, 'BSME102', 'Thermodynamics', 2, 1, 3, 3, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(6, 'BSME103', 'Mechanical Drawing', 1, 2, 3, 3, '2024-09-10 10:06:02', '2024-09-10 10:06:02');

-- --------------------------------------------------------

--
-- Table structure for table `course_assignments`
--

CREATE TABLE `course_assignments` (
  `course_assignment_id` int(10) UNSIGNED NOT NULL,
  `curricula_program_id` int(10) UNSIGNED NOT NULL,
  `semester_id` int(10) UNSIGNED NOT NULL,
  `course_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_assignments`
--

INSERT INTO `course_assignments` (`course_assignment_id`, `curricula_program_id`, `semester_id`, `course_id`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(2, 2, 1, 2, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(3, 2, 1, 3, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(4, 4, 1, 4, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(5, 4, 1, 5, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(6, 4, 1, 6, '2024-09-10 10:06:02', '2024-09-10 10:06:02');

-- --------------------------------------------------------

--
-- Table structure for table `course_requirements`
--

CREATE TABLE `course_requirements` (
  `requirement_id` int(10) UNSIGNED NOT NULL,
  `course_id` int(10) UNSIGNED DEFAULT NULL,
  `requirement_type` enum('pre','co') NOT NULL,
  `required_course_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_requirements`
--

INSERT INTO `course_requirements` (`requirement_id`, `course_id`, `requirement_type`, `required_course_id`, `created_at`, `updated_at`) VALUES
(1, 2, 'pre', 1, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(2, 3, 'co', 2, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(3, 5, 'pre', 4, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(4, 6, 'co', 5, '2024-09-10 10:06:02', '2024-09-10 10:06:02');

-- --------------------------------------------------------

--
-- Table structure for table `curricula`
--

CREATE TABLE `curricula` (
  `curriculum_id` int(10) UNSIGNED NOT NULL,
  `curriculum_year` varchar(4) NOT NULL,
  `status` enum('active','inactive') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `curricula`
--

INSERT INTO `curricula` (`curriculum_id`, `curriculum_year`, `status`, `created_at`, `updated_at`) VALUES
(1, '2018', 'active', '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(2, '2022', 'active', '2024-09-10 10:06:01', '2024-09-10 10:06:01');

-- --------------------------------------------------------

--
-- Table structure for table `curricula_program`
--

CREATE TABLE `curricula_program` (
  `curricula_program_id` int(10) UNSIGNED NOT NULL,
  `curriculum_id` int(10) UNSIGNED DEFAULT NULL,
  `program_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `curricula_program`
--

INSERT INTO `curricula_program` (`curricula_program_id`, `curriculum_id`, `program_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(2, 2, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(3, 1, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(4, 2, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `faculty_email` varchar(50) NOT NULL,
  `faculty_type` enum('full-time','part-time','regular') NOT NULL,
  `faculty_unit` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`id`, `user_id`, `faculty_email`, `faculty_type`, `faculty_unit`) VALUES
(1, 1, 'emartinez@university.edu', 'full-time', 'Computer Science'),
(2, 2, 'anao@university.edu', 'part-time', 'Computer Science'),
(3, 3, 'kmalaluan@university.edu', 'regular', 'Mechanical Engineering'),
(4, 4, 'vrasquero@university.edu', 'full-time', 'Mechanical Engineering');

-- --------------------------------------------------------

--
-- Table structure for table `preferences`
--

CREATE TABLE `preferences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `faculty_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` int(10) UNSIGNED NOT NULL,
  `preferred_day` varchar(191) NOT NULL,
  `preferred_time` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `preferences`
--

INSERT INTO `preferences` (`id`, `faculty_id`, `course_id`, `preferred_day`, `preferred_time`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Monday', 'Morning', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(2, 2, 2, 'Wednesday', 'Afternoon', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(3, 3, 3, 'Tuesday', 'Morning', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(4, 4, 4, 'Thursday', 'Morning', '2024-09-10 10:06:02', '2024-09-10 10:06:02');

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `program_id` int(10) UNSIGNED NOT NULL,
  `program_code` varchar(10) NOT NULL,
  `program_title` varchar(100) NOT NULL,
  `program_info` varchar(255) NOT NULL,
  `number_of_years` int(11) NOT NULL,
  `status` enum('active','inactive') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`program_id`, `program_code`, `program_title`, `program_info`, `number_of_years`, `status`, `created_at`, `updated_at`) VALUES
(1, 'BSIT', 'Bachelor of Science in Information Technology', 'Information Technology Program', 4, 'active', '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(2, 'BSME', 'Bachelor of Science in Mechanical Engineering', 'Mechanical Engineering Program', 4, 'active', '2024-09-10 10:06:01', '2024-09-10 10:06:01');

-- --------------------------------------------------------

--
-- Table structure for table `program_year_level_curricula`
--

CREATE TABLE `program_year_level_curricula` (
  `program_year_level_curricula_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `program_id` int(10) UNSIGNED NOT NULL,
  `year_level` int(11) NOT NULL,
  `curriculum_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `program_year_level_curricula`
--

INSERT INTO `program_year_level_curricula` (`program_year_level_curricula_id`, `academic_year_id`, `program_id`, `year_level`, `curriculum_id`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, 2, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(2, 2, 1, 2, 2, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(3, 2, 1, 3, 1, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(4, 2, 1, 4, 1, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(5, 2, 2, 1, 2, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(6, 2, 2, 2, 2, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(7, 2, 2, 3, 1, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(8, 2, 2, 4, 1, '2024-09-10 10:06:02', '2024-09-10 10:06:02');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `room_code` varchar(191) NOT NULL,
  `location` varchar(191) NOT NULL,
  `floor_level` varchar(191) NOT NULL,
  `room_type` varchar(191) NOT NULL,
  `capacity` int(11) NOT NULL,
  `status` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`room_id`, `room_code`, `location`, `floor_level`, `room_type`, `capacity`, `status`, `created_at`, `updated_at`) VALUES
(1, 'A201', 'Building A', '2nd Floor', 'Lecture Room', 40, 'active', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(2, 'A301', 'Building A', '3rd Floor', 'Lecture Room', 30, 'active', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(3, 'A401', 'Building A', '4th Floor', 'Lecture Room', 30, 'active', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(4, 'DOST Lab', 'Building B', '1st Floor', 'Laboratory', 20, 'active', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(5, 'Aboitiz Lab', 'Building C', '2nd Floor', 'Laboratory', 25, 'active', '2024-09-10 10:06:02', '2024-09-10 10:06:02');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `schedule_id` int(10) UNSIGNED NOT NULL,
  `section_course_id` int(10) UNSIGNED NOT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `faculty_id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`schedule_id`, `section_course_id`, `day`, `start_time`, `end_time`, `faculty_id`, `room_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'Monday', '08:00:00', '10:00:00', 1, 1, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(2, 2, 'Monday', '10:00:00', '12:00:00', 2, 2, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(3, 3, 'Tuesday', '08:00:00', '10:00:00', 3, 3, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(4, 4, 'Wednesday', '08:00:00', '10:00:00', 4, 1, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(5, 5, 'Wednesday', '10:00:00', '12:00:00', 1, 2, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(6, 6, 'Thursday', '08:00:00', '10:00:00', 2, 3, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(7, 7, 'Monday', '13:00:00', '15:00:00', 3, 4, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(8, 8, 'Monday', '15:00:00', '17:00:00', 4, 5, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(9, 9, 'Tuesday', '13:00:00', '15:00:00', 1, 1, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(10, 10, 'Wednesday', '13:00:00', '15:00:00', 2, 2, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(11, 11, 'Wednesday', '15:00:00', '17:00:00', 3, 3, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(12, 12, 'Thursday', '13:00:00', '15:00:00', 4, 4, '2024-09-10 10:06:02', '2024-09-10 10:06:02');

-- --------------------------------------------------------

--
-- Table structure for table `sections_per_program_year`
--

CREATE TABLE `sections_per_program_year` (
  `sections_per_program_year_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `program_id` int(10) UNSIGNED NOT NULL,
  `year_level` int(11) NOT NULL,
  `section_name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sections_per_program_year`
--

INSERT INTO `sections_per_program_year` (`sections_per_program_year_id`, `academic_year_id`, `program_id`, `year_level`, `section_name`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, 'Section 1', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(2, 2, 1, 1, 'Section 2', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(3, 2, 1, 2, 'Section 1', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(4, 2, 1, 3, 'Section 1', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(5, 2, 1, 4, 'Section 1', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(6, 2, 2, 1, 'Section 1', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(7, 2, 2, 1, 'Section 1B', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(8, 2, 2, 2, 'Section 1', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(9, 2, 2, 3, 'Section 1', '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(10, 2, 2, 4, 'Section 1', '2024-09-10 10:06:02', '2024-09-10 10:06:02');

-- --------------------------------------------------------

--
-- Table structure for table `section_courses`
--

CREATE TABLE `section_courses` (
  `section_course_id` int(10) UNSIGNED NOT NULL,
  `sections_per_program_year_id` int(10) UNSIGNED NOT NULL,
  `course_assignment_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `section_courses`
--

INSERT INTO `section_courses` (`section_course_id`, `sections_per_program_year_id`, `course_assignment_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(2, 1, 2, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(3, 1, 3, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(4, 2, 1, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(5, 2, 2, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(6, 2, 3, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(7, 6, 4, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(8, 6, 5, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(9, 6, 6, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(10, 7, 4, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(11, 7, 5, '2024-09-10 10:06:02', '2024-09-10 10:06:02'),
(12, 7, 6, '2024-09-10 10:06:02', '2024-09-10 10:06:02');

-- --------------------------------------------------------

--
-- Table structure for table `semesters`
--

CREATE TABLE `semesters` (
  `semester_id` int(10) UNSIGNED NOT NULL,
  `year_level_id` int(10) UNSIGNED DEFAULT NULL,
  `semester` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `semesters`
--

INSERT INTO `semesters` (`semester_id`, `year_level_id`, `semester`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(2, 1, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(3, 1, 3, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(4, 2, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(5, 2, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(6, 2, 3, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(7, 3, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(8, 3, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(9, 3, 3, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(10, 4, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(11, 4, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(12, 4, 3, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(13, 5, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(14, 5, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(15, 5, 3, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(16, 6, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(17, 6, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(18, 6, 3, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(19, 7, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(20, 7, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(21, 7, 3, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(22, 8, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(23, 8, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(24, 8, 3, '2024-09-10 10:06:01', '2024-09-10 10:06:01');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('faculty','admin','superadmin') NOT NULL,
  `status` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `code`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Emmanuel Martinez', 'FA0001TG2024', 'password123', 'faculty', 'active', '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(2, 'Adrian Naoe', 'FA0002TG2024', 'password123', 'faculty', 'active', '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(3, 'Kyla Malaluan', 'FA0003TG2024', 'password123', 'faculty', 'active', '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(4, 'Via Rasquero', 'FA0004TG2024', 'password123', 'faculty', 'active', '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(5, 'Marissa B Ferrer', 'ADM001TG2024', 'password123', 'admin', 'active', '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(6, 'Cecilia Alagon', 'SDM001TG2024', 'password123', 'superadmin', 'active', '2024-09-10 10:06:01', '2024-09-10 10:06:01');

-- --------------------------------------------------------

--
-- Table structure for table `year_levels`
--

CREATE TABLE `year_levels` (
  `year_level_id` int(10) UNSIGNED NOT NULL,
  `curricula_program_id` int(10) UNSIGNED DEFAULT NULL,
  `year` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `year_levels`
--

INSERT INTO `year_levels` (`year_level_id`, `curricula_program_id`, `year`, `created_at`, `updated_at`) VALUES
(1, 2, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(2, 2, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(3, 1, 3, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(4, 1, 4, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(5, 4, 1, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(6, 4, 2, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(7, 3, 3, '2024-09-10 10:06:01', '2024-09-10 10:06:01'),
(8, 3, 4, '2024-09-10 10:06:01', '2024-09-10 10:06:01');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_years`
--
ALTER TABLE `academic_years`
  ADD PRIMARY KEY (`academic_year_id`);

--
-- Indexes for table `academic_year_curricula`
--
ALTER TABLE `academic_year_curricula`
  ADD PRIMARY KEY (`academic_year_curricula_id`),
  ADD KEY `academic_year_id` (`academic_year_id`),
  ADD KEY `curriculum_id` (`curriculum_id`);

--
-- Indexes for table `active_semesters`
--
ALTER TABLE `active_semesters`
  ADD PRIMARY KEY (`active_semester_id`),
  ADD KEY `active_semesters_academic_year_id_foreign` (`academic_year_id`),
  ADD KEY `active_semesters_semester_id_foreign` (`semester_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`course_id`);

--
-- Indexes for table `course_assignments`
--
ALTER TABLE `course_assignments`
  ADD PRIMARY KEY (`course_assignment_id`),
  ADD KEY `course_assignments_curricula_program_id_foreign` (`curricula_program_id`),
  ADD KEY `course_assignments_semester_id_foreign` (`semester_id`),
  ADD KEY `course_assignments_course_id_foreign` (`course_id`);

--
-- Indexes for table `course_requirements`
--
ALTER TABLE `course_requirements`
  ADD PRIMARY KEY (`requirement_id`),
  ADD KEY `course_requirements_course_id_foreign` (`course_id`),
  ADD KEY `course_requirements_required_course_id_foreign` (`required_course_id`);

--
-- Indexes for table `curricula`
--
ALTER TABLE `curricula`
  ADD PRIMARY KEY (`curriculum_id`);

--
-- Indexes for table `curricula_program`
--
ALTER TABLE `curricula_program`
  ADD PRIMARY KEY (`curricula_program_id`),
  ADD KEY `curricula_program_curriculum_id_foreign` (`curriculum_id`),
  ADD KEY `curricula_program_program_id_foreign` (`program_id`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `faculty_faculty_email_unique` (`faculty_email`),
  ADD KEY `faculty_user_id_foreign` (`user_id`);

--
-- Indexes for table `preferences`
--
ALTER TABLE `preferences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`program_id`),
  ADD UNIQUE KEY `programs_program_code_unique` (`program_code`);

--
-- Indexes for table `program_year_level_curricula`
--
ALTER TABLE `program_year_level_curricula`
  ADD PRIMARY KEY (`program_year_level_curricula_id`),
  ADD KEY `academic_year_id` (`academic_year_id`),
  ADD KEY `program_id` (`program_id`),
  ADD KEY `curriculum_id` (`curriculum_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`room_id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `section_course_id` (`section_course_id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `sections_per_program_year`
--
ALTER TABLE `sections_per_program_year`
  ADD PRIMARY KEY (`sections_per_program_year_id`),
  ADD KEY `academic_year_id` (`academic_year_id`),
  ADD KEY `program_id` (`program_id`);

--
-- Indexes for table `section_courses`
--
ALTER TABLE `section_courses`
  ADD PRIMARY KEY (`section_course_id`),
  ADD KEY `sections_per_program_year_id` (`sections_per_program_year_id`),
  ADD KEY `course_assignment_id` (`course_assignment_id`);

--
-- Indexes for table `semesters`
--
ALTER TABLE `semesters`
  ADD PRIMARY KEY (`semester_id`),
  ADD KEY `semesters_year_level_id_foreign` (`year_level_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `year_levels`
--
ALTER TABLE `year_levels`
  ADD PRIMARY KEY (`year_level_id`),
  ADD KEY `year_levels_curricula_program_id_foreign` (`curricula_program_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_years`
--
ALTER TABLE `academic_years`
  MODIFY `academic_year_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `academic_year_curricula`
--
ALTER TABLE `academic_year_curricula`
  MODIFY `academic_year_curricula_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `active_semesters`
--
ALTER TABLE `active_semesters`
  MODIFY `active_semester_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `course_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `course_assignments`
--
ALTER TABLE `course_assignments`
  MODIFY `course_assignment_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `course_requirements`
--
ALTER TABLE `course_requirements`
  MODIFY `requirement_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `curricula`
--
ALTER TABLE `curricula`
  MODIFY `curriculum_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `curricula_program`
--
ALTER TABLE `curricula_program`
  MODIFY `curricula_program_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `program_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `program_year_level_curricula`
--
ALTER TABLE `program_year_level_curricula`
  MODIFY `program_year_level_curricula_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `schedule_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `sections_per_program_year`
--
ALTER TABLE `sections_per_program_year`
  MODIFY `sections_per_program_year_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `section_courses`
--
ALTER TABLE `section_courses`
  MODIFY `section_course_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `semesters`
--
ALTER TABLE `semesters`
  MODIFY `semester_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `year_levels`
--
ALTER TABLE `year_levels`
  MODIFY `year_level_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `academic_year_curricula`
--
ALTER TABLE `academic_year_curricula`
  ADD CONSTRAINT `academic_year_curricula_ibfk_1` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `academic_year_curricula_ibfk_2` FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE;

--
-- Constraints for table `active_semesters`
--
ALTER TABLE `active_semesters`
  ADD CONSTRAINT `active_semesters_academic_year_id_foreign` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `active_semesters_semester_id_foreign` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`) ON DELETE SET NULL;

--
-- Constraints for table `course_assignments`
--
ALTER TABLE `course_assignments`
  ADD CONSTRAINT `course_assignments_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_assignments_curricula_program_id_foreign` FOREIGN KEY (`curricula_program_id`) REFERENCES `curricula_program` (`curricula_program_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_assignments_semester_id_foreign` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`) ON DELETE CASCADE;

--
-- Constraints for table `course_requirements`
--
ALTER TABLE `course_requirements`
  ADD CONSTRAINT `course_requirements_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_requirements_required_course_id_foreign` FOREIGN KEY (`required_course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE;

--
-- Constraints for table `curricula_program`
--
ALTER TABLE `curricula_program`
  ADD CONSTRAINT `curricula_program_curriculum_id_foreign` FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `curricula_program_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty`
--
ALTER TABLE `faculty`
  ADD CONSTRAINT `faculty_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `preferences`
--
ALTER TABLE `preferences`
  ADD CONSTRAINT `preferences_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `preferences_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE;

--
-- Constraints for table `program_year_level_curricula`
--
ALTER TABLE `program_year_level_curricula`
  ADD CONSTRAINT `program_year_level_curricula_ibfk_1` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `program_year_level_curricula_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `program_year_level_curricula_ibfk_3` FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`section_course_id`) REFERENCES `section_courses` (`section_course_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE;

--
-- Constraints for table `sections_per_program_year`
--
ALTER TABLE `sections_per_program_year`
  ADD CONSTRAINT `sections_per_program_year_ibfk_1` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sections_per_program_year_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE;

--
-- Constraints for table `section_courses`
--
ALTER TABLE `section_courses`
  ADD CONSTRAINT `section_courses_ibfk_1` FOREIGN KEY (`sections_per_program_year_id`) REFERENCES `sections_per_program_year` (`sections_per_program_year_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `section_courses_ibfk_2` FOREIGN KEY (`course_assignment_id`) REFERENCES `course_assignments` (`course_assignment_id`) ON DELETE CASCADE;

--
-- Constraints for table `semesters`
--
ALTER TABLE `semesters`
  ADD CONSTRAINT `semesters_year_level_id_foreign` FOREIGN KEY (`year_level_id`) REFERENCES `year_levels` (`year_level_id`) ON DELETE CASCADE;

--
-- Constraints for table `year_levels`
--
ALTER TABLE `year_levels`
  ADD CONSTRAINT `year_levels_curricula_program_id_foreign` FOREIGN KEY (`curricula_program_id`) REFERENCES `curricula_program` (`curricula_program_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
