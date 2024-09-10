-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 25, 2024 at 06:16 PM
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
-- Database: `pupt_flss_partial`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_years`
--

CREATE TABLE `academic_years` (
  `academic_year_id` int(11) NOT NULL,
  `year_start` int(11) NOT NULL,
  `year_end` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `academic_years`
--

INSERT INTO `academic_years` (`academic_year_id`, `year_start`, `year_end`, `is_active`) VALUES
(1, 2022, 2023, 1),
(2, 2021, 2022, 0),
(3, 2020, 2021, 0),
(4, 2018, 2019, 0);

-- --------------------------------------------------------

--
-- Table structure for table `active_semesters`
--

CREATE TABLE `active_semesters` (
  `active_semester_id` int(11) NOT NULL,
  `academic_year_id` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `active_semesters`
--

INSERT INTO `active_semesters` (`active_semester_id`, `academic_year_id`, `semester_id`, `is_active`) VALUES
(1, 1, 1, 1),
(2, 1, 2, 0),
(3, 4, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `course_id` int(11) NOT NULL,
  `course_code` varchar(10) NOT NULL,
  `course_title` varchar(100) NOT NULL,
  `lec_hours` int(11) NOT NULL,
  `lab_hours` int(11) NOT NULL,
  `units` int(11) NOT NULL,
  `tuition_hours` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`course_id`, `course_code`, `course_title`, `lec_hours`, `lab_hours`, `units`, `tuition_hours`) VALUES
(1, 'IT101', 'Introduction to Information Technology', 3, 0, 3, 3),
(2, 'IT102', 'Programming 1', 2, 3, 3, 5),
(3, 'IT103', 'Database Management Systems', 2, 3, 3, 5),
(4, 'IT104', 'Web Development', 2, 3, 3, 5),
(5, 'IT201', 'Data Structures and Algorithms', 3, 0, 3, 3),
(6, 'IT202', 'Operating Systems', 3, 0, 3, 3),
(7, 'IT203', 'Software Engineering', 3, 0, 3, 3),
(8, 'IT204', 'Computer Networks', 3, 0, 3, 3),
(9, 'PE101', 'Physical Education 1', 2, 0, 2, 2),
(10, 'PE102', 'Physical Education 2', 2, 0, 2, 2),
(11, 'MATH101', 'College Algebra', 3, 0, 3, 3),
(12, 'ENG101', 'English Communication 1', 3, 0, 3, 3),
(13, 'ACC101', 'Financial Accounting 1', 3, 0, 3, 3),
(14, 'ACC102', 'Cost Accounting', 3, 0, 3, 3),
(15, 'ACC201', 'Management Accounting', 3, 0, 3, 3),
(16, 'ACC202', 'Taxation', 3, 0, 3, 3);

-- --------------------------------------------------------

--
-- Table structure for table `course_assignments`
--

CREATE TABLE `course_assignments` (
  `course_assignment_id` int(11) NOT NULL,
  `curricula_program_id` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_assignments`
--

INSERT INTO `course_assignments` (`course_assignment_id`, `curricula_program_id`, `semester_id`, `course_id`) VALUES
(1, 1, 1, 1),
(2, 1, 1, 2),
(3, 1, 1, 9),
(4, 1, 1, 11),
(5, 1, 2, 3),
(6, 1, 2, 10),
(7, 1, 3, 4),
(8, 1, 4, 5),
(9, 1, 4, 12),
(10, 1, 5, 6),
(11, 1, 6, 7),
(12, 1, 7, 8),
(13, 1, 8, 4),
(14, 1, 9, 3),
(15, 2, 5, 9),
(16, 2, 5, 10),
(17, 2, 5, 11),
(18, 2, 6, 12),
(19, 2, 6, 13),
(20, 2, 7, 14),
(22, 2, 8, 10),
(21, 2, 8, 15),
(23, 2, 9, 16),
(24, 2, 10, 6);

-- --------------------------------------------------------

--
-- Table structure for table `course_requirements`
--

CREATE TABLE `course_requirements` (
  `requirement_id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `requirement_type` enum('pre','co') NOT NULL,
  `required_course_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `curricula`
--

CREATE TABLE `curricula` (
  `curriculum_id` int(11) NOT NULL,
  `curriculum_year` varchar(4) NOT NULL,
  `status` enum('active','inactive') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `curricula`
--

INSERT INTO `curricula` (`curriculum_id`, `curriculum_year`, `status`, `created_at`, `updated_at`) VALUES
(1, '2022', 'active', '2024-08-25 16:14:56', '2024-08-25 16:14:56'),
(2, '2018', 'active', '2024-08-25 16:14:56', '2024-08-25 16:14:56');

-- --------------------------------------------------------

--
-- Table structure for table `curricula_programs`
--

CREATE TABLE `curricula_programs` (
  `curricula_program_id` int(11) NOT NULL,
  `curriculum_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `curricula_programs`
--

INSERT INTO `curricula_programs` (`curricula_program_id`, `curriculum_id`, `program_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 1),
(4, 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `program_id` int(11) NOT NULL,
  `program_code` varchar(10) NOT NULL,
  `program_title` varchar(100) NOT NULL,
  `program_info` varchar(255) NOT NULL,
  `number_of_years` int(11) NOT NULL,
  `status` enum('active','inactive') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`program_id`, `program_code`, `program_title`, `program_info`, `number_of_years`, `status`) VALUES
(1, 'BSIT', 'Bachelor of Science in Information Technology', 'A four-year degree program that provides students with the skills needed in IT.', 4, 'active'),
(2, 'BSA', 'Bachelor of Science in Accountancy', 'A four-year degree program that prepares students for the CPA board exam.', 4, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `section_id` int(11) NOT NULL,
  `section_name` varchar(50) NOT NULL,
  `year_level_id` int(11) DEFAULT NULL,
  `academic_year_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`section_id`, `section_name`, `year_level_id`, `academic_year_id`) VALUES
(1, '1', 1, 1),
(3, '1', 2, 1),
(4, '1', 5, 1),
(5, '1', 6, 1),
(2, '2', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `semesters`
--

CREATE TABLE `semesters` (
  `semester_id` int(11) NOT NULL,
  `year_level_id` int(11) DEFAULT NULL,
  `semester` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `semesters`
--

INSERT INTO `semesters` (`semester_id`, `year_level_id`, `semester`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 2, 1),
(5, 2, 2),
(6, 2, 3),
(7, 3, 1),
(8, 3, 2),
(9, 3, 3),
(10, 4, 1),
(11, 4, 2),
(12, 4, 3),
(13, 5, 1),
(14, 5, 2),
(15, 5, 3),
(16, 6, 1),
(17, 6, 2),
(18, 6, 3),
(19, 7, 1),
(20, 7, 2),
(21, 7, 3),
(22, 8, 1),
(23, 8, 2),
(24, 8, 3),
(25, 9, 1),
(26, 9, 2),
(27, 9, 3),
(28, 10, 1),
(29, 10, 2),
(30, 10, 3),
(31, 11, 1),
(32, 11, 2),
(33, 11, 3),
(34, 12, 1),
(35, 12, 2),
(36, 12, 3),
(37, 13, 1),
(38, 13, 2),
(39, 13, 3),
(40, 14, 1),
(41, 14, 2),
(42, 14, 3),
(43, 15, 1),
(44, 15, 2),
(45, 15, 3),
(46, 16, 1),
(47, 16, 2),
(48, 16, 3);

-- --------------------------------------------------------

--
-- Table structure for table `year_levels`
--

CREATE TABLE `year_levels` (
  `year_level_id` int(11) NOT NULL,
  `curricula_program_id` int(11) DEFAULT NULL,
  `year` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `year_levels`
--

INSERT INTO `year_levels` (`year_level_id`, `curricula_program_id`, `year`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 2, 1),
(6, 2, 2),
(7, 2, 3),
(8, 2, 4),
(9, 3, 1),
(10, 3, 2),
(11, 3, 3),
(12, 3, 4),
(13, 4, 1),
(14, 4, 2),
(15, 4, 3),
(16, 4, 4);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_years`
--
ALTER TABLE `academic_years`
  ADD PRIMARY KEY (`academic_year_id`),
  ADD UNIQUE KEY `year_start` (`year_start`,`year_end`);

--
-- Indexes for table `active_semesters`
--
ALTER TABLE `active_semesters`
  ADD PRIMARY KEY (`active_semester_id`),
  ADD UNIQUE KEY `academic_year_id` (`academic_year_id`,`semester_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`course_id`),
  ADD UNIQUE KEY `course_code` (`course_code`);

--
-- Indexes for table `course_assignments`
--
ALTER TABLE `course_assignments`
  ADD PRIMARY KEY (`course_assignment_id`),
  ADD UNIQUE KEY `curricula_program_id` (`curricula_program_id`,`semester_id`,`course_id`),
  ADD KEY `semester_id` (`semester_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `course_requirements`
--
ALTER TABLE `course_requirements`
  ADD PRIMARY KEY (`requirement_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `required_course_id` (`required_course_id`);

--
-- Indexes for table `curricula`
--
ALTER TABLE `curricula`
  ADD PRIMARY KEY (`curriculum_id`);

--
-- Indexes for table `curricula_programs`
--
ALTER TABLE `curricula_programs`
  ADD PRIMARY KEY (`curricula_program_id`),
  ADD UNIQUE KEY `curriculum_id` (`curriculum_id`,`program_id`),
  ADD KEY `curriculum_id_2` (`curriculum_id`),
  ADD KEY `program_id` (`program_id`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`program_id`),
  ADD UNIQUE KEY `program_code` (`program_code`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`section_id`),
  ADD UNIQUE KEY `section_name` (`section_name`,`year_level_id`,`academic_year_id`),
  ADD KEY `year_level_id` (`year_level_id`),
  ADD KEY `academic_year_id` (`academic_year_id`);

--
-- Indexes for table `semesters`
--
ALTER TABLE `semesters`
  ADD PRIMARY KEY (`semester_id`),
  ADD UNIQUE KEY `year_level_id` (`year_level_id`,`semester`),
  ADD KEY `year_level_id_2` (`year_level_id`);

--
-- Indexes for table `year_levels`
--
ALTER TABLE `year_levels`
  ADD PRIMARY KEY (`year_level_id`),
  ADD UNIQUE KEY `curricula_program_id` (`curricula_program_id`,`year`),
  ADD KEY `curricula_program_id_2` (`curricula_program_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_years`
--
ALTER TABLE `academic_years`
  MODIFY `academic_year_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `active_semesters`
--
ALTER TABLE `active_semesters`
  MODIFY `active_semester_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `course_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `course_assignments`
--
ALTER TABLE `course_assignments`
  MODIFY `course_assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `course_requirements`
--
ALTER TABLE `course_requirements`
  MODIFY `requirement_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `curricula`
--
ALTER TABLE `curricula`
  MODIFY `curriculum_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `curricula_programs`
--
ALTER TABLE `curricula_programs`
  MODIFY `curricula_program_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `program_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `semesters`
--
ALTER TABLE `semesters`
  MODIFY `semester_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `year_levels`
--
ALTER TABLE `year_levels`
  MODIFY `year_level_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `active_semesters`
--
ALTER TABLE `active_semesters`
  ADD CONSTRAINT `active_semesters_ibfk_1` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`),
  ADD CONSTRAINT `active_semesters_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`);

--
-- Constraints for table `course_assignments`
--
ALTER TABLE `course_assignments`
  ADD CONSTRAINT `course_assignments_ibfk_1` FOREIGN KEY (`curricula_program_id`) REFERENCES `curricula_programs` (`curricula_program_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_assignments_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_assignments_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE;

--
-- Constraints for table `course_requirements`
--
ALTER TABLE `course_requirements`
  ADD CONSTRAINT `course_requirements_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_requirements_ibfk_2` FOREIGN KEY (`required_course_id`) REFERENCES `courses` (`course_id`);

--
-- Constraints for table `curricula_programs`
--
ALTER TABLE `curricula_programs`
  ADD CONSTRAINT `curricula_programs_ibfk_1` FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `curricula_programs_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE CASCADE;

--
-- Constraints for table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `sections_ibfk_1` FOREIGN KEY (`year_level_id`) REFERENCES `year_levels` (`year_level_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sections_ibfk_2` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`academic_year_id`) ON DELETE CASCADE;

--
-- Constraints for table `semesters`
--
ALTER TABLE `semesters`
  ADD CONSTRAINT `semesters_ibfk_1` FOREIGN KEY (`year_level_id`) REFERENCES `year_levels` (`year_level_id`) ON DELETE CASCADE;

--
-- Constraints for table `year_levels`
--
ALTER TABLE `year_levels`
  ADD CONSTRAINT `year_levels_ibfk_1` FOREIGN KEY (`curricula_program_id`) REFERENCES `curricula_programs` (`curricula_program_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
