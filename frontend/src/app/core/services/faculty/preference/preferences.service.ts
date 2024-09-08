import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Course {
  course_id: string;  
  course_code: string;
  pre_req: string;
  co_req: string;
  course_title: string;
  lec_hours: number;
  lab_hours: number;
  units: number;
  tuition_hours: number;
}

export interface Semester {
  semester: number | string;
  courses: Course[];
}

export interface YearLevel {
  year: number;
  semesters: Semester[];
}

export interface Program {
  program_id: number; 
  name: string;
  year_levels: YearLevel[];
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private mockData: { programs: Program[] } = {
    programs: [
      {
        program_id: 1,
        name: "BSIT",
        year_levels: [
          {
            year: 1,
            semesters: [
              {
                semester: 1,
                courses: [
                  {
                    course_id: "1",  
                    course_code: "IT101",
                    pre_req: "",
                    co_req: "",
                    course_title: "Intro to Programming",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  },
                  {
                    course_id: "2",  
                    course_code: "IT102",
                    pre_req: "",
                    co_req: "",
                    course_title: "Intro to Computing",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  }
                ]
              },
              {
                semester: 2,
                courses: [
                  {
                    course_id: "3",  
                    course_code: "IT201",
                    pre_req: "IT101",
                    co_req: "",
                    course_title: "Web Development",
                    lec_hours: 2,
                    lab_hours: 2,
                    units: 3,
                    tuition_hours: 4
                  },
                  {
                    course_id: "4",  
                    course_code: "IT202",
                    pre_req: "IT102",
                    co_req: "",
                    course_title: "Data Structures & Algorithms",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  }
                ]
              },
              {
                semester: "Summer Semester",
                courses: [
                  {
                    course_id: "5",  
                    course_code: "IT203",
                    pre_req: "",
                    co_req: "",
                    course_title: "Introduction to Software Tools",
                    lec_hours: 2,
                    lab_hours: 2,
                    units: 3,
                    tuition_hours: 4
                  }
                ]
              }
            ]
          },
          {
            year: 2,
            semesters: [
              {
                semester: 1,
                courses: [
                  {
                    course_id: "6",  
                    course_code: "IT301",
                    pre_req: "IT202",
                    co_req: "",
                    course_title: "Advanced Programming",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  },
                  {
                    course_id: "7",  
                    course_code: "IT302",
                    pre_req: "",
                    co_req: "",
                    course_title: "Computer Networks",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  }
                ]
              },
              {
                semester: 2,
                courses: [
                  {
                    course_id: "8",  
                    course_code: "IT401",
                    pre_req: "IT301",
                    co_req: "",
                    course_title: "Database Systems",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  },
                  {
                    course_id: "9",  
                    course_code: "IT402",
                    pre_req: "IT302",
                    co_req: "",
                    course_title: "Operating Systems",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  }
                ]
              },
              {
                semester: "Summer Semester",
                courses: [
                  {
                    course_id: "10",  
                    course_code: "IT403",
                    pre_req: "",
                    co_req: "",
                    course_title: "Human-Computer Interaction",
                    lec_hours: 2,
                    lab_hours: 2,
                    units: 3,
                    tuition_hours: 4
                  }
                ]
              }
            ]
          },
          {
            year: 3,
            semesters: [
              {
                semester: 1,
                courses: [
                  {
                    course_id: "11",  
                    course_code: "IT501",
                    pre_req: "IT401",
                    co_req: "",
                    course_title: "Software Engineering",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  },
                  {
                    course_id: "12",  
                    course_code: "IT502",
                    pre_req: "IT402",
                    co_req: "",
                    course_title: "Mobile Application Development",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  }
                ]
              },
              {
                semester: 2,
                courses: [
                  {
                    course_id: "13",  
                    course_code: "IT601",
                    pre_req: "IT501",
                    co_req: "",
                    course_title: "Cloud Computing",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  },
                  {
                    course_id: "14",  
                    course_code: "IT602",
                    pre_req: "IT502",
                    co_req: "",
                    course_title: "Artificial Intelligence",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  }
                ]
              },
              {
                semester: "Summer Semester",
                courses: [
                  {
                    course_id: "15",  
                    course_code: "IT603",
                    pre_req: "",
                    co_req: "",
                    course_title: "Ethics in IT",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  }
                ]
              }
            ]
          },
          {
            year: 4,
            semesters: [
              {
                semester: 1,
                courses: [
                  {
                    course_id: "16",  
                    course_code: "IT701",
                    pre_req: "IT601",
                    co_req: "",
                    course_title: "Capstone Project I",
                    lec_hours: 1,
                    lab_hours: 5,
                    units: 3,
                    tuition_hours: 6
                  },
                  {
                    course_id: "17",  
                    course_code: "IT702",
                    pre_req: "IT602",
                    co_req: "",
                    course_title: "Cybersecurity",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  }
                ]
              },
              {
                semester: 2,
                courses: [
                  {
                    course_id: "18",  
                    course_code: "IT801",
                    pre_req: "IT701",
                    co_req: "",
                    course_title: "Capstone Project II",
                    lec_hours: 1,
                    lab_hours: 5,
                    units: 3,
                    tuition_hours: 6
                  },
                  {
                    course_id: "19",  
                    course_code: "IT802",
                    pre_req: "",
                    co_req: "",
                    course_title: "IT Elective",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  }
                ]
              },
              {
                semester: "Summer Semester",
                courses: [
                  {
                    course_id: "20",  
                    course_code: "IT803",
                    pre_req: "",
                    co_req: "",
                    course_title: "Professional Practice in IT",
                    lec_hours: 2,
                    lab_hours: 2,
                    units: 3,
                    tuition_hours: 4
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        program_id: 2, // Assigning a unique ID to the BSA program
        name: "BSA",
        year_levels: [
          {
            year: 1,
            semesters: [
              {
                semester: 1,
                courses: [
                  {
                    course_id: "21",
                    course_code: "AC101",
                    pre_req: "",
                    co_req: "",
                    course_title: "Intro to Accounting",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  },
                  {
                    course_id: "22",
                    course_code: "AC102",
                    pre_req: "",
                    co_req: "",
                    course_title: "Intro to Finances",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  }
                ]
              },
              {
                semester: 2,
                courses: [
                  {
                    course_id: "23",
                    course_code: "AC201",
                    pre_req: "AC101",
                    co_req: "",
                    course_title: "Principles of Management",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  },
                  {
                    course_id: "24",
                    course_code: "AC202",
                    pre_req: "AC102",
                    co_req: "",
                    course_title: "Accounting Principles",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  }
                ]
              },
              {
                semester: "Summer Semester",
                courses: [
                  {
                    course_id: "25",
                    course_code: "AC203",
                    pre_req: "",
                    co_req: "",
                    course_title: "Introduction to Business",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  }
                ]
              }
            ]
          },
          {
            year: 2,
            semesters: [
              {
                semester: 1,
                courses: [
                  {
                    course_id: "26",
                    course_code: "AC301",
                    pre_req: "AC202",
                    co_req: "",
                    course_title: "Intermediate Accounting I",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  },
                  {
                    course_id: "27",
                    course_code: "AC302",
                    pre_req: "",
                    co_req: "",
                    course_title: "Business Law",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  }
                ]
              },
              {
                semester: 2,
                courses: [
                  {
                    course_id: "28",
                    course_code: "AC401",
                    pre_req: "AC301",
                    co_req: "",
                    course_title: "Intermediate Accounting II",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  },
                  {
                    course_id: "29",
                    course_code: "AC402",
                    pre_req: "AC302",
                    co_req: "",
                    course_title: "Taxation",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  }
                ]
              },
              {
                semester: "Summer Semester",
                courses: [
                  {
                    course_id: "30",
                    course_code: "AC403",
                    pre_req: "",
                    co_req: "",
                    course_title: "Business Ethics",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  }
                ]
              }
            ]
          },
          {
            year: 3,
            semesters: [
              {
                semester: 1,
                courses: [
                  {
                    course_id: "31",
                    course_code: "AC501",
                    pre_req: "AC401",
                    co_req: "",
                    course_title: "Cost Accounting",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  },
                  {
                    course_id: "32",
                    course_code: "AC502",
                    pre_req: "",
                    co_req: "",
                    course_title: "Financial Management",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  }
                ]
              },
              {
                semester: 2,
                courses: [
                  {
                    course_id: "33",
                    course_code: "AC601",
                    pre_req: "AC501",
                    co_req: "",
                    course_title: "Auditing",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  },
                  {
                    course_id: "34",
                    course_code: "AC602",
                    pre_req: "",
                    co_req: "",
                    course_title: "Strategic Management",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  }
                ]
              },
              {
                semester: "Summer Semester",
                courses: [
                  {
                    course_id: "35",
                    course_code: "AC603",
                    pre_req: "",
                    co_req: "",
                    course_title: "International Business",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  }
                ]
              }
            ]
          },
          {
            year: 4,
            semesters: [
              {
                semester: 1,
                courses: [
                  {
                    course_id: "36",
                    course_code: "AC701",
                    pre_req: "AC601",
                    co_req: "",
                    course_title: "Capstone Project I",
                    lec_hours: 1,
                    lab_hours: 5,
                    units: 3,
                    tuition_hours: 6
                  },
                  {
                    course_id: "37",
                    course_code: "AC702",
                    pre_req: "",
                    co_req: "",
                    course_title: "Advanced Financial Accounting",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  }
                ]
              },
              {
                semester: 2,
                courses: [
                  {
                    course_id: "38",
                    course_code: "AC801",
                    pre_req: "AC701",
                    co_req: "",
                    course_title: "Capstone Project II",
                    lec_hours: 1,
                    lab_hours: 5,
                    units: 3,
                    tuition_hours: 6
                  },
                  {
                    course_id: "39",
                    course_code: "AC802",
                    pre_req: "",
                    co_req: "",
                    course_title: "Business Analytics",
                    lec_hours: 3,
                    lab_hours: 1,
                    units: 3,
                    tuition_hours: 4
                  }
                ]
              },
              {
                semester: "Summer Semester",
                courses: [
                  {
                    course_id: "40",
                    course_code: "AC803",
                    pre_req: "",
                    co_req: "",
                    course_title: "Corporate Governance",
                    lec_hours: 3,
                    lab_hours: 0,
                    units: 3,
                    tuition_hours: 3
                  }
                ]
              }
            ]
          }
        ]
      }      
    ]
  };

  getPrograms(): Observable<Program[]> {
    return of(this.mockData.programs);
  }

  getCourses(programName: string, year: number, semester: number | string): Observable<Course[]> {
    const program = this.mockData.programs.find(p => p.name === programName);
    if (program) {
      const yearLevel = program.year_levels.find(y => y.year === year);
      if (yearLevel) {
        const sem = yearLevel.semesters.find(s => s.semester === semester);
        if (sem) {
          return of(sem.courses);
        }
      }
    }
    return of([]);
  }

  // Implement the submitPreferences method
  submitPreferences(preferences: any): Observable<any> {
    console.log('Submitting preferences:', preferences);
    // For now, we're just logging the preferences. You can modify this to handle actual submission to a backend
    return of({ success: true });
  }
}
