import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DocumentUpload } from 'iconsax-react-nativejs';
import { useEffect, useMemo, useState } from 'react';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { Screen } from '../../components/ui/Screen';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ModalDropdown } from '../../components/ui/ModalDropdown';
import { DatePickerField } from '../../components/ui/DatePickerField';
import {
  getAssignedSubjects,
  createLesson,
  type AssignedClass,
} from '../../services/lessonPlanService';

type DropdownOption = { id: string; label: string };

export function AddLessonPlanScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [topicName, setTopicName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoadingData(true);
      try {
        const data = await getAssignedSubjects(user.id, user.id);
        setAssignedClasses(data.classes ?? []);
        if (data.classes?.length > 0) setSelectedClass(data.classes[0].class_id);
      } catch (err) {
        console.error('[AddLesson] Failed to fetch subjects:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetch();
  }, [user]);

  const classes: DropdownOption[] = useMemo(() => assignedClasses.map((c) => ({ id: c.class_id, label: c.class_name })), [assignedClasses]);
  const sections: DropdownOption[] = useMemo(() => {
    const cls = assignedClasses.find((c) => c.class_id === selectedClass);
    return (cls?.sections ?? []).map((s) => ({ id: s.section_id, label: s.section_name }));
  }, [assignedClasses, selectedClass]);
  const subjects: DropdownOption[] = useMemo(() => {
    const cls = assignedClasses.find((c) => c.class_id === selectedClass);
    const sec = cls?.sections.find((s) => s.section_id === selectedSection);
    return (sec?.subjects ?? []).map((s) => ({ id: s.subject_id, label: s.subject_name }));
  }, [assignedClasses, selectedClass, selectedSection]);

  useEffect(() => { if (sections.length > 0 && !sections.find((s) => s.id === selectedSection)) setSelectedSection(sections[0].id); }, [sections]);
  useEffect(() => { if (subjects.length > 0 && !subjects.find((s) => s.id === selectedSubject)) setSelectedSubject(subjects[0].id); }, [subjects]);

  const assessmentTypes: DropdownOption[] = [
    { id: 'Quiz', label: 'Quiz' },
    { id: 'Assignment', label: 'Assignment' },
    { id: 'Written Test', label: 'Written Test' },
    { id: 'Project', label: 'Project' },
    { id: 'Oral', label: 'Oral' },
  ];

  const handleSaveLesson = async () => {
    if (!selectedClass || !selectedSection || !selectedSubject) { Alert.alert('Error', 'Please select class, section, and subject'); return; }
    setSaving(true);
    try {
      await createLesson({
        classId: selectedClass,
        sectionId: selectedSection,
        subjectId: selectedSubject,
        chapterName: chapterName || undefined,
        topicName: topicName || undefined,
        startDate: startDate ? `${startDate}T00:00:00` : undefined,
        endDate: endDate ? `${endDate}T00:00:00` : undefined,
        learningObjectives: learningObjectives || undefined,
        status: 'not_started',
        assessmentType: selectedAssessment || undefined,
      });
      Alert.alert('Success', 'Lesson plan created successfully', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.detail || 'Failed to create lesson plan');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <Screen>
        <ScreenHeader title="Add Lesson Plan" onBack={() => router.back()} />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary[300]} /></View>
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.muted} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Add Lesson Plan" onBack={() => router.back()} />
          <View style={styles.content}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Select Class</Text>
                <ModalDropdown label="Select Class" value={selectedClass} options={classes} onSelect={setSelectedClass} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Select Section</Text>
                <ModalDropdown label="Select Section" value={selectedSection} options={sections} onSelect={setSelectedSection} />
              </View>
            </View>

            <Text style={styles.label}>Select Subject</Text>
            <ModalDropdown label="Select Subject" value={selectedSubject} options={subjects} onSelect={setSelectedSubject} />

            <Text style={styles.label}>Chapter Name</Text>
            <TextInput style={styles.input} placeholder="Enter chapter name" placeholderTextColor={colors.neutral[400]} value={chapterName} onChangeText={setChapterName} />

            <Text style={styles.label}>Topic Name</Text>
            <TextInput style={styles.input} placeholder="Enter topic name" placeholderTextColor={colors.neutral[400]} value={topicName} onChangeText={setTopicName} />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Start Date</Text>
                <DatePickerField value={startDate} onChange={setStartDate} placeholder="Start date" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>End Date</Text>
                <DatePickerField value={endDate} onChange={setEndDate} placeholder="End date" />
              </View>
            </View>

            <Text style={styles.label}>Learning Objectives</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Enter learning objectives" placeholderTextColor={colors.neutral[400]} value={learningObjectives} onChangeText={setLearningObjectives} multiline numberOfLines={4} />

            <Text style={styles.label}>Assessment Type</Text>
            <ModalDropdown label="Select Assessment" value={selectedAssessment} options={assessmentTypes} onSelect={setSelectedAssessment} />

            <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSaveLesson} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save Lesson Plan</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: colors.neutral[900], marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: colors.neutral[200], borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: colors.neutral[900], backgroundColor: colors.neutral[100], marginBottom: 12 },
  textArea: { textAlignVertical: 'top', paddingTop: 12, minHeight: 100 },
  saveBtn: { backgroundColor: colors.primary[300], paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: colors.neutral[100] },
});
