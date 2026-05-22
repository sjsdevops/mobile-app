import { useState } from 'react';
import { Alert } from 'react-native';

export function useEditProfileVM() {
  const [firstName, setFirstName] = useState('Kiran');
  const [lastName, setLastName] = useState('Kiran');
  const [employeeId, setEmployeeId] = useState('EMP-24-200');
  const [email, setEmail] = useState('Kiran.s@school.edu.in');
  const [phone, setPhone] = useState('+91 98764 12345');
  const [dob, setDob] = useState('15 March 1990');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('Type your message here');

  function onSave() {
    Alert.alert('Saved', 'Your profile details have been updated.');
  }

  return {
    firstName,
    lastName,
    employeeId,
    email,
    phone,
    dob,
    gender,
    address,
    setFirstName,
    setLastName,
    setEmployeeId,
    setEmail,
    setPhone,
    setDob,
    setGender,
    setAddress,
    onSave,
  };
}
