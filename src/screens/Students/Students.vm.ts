import { useMemo, useState } from 'react';

export type StudentStatus = 'present' | 'absent';

export type Student = {
  id: string;
  name: string;
  roll: string;
  className: string;
  status: StudentStatus;
  bloodGroup: string;
  dob: string;
  email: string;
  parentName: string;
  phone: string;
  joined: string;
};

const CLASSES = ['Class 5-A', 'Class 5-B', 'Class 5-C', 'Class 5-D'];

export const STUDENTS: Student[] = [
  { id: 's01', name: 'Ethan Patel', roll: '05', className: 'Class 5-A', status: 'present', bloodGroup: 'B+', dob: '11/03/2008', email: 'ethan.patel@school.edu.in', parentName: 'Amara Singh', phone: '+91 98525 66645', joined: '12 Aug 2022' },
  { id: 's02', name: 'Sofia Chen', roll: '06', className: 'Class 5-A', status: 'absent', bloodGroup: 'A+', dob: '08/07/2008', email: 'sofia.chen@school.edu.in', parentName: 'Jayden Lee', phone: '+91 98764 12345', joined: '07 Jul 2021' },
  { id: 's03', name: 'Liam Johnson', roll: '07', className: 'Class 5-A', status: 'present', bloodGroup: 'O+', dob: '20/09/2008', email: 'liam.johnson@school.edu.in', parentName: 'Maya Sharma', phone: '+91 98123 45678', joined: '13 Sep 2021' },
  { id: 's04', name: 'Amara Singh', roll: '08', className: 'Class 5-A', status: 'present', bloodGroup: 'AB+', dob: '15/02/2008', email: 'amara.singh@school.edu.in', parentName: 'Rohan Singh', phone: '+91 98234 56789', joined: '05 Mar 2022' },
  { id: 's05', name: 'Jayden Lee', roll: '09', className: 'Class 5-A', status: 'absent', bloodGroup: 'B+', dob: '02/01/2008', email: 'jayden.lee@school.edu.in', parentName: 'Sneha Gupta', phone: '+91 98321 76543', joined: '21 Jun 2022' },
  { id: 's06', name: 'Isabella Garcia', roll: '10', className: 'Class 5-A', status: 'present', bloodGroup: 'O-', dob: '30/04/2008', email: 'isabella.garcia@school.edu.in', parentName: 'Nina Patel', phone: '+91 98456 12345', joined: '19 Nov 2021' },
  { id: 's07', name: 'Mason White', roll: '11', className: 'Class 5-A', status: 'present', bloodGroup: 'A-', dob: '18/05/2008', email: 'mason.white@school.edu.in', parentName: 'Karan Mehta', phone: '+91 98654 32109', joined: '03 Oct 2021' },
  { id: 's08', name: 'Ava Kumar', roll: '12', className: 'Class 5-A', status: 'absent', bloodGroup: 'B-', dob: '09/12/2008', email: 'ava.kumar@school.edu.in', parentName: 'Anjali Rao', phone: '+91 98745 32108', joined: '14 Feb 2022' },
];

export function useStudentsVM() {
  const [activeClass, setActiveClass] = useState(CLASSES[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const classStudents = useMemo(
    () => STUDENTS.filter((student) => student.className === activeClass),
    [activeClass],
  );

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return classStudents;
    return classStudents.filter((student) =>
      student.name.toLowerCase().includes(query) ||
      student.roll.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query),
    );
  }, [classStudents, searchQuery]);

  const totalCount = filteredStudents.length;
  const presentCount = filteredStudents.filter((student) => student.status === 'present').length;
  const absentCount = filteredStudents.filter((student) => student.status === 'absent').length;

  return {
    classes: CLASSES,
    activeClass,
    setActiveClass,
    searchQuery,
    setSearchQuery,
    filteredStudents,
    totalCount,
    presentCount,
    absentCount,
  };
}
