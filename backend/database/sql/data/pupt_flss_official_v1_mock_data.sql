-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 18, 2024 at 03:24 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pupt_flss_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_years`
--

CREATE TABLE `academic_years` (
  `academic_year_id` int UNSIGNED NOT NULL,
  `year_start` int NOT NULL,
  `year_end` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_years`
--

INSERT INTO `academic_years` (`academic_year_id`, `year_start`, `year_end`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 2023, 2024, 0, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, 2024, 2025, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04');

-- --------------------------------------------------------

--
-- Table structure for table `academic_year_curricula`
--

CREATE TABLE `academic_year_curricula` (
  `academic_year_curricula_id` bigint UNSIGNED NOT NULL,
  `academic_year_id` int UNSIGNED NOT NULL,
  `curriculum_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_year_curricula`
--

INSERT INTO `academic_year_curricula` (`academic_year_curricula_id`, `academic_year_id`, `curriculum_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, 1, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(3, 2, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(4, 2, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04');

-- --------------------------------------------------------

--
-- Table structure for table `active_semesters`
--

CREATE TABLE `active_semesters` (
  `active_semester_id` int UNSIGNED NOT NULL,
  `academic_year_id` int UNSIGNED DEFAULT NULL,
  `semester_id` int UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `active_semesters`
--

INSERT INTO `active_semesters` (`active_semester_id`, `academic_year_id`, `semester_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, 2, 2, 0, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(3, 2, 3, 0, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(4, 1, 1, 0, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(5, 1, 2, 0, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(6, 1, 3, 0, '2024-09-17 19:21:04', '2024-09-17 19:21:04');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `course_id` int UNSIGNED NOT NULL,
  `course_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lec_hours` int NOT NULL,
  `lab_hours` int NOT NULL,
  `units` int NOT NULL,
  `tuition_hours` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`course_id`, `course_code`, `course_title`, `lec_hours`, `lab_hours`, `units`, `tuition_hours`, `created_at`, `updated_at`) VALUES
(1, 'IT101', 'Introduction to Information Technology', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, 'IT102', 'Intermediate Information Technology', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(3, 'IT103', 'Advanced Information Technology', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(4, 'IT201', 'Information Systems', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(5, 'IT202', 'Data Structures', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(6, 'IT203', 'Algorithms', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(7, 'IT301', 'Database Management', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(8, 'IT302', 'Network Security', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(9, 'IT303', 'Software Engineering', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(10, 'COMP101', 'Intro to Computing', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(11, 'COMP102', 'Programming Fundamentals', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(12, 'COMP103', 'Computer Architecture', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(13, 'COMP201', 'Object-Oriented Programming', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(14, 'COMP202', 'Web Development', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(15, 'COMP203', 'Mobile Application Development', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(16, 'COMP301', 'Advanced Programming', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(17, 'COMP302', 'Software Testing', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(18, 'COMP303', 'Cloud Computing', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(19, 'ENG101', 'Engineering Mechanics', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(20, 'ENG102', 'Thermodynamics', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(21, 'ENG103', 'Material Science', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(22, 'ENG201', 'Fluid Mechanics', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(23, 'ENG202', 'Machine Design', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(24, 'ENG203', 'Manufacturing Processes', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(25, 'ENG301', 'Robotics', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(26, 'ENG302', 'Automated Systems', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(27, 'ENG303', 'Control Systems', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(28, 'ME101', 'Introduction to Mechanical Engineering', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(29, 'ME102', 'Engineering Drawing', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(30, 'ME103', 'Dynamics', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(31, 'ME201', 'Thermodynamics II', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(32, 'ME202', 'Heat Transfer', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(33, 'ME203', 'Machine Elements', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(34, 'ME301', 'Mechatronics', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(35, 'ME302', 'Advanced Manufacturing', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(36, 'ME303', 'Finite Element Analysis', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(37, 'IT104', 'Operating Systems', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(38, 'IT105', 'Computer Networks', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(39, 'IT106', 'Software Development', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(40, 'COMP104', 'Data Analytics', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(41, 'COMP105', 'Cybersecurity Fundamentals', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(42, 'COMP106', 'Artificial Intelligence', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(43, 'ENG104', 'Solid Mechanics', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(44, 'ENG105', 'Thermal Systems', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(45, 'ENG106', 'Manufacturing Automation', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(46, 'ME104', 'Vibrations', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(47, 'ME105', 'Fluid Dynamics', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(48, 'ME106', 'Advanced Robotics', 3, 1, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04');

-- --------------------------------------------------------

--
-- Table structure for table `course_assignments`
--

CREATE TABLE `course_assignments` (
  `course_assignment_id` int UNSIGNED NOT NULL,
  `curricula_program_id` int UNSIGNED NOT NULL,
  `semester_id` int UNSIGNED NOT NULL,
  `course_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_assignments`
--

INSERT INTO `course_assignments` (`course_assignment_id`, `curricula_program_id`, `semester_id`, `course_id`, `created_at`, `updated_at`) VALUES
(1, 1, 7, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, 1, 7, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(3, 1, 7, 3, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(4, 1, 8, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(5, 1, 8, 5, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(6, 1, 8, 6, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(7, 1, 9, 7, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(8, 1, 9, 8, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(9, 1, 9, 9, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(10, 3, 1, 10, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(11, 3, 1, 11, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(12, 3, 1, 12, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(13, 3, 2, 13, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(14, 3, 2, 14, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(15, 3, 2, 15, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(16, 3, 3, 16, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(17, 3, 3, 17, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(18, 3, 3, 18, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(19, 2, 19, 19, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(20, 2, 19, 20, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(21, 2, 19, 21, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(22, 2, 20, 22, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(23, 2, 20, 23, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(24, 2, 20, 24, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(25, 2, 21, 25, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(26, 2, 21, 26, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(27, 2, 21, 27, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(28, 4, 13, 28, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(29, 4, 13, 29, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(30, 4, 13, 30, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(31, 4, 14, 31, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(32, 4, 14, 32, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(33, 4, 14, 33, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(34, 4, 15, 34, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(35, 4, 15, 35, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(36, 4, 15, 36, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(37, 4, 13, 28, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(38, 4, 13, 29, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(39, 4, 13, 30, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(40, 1, 10, 37, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(41, 1, 10, 38, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(42, 1, 10, 39, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(43, 2, 22, 43, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(44, 2, 22, 44, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(45, 2, 22, 45, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(47, 3, 4, 40, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(48, 3, 4, 41, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(49, 3, 5, 42, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(50, 4, 16, 46, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(51, 4, 17, 47, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(52, 4, 18, 48, '2024-09-17 19:21:04', '2024-09-17 19:21:04');

-- --------------------------------------------------------

--
-- Table structure for table `course_requirements`
--

CREATE TABLE `course_requirements` (
  `requirement_id` int UNSIGNED NOT NULL,
  `course_id` int UNSIGNED DEFAULT NULL,
  `requirement_type` enum('pre','co') COLLATE utf8mb4_unicode_ci NOT NULL,
  `required_course_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_requirements`
--

INSERT INTO `course_requirements` (`requirement_id`, `course_id`, `requirement_type`, `required_course_id`, `created_at`, `updated_at`) VALUES
(1, 2, 'pre', 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, 5, 'pre', 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(3, 8, 'pre', 7, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(4, 11, 'co', 10, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(5, 14, 'pre', 13, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(6, 17, 'pre', 16, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(7, 20, 'pre', 19, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(8, 23, 'pre', 22, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(9, 26, 'pre', 25, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(10, 29, 'co', 28, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(11, 32, 'pre', 31, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(12, 35, 'pre', 34, '2024-09-17 19:21:04', '2024-09-17 19:21:04');

-- --------------------------------------------------------

--
-- Table structure for table `curricula`
--

CREATE TABLE `curricula` (
  `curriculum_id` int UNSIGNED NOT NULL,
  `curriculum_year` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `curricula`
--

INSERT INTO `curricula` (`curriculum_id`, `curriculum_year`, `status`, `created_at`, `updated_at`) VALUES
(1, '2018', 'active', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, '2022', 'active', '2024-09-17 19:21:04', '2024-09-17 19:21:04');

-- --------------------------------------------------------

--
-- Table structure for table `curricula_program`
--

CREATE TABLE `curricula_program` (
  `curricula_program_id` int UNSIGNED NOT NULL,
  `curriculum_id` int UNSIGNED DEFAULT NULL,
  `program_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `curricula_program`
--

INSERT INTO `curricula_program` (`curricula_program_id`, `curriculum_id`, `program_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, 1, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(3, 2, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(4, 2, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `faculty_email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `faculty_type` enum('full-time','part-time','regular') COLLATE utf8mb4_unicode_ci NOT NULL,
  `faculty_units` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`id`, `user_id`, `faculty_email`, `faculty_type`, `faculty_units`) VALUES
(1, 1, 'emmanuel.martinez@example.com', 'full-time', '25'),
(2, 4, 'adrian.naoe@example.com', 'part-time', '25'),
(3, 5, 'kyla.malaluan@example.com', 'full-time', '25'),
(4, 6, 'via.rasquero@example.com', 'regular', '25');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_reset_tokens_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2024_08_01_052140_create_faculties_table', 1),
(6, '2024_08_05_074558_hash_faculty_passwords', 1),
(7, '2024_08_07_005130_create_curricula_table', 1),
(8, '2024_08_07_005130_create_programs_table', 1),
(9, '2024_08_07_005131_create_curricula_program_table', 1),
(10, '2024_08_07_005132_create_year_level_table', 1),
(11, '2024_08_07_005133_create_semesters_table', 1),
(12, '2024_08_07_005134_create_courses_table', 1),
(13, '2024_08_07_005134_create_preferences_table', 1),
(14, '2024_08_09_143527_create_rooms_table', 1),
(15, '2024_08_21_074823_create_course_requirement', 1),
(16, '2024_08_22_000710_create_course_assignment', 1),
(17, '2024_08_26_034100_create_academic_year_table', 1),
(18, '2024_08_26_035029_create_active_semesters_table', 1),
(19, '2024_09_08_135204_create_academic_year_curricula_table', 1),
(20, '2024_09_08_135232_create_program_year_level_curricula_table', 1),
(21, '2024_09_08_135244_create_sections_per_program_year_table', 1),
(22, '2024_09_08_135256_create_section_courses_table', 1),
(23, '2024_09_08_135319_create_schedules_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `preferences`
--

CREATE TABLE `preferences` (
  `id` bigint UNSIGNED NOT NULL,
  `faculty_id` bigint UNSIGNED NOT NULL,
  `course_id` int UNSIGNED NOT NULL,
  `preferred_day` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preferred_time` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `program_id` int UNSIGNED NOT NULL,
  `program_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `program_title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `program_info` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `number_of_years` int NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`program_id`, `program_code`, `program_title`, `program_info`, `number_of_years`, `status`, `created_at`, `updated_at`) VALUES
(1, 'BSIT', 'Bachelor of Science in Information Technology', 'Focuses on information technology and its applications.', 4, 'active', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, 'BSME', 'Bachelor of Science in Mechanical Engineering', 'Focuses on mechanical engineering principles and practices.', 4, 'active', '2024-09-17 19:21:04', '2024-09-17 19:21:04');

-- --------------------------------------------------------

--
-- Table structure for table `program_year_level_curricula`
--

CREATE TABLE `program_year_level_curricula` (
  `program_year_level_curricula_id` bigint UNSIGNED NOT NULL,
  `academic_year_id` int UNSIGNED NOT NULL,
  `program_id` int UNSIGNED NOT NULL,
  `year_level` int NOT NULL,
  `curriculum_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `program_year_level_curricula`
--

INSERT INTO `program_year_level_curricula` (`program_year_level_curricula_id`, `academic_year_id`, `program_id`, `year_level`, `curriculum_id`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, 2, 1, 2, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(3, 2, 1, 3, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(4, 2, 1, 4, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(5, 2, 2, 1, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(6, 2, 2, 2, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(7, 2, 2, 3, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(8, 2, 2, 4, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `room_id` bigint UNSIGNED NOT NULL,
  `room_code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `floor_level` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`room_id`, `room_code`, `location`, `floor_level`, `room_type`, `capacity`, `status`, `created_at`, `updated_at`) VALUES
(1, 'A201', 'Building A', '2nd', 'Lecture', 50, 'available', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, 'A301', 'Building A', '3rd', 'Lecture', 50, 'available', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(3, 'A401', 'Building A', '4th', 'Lecture', 50, 'available', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(4, 'DOST Lab', 'Building A', '2nd', 'Lab', 30, 'available', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(5, 'Aboitiz Lab', 'Building A', '3rd', 'Lab', 30, 'available', '2024-09-17 19:21:04', '2024-09-17 19:21:04');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `schedule_id` bigint UNSIGNED NOT NULL,
  `section_course_id` bigint UNSIGNED NOT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `faculty_id` bigint UNSIGNED NOT NULL,
  `room_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`schedule_id`, `section_course_id`, `day`, `start_time`, `end_time`, `faculty_id`, `room_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'Monday', '09:00:00', '10:30:00', 1, 1, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(2, 2, 'Wednesday', '11:00:00', '12:30:00', 2, 2, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(3, 3, 'Friday', '14:00:00', '15:30:00', 3, 3, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(4, 4, 'Tuesday', '09:00:00', '10:30:00', 1, 1, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(5, 5, 'Thursday', '11:00:00', '12:30:00', 2, 2, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(6, 6, 'Monday', '14:00:00', '15:30:00', 3, 3, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(7, 7, 'Wednesday', '09:00:00', '10:30:00', 1, 4, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(8, 8, 'Friday', '11:00:00', '12:30:00', 2, 5, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(9, 9, 'Tuesday', '14:00:00', '15:30:00', 3, 1, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(10, 10, 'Thursday', '09:00:00', '10:30:00', 2, 2, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(11, 11, 'Monday', '11:00:00', '12:30:00', 3, 3, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(12, 12, 'Wednesday', '14:00:00', '15:30:00', 4, 4, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(13, 13, 'Friday', '09:00:00', '10:30:00', 2, 5, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(14, 14, 'Tuesday', '11:00:00', '12:30:00', 3, 1, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(15, 15, 'Thursday', '14:00:00', '15:30:00', 4, 2, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(16, 16, 'Monday', '09:00:00', '10:30:00', 2, 3, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(17, 17, 'Wednesday', '11:00:00', '12:30:00', 3, 4, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(18, 18, 'Friday', '14:00:00', '15:30:00', 4, 5, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(19, 19, 'Tuesday', '09:00:00', '10:30:00', 2, 3, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(20, 20, 'Thursday', '11:00:00', '12:30:00', 3, 4, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(21, 21, 'Monday', '14:00:00', '15:30:00', 4, 5, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(22, 22, 'Wednesday', '09:00:00', '10:30:00', 2, 1, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(23, 23, 'Friday', '11:00:00', '12:30:00', 3, 2, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(24, 24, 'Tuesday', '14:00:00', '15:30:00', 4, 3, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(25, 25, 'Thursday', '09:00:00', '10:30:00', 2, 4, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(26, 26, 'Monday', '11:00:00', '12:30:00', 3, 5, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(27, 27, 'Wednesday', '14:00:00', '15:30:00', 4, 1, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(28, 28, 'Friday', '09:00:00', '10:30:00', 2, 2, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(29, 29, 'Tuesday', '11:00:00', '12:30:00', 3, 3, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(30, 30, 'Thursday', '14:00:00', '15:30:00', 4, 4, '2024-09-17 19:21:05', '2024-09-17 19:21:05');

-- --------------------------------------------------------

--
-- Table structure for table `sections_per_program_year`
--

CREATE TABLE `sections_per_program_year` (
  `sections_per_program_year_id` bigint UNSIGNED NOT NULL,
  `academic_year_id` int UNSIGNED NOT NULL,
  `program_id` int UNSIGNED NOT NULL,
  `year_level` int NOT NULL,
  `section_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sections_per_program_year`
--

INSERT INTO `sections_per_program_year` (`sections_per_program_year_id`, `academic_year_id`, `program_id`, `year_level`, `section_name`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, 'Section 1', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, 2, 1, 1, 'Section 2', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(3, 2, 1, 2, 'Section 1', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(4, 2, 1, 3, 'Section 1', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(5, 2, 1, 4, 'Section 1', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(6, 2, 2, 1, 'Section 1', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(7, 2, 2, 1, 'Section 2', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(8, 2, 2, 2, 'Section 1', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(9, 2, 2, 3, 'Section 1', '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(10, 2, 2, 4, 'Section 1', '2024-09-17 19:21:04', '2024-09-17 19:21:04');

-- --------------------------------------------------------

--
-- Table structure for table `section_courses`
--

CREATE TABLE `section_courses` (
  `section_course_id` bigint UNSIGNED NOT NULL,
  `sections_per_program_year_id` bigint UNSIGNED NOT NULL,
  `course_assignment_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `section_courses`
--

INSERT INTO `section_courses` (`section_course_id`, `sections_per_program_year_id`, `course_assignment_id`, `created_at`, `updated_at`) VALUES
(1, 1, 10, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(2, 1, 11, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(3, 1, 12, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(4, 2, 10, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(5, 2, 11, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(6, 2, 12, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(7, 3, 13, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(8, 3, 14, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(9, 3, 15, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(10, 4, 16, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(11, 4, 17, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(12, 4, 18, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(13, 5, 19, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(14, 5, 20, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(15, 5, 21, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(16, 6, 28, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(17, 6, 29, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(18, 6, 30, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(19, 7, 28, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(20, 7, 29, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(21, 7, 30, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(22, 8, 31, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(23, 8, 32, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(24, 8, 33, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(25, 9, 34, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(26, 9, 35, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(27, 9, 36, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(28, 10, 37, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(29, 10, 38, '2024-09-17 19:21:05', '2024-09-17 19:21:05'),
(30, 10, 39, '2024-09-17 19:21:05', '2024-09-17 19:21:05');

-- --------------------------------------------------------

--
-- Table structure for table `semesters`
--

CREATE TABLE `semesters` (
  `semester_id` int UNSIGNED NOT NULL,
  `year_level_id` int UNSIGNED DEFAULT NULL,
  `semester` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `semesters`
--

INSERT INTO `semesters` (`semester_id`, `year_level_id`, `semester`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, 1, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(3, 1, 3, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(4, 2, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(5, 2, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(6, 2, 3, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(7, 3, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(8, 3, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(9, 3, 3, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(10, 4, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(11, 4, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(12, 4, 3, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(13, 5, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(14, 5, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(15, 5, 3, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(16, 6, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(17, 6, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(18, 6, 3, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(19, 7, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(20, 7, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(21, 7, 3, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(22, 8, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(23, 8, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(24, 8, 3, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(49, 17, 1, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(50, 17, 2, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(51, 17, 3, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(52, 18, 1, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(53, 18, 2, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(54, 18, 3, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(55, 19, 1, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(56, 19, 2, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(57, 19, 3, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(58, 20, 1, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(59, 20, 2, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(60, 20, 3, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(61, 21, 1, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(62, 21, 2, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(63, 21, 3, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(64, 22, 1, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(65, 22, 2, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(66, 22, 3, '2024-09-17 08:20:15', '2024-09-17 08:20:15'),
(67, 23, 1, '2024-09-17 08:20:16', '2024-09-17 08:20:16'),
(68, 23, 2, '2024-09-17 08:20:16', '2024-09-17 08:20:16'),
(69, 23, 3, '2024-09-17 08:20:16', '2024-09-17 08:20:16'),
(70, 24, 1, '2024-09-17 08:20:16', '2024-09-17 08:20:16'),
(71, 24, 2, '2024-09-17 08:20:16', '2024-09-17 08:20:16'),
(72, 24, 3, '2024-09-17 08:20:16', '2024-09-17 08:20:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('faculty','admin','superadmin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `code`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Emmanuel Martinez', 'FA0001TG2024', '$2y$12$M9LTpJXBiQ0vrMyOakHLeuQR0vie3a1ifslYMg9Vh.UOiXT.kkKl.', 'faculty', 'active', '2024-09-17 19:21:02', '2024-09-17 19:21:02'),
(2, 'Marissa B Ferrer', 'ADM001TG2024', '$2y$12$1tzv22m4AbqTED1dSfuHsuJm.3aDnlwbAdD/y/Rok//TvKx0AhOFa', 'admin', 'active', '2024-09-17 19:21:02', '2024-09-17 19:21:02'),
(3, 'Emmanuel Martinez', 'SDM001TG2024', '$2y$12$BmuSPe3JPvgIv3/uhc2ShOPg0KpKLn2h7VUOxlMU1dV115Ujxixuu', 'superadmin', 'active', '2024-09-17 19:21:03', '2024-09-17 19:21:03'),
(4, 'Adrian Naoe', 'FA0002TG2024', '$2y$12$RC8xxypGXlyQbgT5PiY0D.lt3MYh.6oMARKLRBLxRPNbBPTmpudji', 'faculty', 'active', '2024-09-17 19:21:03', '2024-09-17 19:21:03'),
(5, 'Kyla Malaluan', 'FA0003TG2024', '$2y$12$FthfJFH9aQt3mmJHZg81a.SXGhmBiazi0Z1xH9TMOrudfgUhxENNq', 'faculty', 'active', '2024-09-17 19:21:03', '2024-09-17 19:21:03'),
(6, 'Via Rasquero', 'FA0004TG2024', '$2y$12$xKE8RXYSPVXf8zRcfWrdxOPqmDPilfYi/6tBqxrcTCoWNtgrgvORu', 'faculty', 'active', '2024-09-17 19:21:04', '2024-09-17 19:21:04');

-- --------------------------------------------------------

--
-- Table structure for table `year_levels`
--

CREATE TABLE `year_levels` (
  `year_level_id` int UNSIGNED NOT NULL,
  `curricula_program_id` int UNSIGNED DEFAULT NULL,
  `year` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `year_levels`
--

INSERT INTO `year_levels` (`year_level_id`, `curricula_program_id`, `year`, `created_at`, `updated_at`) VALUES
(1, 3, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(2, 3, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(3, 1, 3, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(4, 1, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(5, 4, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(6, 4, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(7, 2, 3, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(8, 2, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(9, 3, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(10, 3, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(11, 4, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(12, 4, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(17, 1, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(18, 1, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(19, 2, 1, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(20, 2, 2, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(21, 3, 3, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(22, 3, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(23, 4, 3, '2024-09-17 19:21:04', '2024-09-17 19:21:04'),
(24, 4, 4, '2024-09-17 19:21:04', '2024-09-17 19:21:04');

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
  ADD KEY `academic_year_curricula_academic_year_id_foreign` (`academic_year_id`),
  ADD KEY `academic_year_curricula_curriculum_id_foreign` (`curriculum_id`);

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
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `preferences`
--
ALTER TABLE `preferences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `preferences_faculty_id_foreign` (`faculty_id`),
  ADD KEY `preferences_course_id_foreign` (`course_id`);

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
  ADD KEY `program_year_level_curricula_academic_year_id_foreign` (`academic_year_id`),
  ADD KEY `program_year_level_curricula_program_id_foreign` (`program_id`),
  ADD KEY `program_year_level_curricula_curriculum_id_foreign` (`curriculum_id`);

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
  ADD KEY `schedules_section_course_id_foreign` (`section_course_id`),
  ADD KEY `schedules_faculty_id_foreign` (`faculty_id`),
  ADD KEY `schedules_room_id_foreign` (`room_id`);

--
-- Indexes for table `sections_per_program_year`
--
ALTER TABLE `sections_per_program_year`
  ADD PRIMARY KEY (`sections_per_program_year_id`),
  ADD KEY `sections_per_program_year_academic_year_id_foreign` (`academic_year_id`),
  ADD KEY `sections_per_program_year_program_id_foreign` (`program_id`);

--
-- Indexes for table `section_courses`
--
ALTER TABLE `section_courses`
  ADD PRIMARY KEY (`section_course_id`),
  ADD KEY `section_courses_sections_per_program_year_id_foreign` (`sections_per_program_year_id`),
  ADD KEY `section_courses_course_assignment_id_foreign` (`course_assignment_id`);

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
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_code_unique` (`code`);

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
  MODIFY `academic_year_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `academic_year_curricula`
--
ALTER TABLE `academic_year_curricula`
  MODIFY `academic_year_curricula_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `active_semesters`
--
ALTER TABLE `active_semesters`
  MODIFY `active_semester_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `course_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `course_assignments`
--
ALTER TABLE `course_assignments`
  MODIFY `course_assignment_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `course_requirements`
--
ALTER TABLE `course_requirements`
  MODIFY `requirement_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `curricula`
--
ALTER TABLE `curricula`
  MODIFY `curriculum_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `curricula_program`
--
ALTER TABLE `curricula_program`
  MODIFY `curricula_program_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `preferences`
--
ALTER TABLE `preferences`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `program_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `program_year_level_curricula`
--
ALTER TABLE `program_year_level_curricula`
  MODIFY `program_year_level_curricula_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `schedule_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `sections_per_program_year`
--
ALTER TABLE `sections_per_program_year`
  MODIFY `sections_per_program_year_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `section_courses`
--
ALTER TABLE `section_courses`
  MODIFY `section_course_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `semesters`
--
ALTER TABLE `semesters`
  MODIFY `semester_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `year_levels`
--
ALTER TABLE `year_levels`
  MODIFY `year_level_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `academic_year_curricula`
--
ALTER TABLE `academic_year_curricula`
  ADD CONSTRAINT `academic_year_curricula_academic_year_id_foreign` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `academic_year_curricula_curriculum_id_foreign` FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `course_assignments_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `course_assignments_curricula_program_id_foreign` FOREIGN KEY (`curricula_program_id`) REFERENCES `curricula_program` (`curricula_program_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `course_assignments_semester_id_foreign` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

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
  ADD CONSTRAINT `curricula_program_curriculum_id_foreign` FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `curricula_program_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `faculty`
--
ALTER TABLE `faculty`
  ADD CONSTRAINT `faculty_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `preferences`
--
ALTER TABLE `preferences`
  ADD CONSTRAINT `preferences_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `preferences_faculty_id_foreign` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `program_year_level_curricula`
--
ALTER TABLE `program_year_level_curricula`
  ADD CONSTRAINT `program_year_level_curricula_academic_year_id_foreign` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `program_year_level_curricula_curriculum_id_foreign` FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `program_year_level_curricula_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_faculty_id_foreign` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedules_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedules_section_course_id_foreign` FOREIGN KEY (`section_course_id`) REFERENCES `section_courses` (`section_course_id`) ON DELETE CASCADE;

--
-- Constraints for table `sections_per_program_year`
--
ALTER TABLE `sections_per_program_year`
  ADD CONSTRAINT `sections_per_program_year_academic_year_id_foreign` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sections_per_program_year_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE;

--
-- Constraints for table `section_courses`
--
ALTER TABLE `section_courses`
  ADD CONSTRAINT `section_courses_course_assignment_id_foreign` FOREIGN KEY (`course_assignment_id`) REFERENCES `course_assignments` (`course_assignment_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `section_courses_sections_per_program_year_id_foreign` FOREIGN KEY (`sections_per_program_year_id`) REFERENCES `sections_per_program_year` (`sections_per_program_year_id`) ON DELETE CASCADE;

--
-- Constraints for table `semesters`
--
ALTER TABLE `semesters`
  ADD CONSTRAINT `semesters_year_level_id_foreign` FOREIGN KEY (`year_level_id`) REFERENCES `year_levels` (`year_level_id`) ON DELETE CASCADE;

--
-- Constraints for table `year_levels`
--
ALTER TABLE `year_levels`
  ADD CONSTRAINT `year_levels_curricula_program_id_foreign` FOREIGN KEY (`curricula_program_id`) REFERENCES `curricula_program` (`curricula_program_id`) ON DELETE CASCADE ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
