import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  getEmployeeProfile,
  updateEmployeeProfile,
  getStudentProfile,
  updateStudentProfile,
} from '../../services/profileService';

export function useEditProfileVM() {
  const { user } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (user.role === 'student') {
          const data = await getStudentProfile(user.id);
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setEmail(data.personal_details?.email || '');
          setPhone(data.personal_details?.primary_contact || '');
          setDob(data.date_of_birth ? data.date_of_birth.split('T')[0] : '');
          setGender(data.gender || '');
          setBloodGroup(data.blood_group || '');
          setAddress(data.personal_details?.address || '');
          setEmployeeCode(data.academic_info?.roll_no || '');
        } else {
          const data = await getEmployeeProfile(user.id);
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setEmail(data.email || '');
          setPhone(data.mobile_number || '');
          setDob(data.date_of_birth ? data.date_of_birth.split('T')[0] : '');
          setGender(data.gender || '');
          setBloodGroup(data.blood_group || '');
          setAddress(data.personal_details?.address || '');
          setEmployeeCode(data.work_details?.employee_code || '');
        }
      } catch (error) {
        console.error('[EditProfile] Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  async function onSave() {
    if (!user) return;
    setSaving(true);
    try {
      if (user.role === 'student') {
        await updateStudentProfile(user.id, {
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob || undefined,
          gender: gender || undefined,
          blood_group: bloodGroup || undefined,
          address: address || undefined,
          email: email || undefined,
          primary_contact: phone || undefined,
          roll_no: employeeCode || undefined,
          modified_by: user.id,
        });
      } else {
        await updateEmployeeProfile(user.id, {
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob || undefined,
          gender: gender || undefined,
          blood_group: bloodGroup || undefined,
          mobile_number: phone || undefined,
          email: email || undefined,
          address: address || undefined,
          employee_code: employeeCode || undefined,
          modified_by: user.id,
        });
      }

      Alert.alert('Success', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.message || 'Failed to update profile';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  }

  return {
    firstName,
    lastName,
    employeeCode,
    email,
    phone,
    dob,
    gender,
    bloodGroup,
    address,
    setFirstName,
    setLastName,
    setEmployeeCode,
    setEmail,
    setPhone,
    setDob,
    setGender,
    setBloodGroup,
    setAddress,
    onSave,
    loading,
    saving,
    isStudent: user?.role === 'student',
  };
}
