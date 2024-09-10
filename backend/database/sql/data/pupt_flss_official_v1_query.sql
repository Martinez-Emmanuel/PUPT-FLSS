-- Sample Queries for pupt_flss_beta.sql (Beta Version 1.0)
-- Proof of Concept (09-08-2024)

-- Query 1: Get all academic Years and semesters
SELECT 
    ay.academic_year_id,
    CONCAT(ay.year_start, '-', ay.year_end) AS academic_year,
    s.semester_id,
    s.semester AS semester_number,
    act_s.is_active
FROM 
    academic_years ay
JOIN 
    active_semesters act_s ON ay.academic_year_id = act_s.academic_year_id
JOIN 
    semesters s ON act_s.semester_id = s.semester_id
ORDER BY 
    ay.year_start, s.semester;


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

        (p.program_code = 'BSME' AND pylc.year_level IN (1, 2) AND c.curriculum_year = 2022) OR
        (p.program_code = 'BSME' AND pylc.year_level IN (3, 4, 5) AND c.curriculum_year = 2018) OR

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
SELECT 
    p.program_code,
    p.program_title,
    sp.section_name,
    yl.year AS year_level,
    s.semester AS semester_number,
    c.course_code,
    c.course_title,
    sc.day,
    sc.start_time,
    sc.end_time,
    u.name AS faculty_name,
    r.room_code,
    r.location
FROM 
    programs p
JOIN 
    sections_per_program_year sp ON p.program_id = sp.program_id
JOIN 
    year_levels yl ON sp.year_level = yl.year
JOIN 
    semesters s ON s.year_level_id = yl.year_level_id
JOIN 
    active_semesters ase ON ase.semester_id = s.semester_id
JOIN 
    section_courses scs ON sp.sections_per_program_year_id = scs.sections_per_program_year_id
JOIN 
    course_assignments ca ON scs.course_assignment_id = ca.course_assignment_id
JOIN 
    courses c ON ca.course_id = c.course_id
JOIN 
    schedules sc ON scs.section_course_id = sc.section_course_id
JOIN 
    faculty f ON sc.faculty_id = f.id
JOIN 
    users u ON f.user_id = u.id -- change as needed!
JOIN 
    rooms r ON sc.room_id = r.room_id
WHERE 
    p.program_code = 'BSIT' -- change as needed!
    AND yl.year = 1 -- change as needed!
    AND sp.section_name = 'Section 1' -- change as needed!
    AND ase.is_active = 1
ORDER BY 
    p.program_code, yl.year, sp.section_name, c.course_code;


-- Query 8: Retrieve a specific faculty's load and schedule for the current
-- active academic year and semester
SELECT 
    u.name AS faculty_name,
    p.program_code,
    p.program_title,
    sp.section_name,
    yl.year AS year_level,
    s.semester AS semester_number,
    c.course_code,
    c.course_title,
    sc.day,
    sc.start_time,
    sc.end_time,
    r.room_code,
    r.location
FROM 
    faculty f
JOIN 
    users u ON f.user_id = u.id
JOIN 
    schedules sc ON f.id = sc.faculty_id
JOIN 
    section_courses scs ON sc.section_course_id = scs.section_course_id
JOIN 
    course_assignments ca ON scs.course_assignment_id = ca.course_assignment_id
JOIN 
    courses c ON ca.course_id = c.course_id
JOIN 
    sections_per_program_year sp ON scs.sections_per_program_year_id = sp.sections_per_program_year_id
JOIN 
    programs p ON sp.program_id = p.program_id
JOIN 
    year_levels yl ON sp.year_level = yl.year
JOIN 
    semesters s ON s.year_level_id = yl.year_level_id
JOIN 
    active_semesters ase ON ase.semester_id = s.semester_id AND ase.academic_year_id = sp.academic_year_id
JOIN 
    rooms r ON sc.room_id = r.room_id
WHERE 
    u.code = 'FA0001TG2024'  -- change as needed!
    AND ase.is_active = 1
ORDER BY 
    sc.day, sc.start_time;


-- Query 9: Retrieve load and Schedule for a specific Program-Year-Level-Section
-- combination for the current active year and semester
SELECT 
    p.program_code,
    p.program_title,
    sp.section_name,
    yl.year AS year_level,
    s.semester AS semester_number,
    c.course_code,
    c.course_title,
    sc.day,
    sc.start_time,
    sc.end_time,
    u.name AS faculty_name,
    r.room_code,
    r.location
FROM 
    programs p
JOIN 
    sections_per_program_year sp ON p.program_id = sp.program_id
JOIN 
    year_levels yl ON sp.year_level = yl.year
JOIN 
    semesters s ON s.year_level_id = yl.year_level_id
JOIN 
    active_semesters ase ON ase.semester_id = s.semester_id AND ase.academic_year_id = sp.academic_year_id
JOIN 
    section_courses scs ON sp.sections_per_program_year_id = scs.sections_per_program_year_id
JOIN 
    course_assignments ca ON scs.course_assignment_id = ca.course_assignment_id
JOIN 
    courses c ON ca.course_id = c.course_id
JOIN 
    schedules sc ON scs.section_course_id = sc.section_course_id
JOIN 
    faculty f ON sc.faculty_id = f.id
JOIN 
    users u ON f.user_id = u.id
JOIN 
    rooms r ON sc.room_id = r.room_id
WHERE 
    p.program_code = 'BSIT'  -- change as needed!
    AND yl.year = 1          -- change as needed!
    AND sp.section_name = 'Section 1'  -- change as needed!
    AND ase.is_active = 1 



-- Query 10: Retrieve Load and Schedule for a Room on a Particular Day
SELECT 
    r.room_code,
    r.location,
    sc.day,
    sc.start_time,
    sc.end_time,
    c.course_code,
    c.course_title,
    u.name AS faculty_name,
    p.program_code,
    p.program_title,
    sp.section_name
FROM 
    schedules sc
JOIN 
    rooms r ON sc.room_id = r.room_id
JOIN 
    section_courses scs ON sc.section_course_id = scs.section_course_id
JOIN 
    course_assignments ca ON scs.course_assignment_id = ca.course_assignment_id
JOIN 
    courses c ON ca.course_id = c.course_id
JOIN 
    faculty f ON sc.faculty_id = f.id
JOIN 
    users u ON f.user_id = u.id
JOIN 
    sections_per_program_year sp ON scs.sections_per_program_year_id = sp.sections_per_program_year_id
JOIN 
    programs p ON sp.program_id = p.program_id
WHERE 
    r.room_code = 'A201'  -- change as needed!
    AND sc.day = 'Monday'  -- change as needed!
ORDER BY 
    sc.start_time;


-- Query 11: Retrieve Courses Offered for Faculty Preference Submission
SELECT DISTINCT
    p.program_code,
    p.program_title,
    yl.year AS year_level,
    co.course_code,
    co.course_title,
    c.curriculum_year
FROM 
    programs p
JOIN 
    program_year_level_curricula pylc ON p.program_id = pylc.program_id
JOIN 
    curricula c ON pylc.curriculum_id = c.curriculum_id
JOIN 
    year_levels yl ON pylc.year_level = yl.year
JOIN 
    course_assignments ca ON ca.curricula_program_id = (
        SELECT cp.curricula_program_id 
        FROM curricula_program cp 
        WHERE cp.curriculum_id = pylc.curriculum_id 
          AND cp.program_id = p.program_id
    )
JOIN 
    courses co ON ca.course_id = co.course_id
JOIN 
    active_semesters ase ON ase.academic_year_id = pylc.academic_year_id 
                         AND ase.is_active = 1 
                         AND ase.semester_id = ca.semester_id
WHERE 
    p.program_code = 'BSIT'   -- change as needed!
    AND yl.year = 1           -- change as needed!
ORDER BY 
    p.program_code, yl.year, co.course_code;

