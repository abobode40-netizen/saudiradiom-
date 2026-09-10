import { GradeLevel, Subject } from "../types";
import { GRADE_1ST_SUBJECTS } from "./grade1Curriculum";
import { GRADE_2ND_SUBJECTS } from "./grade2Curriculum";
import { GRADE_3RD_SUBJECTS } from "./grade3Curriculum";

export { GRADE_1ST_SUBJECTS, GRADE_2ND_SUBJECTS, GRADE_3RD_SUBJECTS };

export const ALL_GRADE_SUBJECTS: Record<GradeLevel, Subject[]> = {
  "1st_secondary": GRADE_1ST_SUBJECTS,
  "2nd_secondary": GRADE_2ND_SUBJECTS,
  "3rd_secondary": GRADE_3RD_SUBJECTS,
};

/**
 * Returns the official subjects for the requested secondary grade according to the 2026/2027 curriculum
 */
export function getSubjectsForGrade(grade: GradeLevel): Subject[] {
  return ALL_GRADE_SUBJECTS[grade] || GRADE_1ST_SUBJECTS;
}

/**
 * Default initial subjects (1st Secondary - 2026/2027)
 */
export const INITIAL_SUBJECTS: Subject[] = GRADE_1ST_SUBJECTS;
