import { useMemo } from 'react';

export type ProfileInfo = {
  label: string;
  value: string;
};

export type ProfileSummary = {
  name: string;
  role: string;
  experience: string;
  classTeacher: string;
  personalInfo: ProfileInfo[];
};

export type SettingItem = {
  id: string;
  title: string;
  subtitle: string;
  route?: string;
};

export function useMyProfileVM() {
  const profile = useMemo<ProfileSummary>(
    () => ({
      name: 'Kiran',
      role: 'Maths Teacher',
      experience: '8',
      classTeacher: '3',
      personalInfo: [
        { label: 'Employee ID', value: 'EMP-2049' },
        { label: 'Email Address', value: 'Kiran.s@school.edu.in' },
        { label: 'Phone Number', value: '+91 98525 66645' },
        { label: 'Date of Joining', value: '12 Aug 2022' },
      ],
    }),
    [],
  );

  const settings = useMemo<SettingItem[]>(
    () => [
      {
        id: 'edit',
        title: 'Edit Personal Details',
        subtitle: 'Update your profile information',
        route: '/edit-profile',
      },
      {
        id: 'password',
        title: 'Change Password',
        subtitle: 'Update your login password',
        route: '/change-password',
      },
      {
        id: 'notifications',
        title: 'Notification Preferences',
        subtitle: 'Manage app notifications',
      },
      {
        id: 'help',
        title: 'Help & Support',
        subtitle: 'Get assistance and FAQs',
      },
      {
        id: 'policies',
        title: 'Team & policies',
        subtitle: 'Read school policies',
      },
    ],
    [],
  );

  return { profile, settings };
}
