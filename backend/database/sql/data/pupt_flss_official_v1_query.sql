-- Sample Queries for pupt_flss_beta.sql (Beta Version 1.0)
-- Proof of Concept (09-08-2024)

-- Query 1: Get all academic Years and semesters
SELECT 
    ay.academic_year_id,
    ay.year_start,
    ay.year_end,
    s.semester_id,
    s.semester
FROM 
    academic_years ay
JOIN 
    active_semesters ase ON ay.academic_year_id = ase.academic_year_id
JOIN 
    semesters s ON ase.semester_id = s.semester_id;


-- Query 2: Get the current active year and semester
SELECT 
    ay.academic_year_id,
    ay.year_start,
    ay.year_end,
    s.semester_id,
    s.semester
FROM 
    academic_years ay
JOIN 
    active_semesters ase ON ay.academic_year_id = ase.academic_year_id
JOIN 
    semesters s ON ase.semester_id = s.semester_id
WHERE 
    ase.is_active = 1;


-- Query 3: Get all the unique programs in all active curricula
-- offered under the current active year and semester
SELECT 
    DISTINCT p.program_id,
    p.program_code,
    p.program_title
FROM 
    programs p
JOIN 
    curricula_program cp ON p.program_id = cp.program_id
JOIN 
    academic_year_curricula ayc ON cp.curriculum_id = ayc.curriculum_id
JOIN 
    active_semesters ase ON ayc.academic_year_id = ase.academic_year_id
WHERE 
    ase.is_active = 1;


-- Query 4A: Get all the year levels and the curriculum used by each of them in 
-- every unique program in all active curricula offered under the 
-- current active year and semester.

-- NOTE: This query assumes that all year levels across all programs uses the
-- same curriculum (e.g. all 1st Year uses 2022, while all 3rd year uses 2018)
SELECT 
    p.program_id,
    p.program_code,
    p.program_title,
    pylc.year_level,
    c.curriculum_id,
    c.curriculum_year,
    ay.year_start,
    ay.year_end,
    s.semester
FROM 
    program_year_level_curricula pylc
JOIN 
    programs p ON pylc.program_id = p.program_id
JOIN 
    curricula c ON pylc.curriculum_id = c.curriculum_id
JOIN 
    academic_years ay ON pylc.academic_year_id = ay.academic_year_id
JOIN 
    active_semesters ase ON ay.academic_year_id = ase.academic_year_id
JOIN 
    semesters s ON ase.semester_id = s.semester_id
WHERE 
    ase.is_active = 1
    AND ((pylc.year_level IN (1, 2) AND c.curriculum_year = 2022) -- change as needed!
         OR (pylc.year_level >= 3 AND c.curriculum_year = 2018)) -- change as needed!
ORDER BY 
    p.program_id, pylc.year_level;


-- Query 4B: Get all the year levels and the curriculum used by each of them in 
-- every unique program in all active curricula offered under the 
-- current active year and semester.

-- NOTE: Alternatively, in cases where not all programs uses the same set of 
-- curriculum version for their year levels
SELECT 
    p.program_id,
    p.program_code,
    p.program_title,
    pylc.year_level,
    c.curriculum_id,
    c.curriculum_year,
    ay.year_start,
    ay.year_end,
    s.semester
FROM 
    program_year_level_curricula pylc
JOIN 
    programs p ON pylc.program_id = p.program_id
JOIN 
    curricula c ON pylc.curriculum_id = c.curriculum_id
JOIN 
    academic_years ay ON pylc.academic_year_id = ay.academic_year_id
JOIN 
    active_semesters ase ON ay.academic_year_id = ase.academic_year_id
JOIN 
    semesters s ON ase.semester_id = s.semester_id
WHERE 
    ase.is_active = 1
    AND (
        (p.program_code = 'BSIT' AND pylc.year_level IN (1, 2) AND c.curriculum_year = 2022) OR
        (p.program_code = 'BSIT' AND pylc.year_level IN (3, 4) AND c.curriculum_year = 2018) OR

        (p.program_code = 'BSA' AND pylc.year_level IN (1, 2) AND c.curriculum_year = 2022) OR
        (p.program_code = 'BSA' AND pylc.year_level IN (3, 4, 5) AND c.curriculum_year = 2018) OR

        (p.program_code = 'BSPSYCH' AND pylc.year_level IN (1, 2, 3, 4) AND c.curriculum_year = 2022) -- hypothetical program case scenario
    )
ORDER BY 
    p.program_id, pylc.year_level;

-- Query 5: Get every section in every year level in every program 
-- in all active curricula offered under the current active year and semester
SELECT 
    sp.sections_per_program_year_id,
    sp.section_name,
    sp.year_level,
    p.program_id,
    p.program_code,
    ay.year_start,
    ay.year_end
FROM 
    sections_per_program_year sp
JOIN 
    programs p ON sp.program_id = p.program_id
JOIN 
    academic_years ay ON sp.academic_year_id = ay.academic_year_id
JOIN 
    active_semesters ase ON ay.academic_year_id = ase.academic_year_id
WHERE 
    ase.is_active = 1;


-- Query 6: Query to get the number of sections for each program-year level by 
-- academic Year and semester
SELECT 
    p.program_id,
    p.program_code,
    p.program_title,
    sp.year_level,
    ay.year_start,
    ay.year_end,
    s.semester,
    COUNT(DISTINCT sp.section_name) AS number_of_sections
FROM 
    sections_per_program_year sp
JOIN 
    programs p ON sp.program_id = p.program_id
JOIN 
    academic_years ay ON sp.academic_year_id = ay.academic_year_id
JOIN 
    active_semesters ase ON ay.academic_year_id = ase.academic_year_id
JOIN 
    semesters s ON ase.semester_id = s.semester_id
WHERE 
    ay.year_start = 2024 AND ay.year_end = 2025  -- change as needed!
GROUP BY 
    p.program_id, sp.year_level, ay.year_start, ay.year_end, s.semester
ORDER BY 
    p.program_id, sp.year_level;

-- Query 7: Retrieve Courses and Schedule 
SELECT DISTINCT
    c.course_code,
    c.course_title,
    c.lec_hours AS Lec,
    c.lab_hours AS Lab,
    c.units,
    c.tuition_hours,
    sch.day,
    sch.start_time,
    sch.end_time,
    f.faculty_email AS professor_email,
    u.name AS professor_name,
    r.room_code AS room
FROM 
    sections_per_program_year sp
JOIN 
    program_year_level_curricula pylc ON sp.program_id = pylc.program_id 
                                      AND sp.year_level = pylc.year_level
                                      AND sp.academic_year_id = pylc.academic_year_id
JOIN 
    curricula c2 ON pylc.curriculum_id = c2.curriculum_id
JOIN 
    curricula_program cp ON c2.curriculum_id = cp.curriculum_id
JOIN 
    course_assignments ca ON cp.curricula_program_id = ca.curricula_program_id
JOIN 
    courses c ON ca.course_id = c.course_id
JOIN 
    section_courses sc ON sp.sections_per_program_year_id = sc.sections_per_program_year_id
                      AND sc.course_id = c.course_id
JOIN 
    schedules sch ON sc.section_course_id = sch.section_course_id
JOIN 
    faculty f ON sch.faculty_id = f.id
JOIN 
    users u ON f.user_id = u.id
JOIN 
    rooms r ON sch.room_id = r.room_id
JOIN 
    active_semesters ase ON sp.academic_year_id = ase.academic_year_id
JOIN 
    semesters s ON ase.semester_id = s.semester_id
WHERE 
    ase.is_active = 1 -- change as needed!
    AND sp.program_id = 1 -- change as needed!
    AND sp.year_level = 1 -- change as needed!
    AND sp.section_name = 'Section A' -- change as needed!
ORDER BY 
    c.course_code, sch.day, sch.start_time;


-- Query 8: Retrieve a specific faculty load and schedule for the current
-- active academic year and semester
SELECT 
    c.course_code,
    c.course_title,
    c.lec_hours AS Lec,
    c.lab_hours AS Lab,
    c.units,
    c.tuition_hours,
    sch.day,
    sch.start_time,
    sch.end_time,
    sp.section_name,
    r.room_code AS room,
    f.faculty_email AS professor_email,
    u.name AS professor_name
FROM 
    schedules sch
JOIN 
    section_courses sc ON sch.section_course_id = sc.section_course_id
JOIN 
    sections_per_program_year sp ON sc.sections_per_program_year_id = sp.sections_per_program_year_id
JOIN 
    courses c ON sc.course_id = c.course_id
JOIN 
    rooms r ON sch.room_id = r.room_id
JOIN 
    faculty f ON sch.faculty_id = f.id
JOIN 
    users u ON f.user_id = u.id
JOIN 
    active_semesters ase ON sp.academic_year_id = ase.academic_year_id
JOIN 
    semesters s ON ase.semester_id = s.semester_id
WHERE 
    ase.is_active = 1 -- change as needed!
    AND sch.faculty_id = 1 -- change as needed!
ORDER BY 
    sch.day, sch.start_time;


-- Query 9: Retrieve load and Schedule for a specific Program-Year-Level-Section
-- combination for the current active year and semester
SELECT 
    c.course_code,
    c.course_title,
    c.lec_hours AS Lec,
    c.lab_hours AS Lab,
    c.units,
    c.tuition_hours,
    sch.day,
    sch.start_time,
    sch.end_time,
    u.name AS professor_name,
    r.room_code AS room
FROM 
    sections_per_program_year sp
JOIN 
    section_courses sc ON sp.sections_per_program_year_id = sc.sections_per_program_year_id
JOIN 
    courses c ON sc.course_id = c.course_id
JOIN 
    schedules sch ON sc.section_course_id = sch.section_course_id
JOIN 
    faculty f ON sch.faculty_id = f.id
JOIN 
    users u ON f.user_id = u.id
JOIN 
    rooms r ON sch.room_id = r.room_id
JOIN 
    active_semesters ase ON sp.academic_year_id = ase.academic_year_id
JOIN 
    semesters s ON ase.semester_id = s.semester_id
WHERE 
    ase.is_active = 1 -- change as needed!
    AND sp.program_id = 1 -- change as needed!
    AND sp.year_level = 1 -- change as needed!
    AND sp.section_name = 'Section A' -- change as needed!
ORDER BY 
    c.course_code, sch.day, sch.start_time;


-- Query 10: Retrieve Load and Schedule for a Room on a Particular Day
SELECT 
    c.course_code,
    c.course_title,
    c.lec_hours AS Lec,
    c.lab_hours AS Lab,
    c.units,
    c.tuition_hours,
    sch.day,
    sch.start_time,
    sch.end_time,
    sp.section_name,
    f.faculty_email AS professor_email,
    u.name AS professor_name,
    r.room_code AS room
FROM 
    schedules sch
JOIN 
    section_courses sc ON sch.section_course_id = sc.section_course_id
JOIN 
    sections_per_program_year sp ON sc.sections_per_program_year_id = sp.sections_per_program_year_id
JOIN 
    courses c ON sc.course_id = c.course_id
JOIN 
    rooms r ON sch.room_id = r.room_id
JOIN 
    faculty f ON sch.faculty_id = f.id
JOIN 
    users u ON f.user_id = u.id
JOIN 
    active_semesters ase ON sp.academic_year_id = ase.academic_year_id
JOIN 
    semesters s ON ase.semester_id = s.semester_id
WHERE 
    ase.is_active = 1 -- change as needed!
    AND sch.room_id = 1 -- change as needed!
    AND sch.day = 'Monday' -- change as needed!
ORDER BY 
    sch.start_time;
