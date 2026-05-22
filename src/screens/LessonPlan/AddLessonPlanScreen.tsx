import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowDown2, DocumentUpload } from 'iconsax-react-nativejs';
import { useEffect, useState } from 'react';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { Screen } from '../../components/ui/Screen';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';

type DropdownOption = {
  id: string;
  label: string;
};

function Dropdown({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(opt => opt.id === value)?.label || label;

  return (
    <View style={styles.dropdownContainer}>
      <Pressable
        style={styles.dropdownButton}
        onPress={() => setOpen(!open)}
      >
        <Text style={styles.dropdownButtonText}>{selectedLabel}</Text>
        <ArrowDown2 size={16} color={colors.neutral[500]} />
      </Pressable>

      {open && (
        <View style={styles.dropdownMenu}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.dropdownOption}
              onPress={() => {
                onSelect(option.id);
                setOpen(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  value === option.id && styles.dropdownOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export function AddLessonPlanScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'student') {
      router.replace('/lesson-plan');
    }
  }, [user, router]);

  // Form state
  const [selectedClass, setSelectedClass] = useState('class5');
  const [selectedSection, setSelectedSection] = useState('sectiona');
  const [selectedSubject, setSelectedSubject] = useState('mathematics');
  const [chapterName, setChapterName] = useState('');
  const [topicName, setTopicName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Dropdown options
  const classes: DropdownOption[] = [
    { id: 'class5', label: 'Class 5' },
    { id: 'class6', label: 'Class 6' },
    { id: 'class7', label: 'Class 7' },
  ];

  const sections: DropdownOption[] = [
    { id: 'sectiona', label: 'Section A' },
    { id: 'sectionb', label: 'Section B' },
  ];

  const subjects: DropdownOption[] = [
    { id: 'mathematics', label: 'Mathematics' },
    { id: 'english', label: 'English' },
    { id: 'science', label: 'Science' },
  ];

  const assessmentTypes: DropdownOption[] = [
    { id: 'quiz', label: 'Quiz' },
    { id: 'assignment', label: 'Assignment' },
    { id: 'test', label: 'Test' },
    { id: 'project', label: 'Project' },
  ];

  const handleSaveLesson = () => {
    // TODO: Implement save logic
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const handleUploadFile = () => {
    // TODO: Implement file picker
    setUploadedFiles([...uploadedFiles, 'document.pdf']);
  };

  return (
    <Screen>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.muted} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <ScreenHeader title="Add Lesson Plan" onBack={handleBack} />

        {/* Content */}
        <View style={styles.content}>
          {/* Class and Section Row */}
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <Text style={styles.sectionLabel}>Select Class</Text>
              <Dropdown
                label="Class"
                value={selectedClass}
                options={classes}
                onSelect={setSelectedClass}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.sectionLabel}>Select Section</Text>
              <Dropdown
                label="Section"
                value={selectedSection}
                options={sections}
                onSelect={setSelectedSection}
              />
            </View>
          </View>

          {/* Subject */}
          <Text style={styles.sectionLabel}>Select Subject</Text>
          <Dropdown
            label="Subject"
            value={selectedSubject}
            options={subjects}
            onSelect={setSelectedSubject}
          />

          {/* Chapter Name */}
          <Text style={styles.sectionLabel}>Chapter Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter chapter name"
            placeholderTextColor={colors.neutral[400]}
            value={chapterName}
            onChangeText={setChapterName}
          />

          {/* Topic Name */}
          <Text style={styles.sectionLabel}>Topic Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter topic name"
            placeholderTextColor={colors.neutral[400]}
            value={topicName}
            onChangeText={setTopicName}
          />

          {/* Date Range Row */}
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <Text style={styles.sectionLabel}>Select Date</Text>
              <Dropdown
                label="Start Date"
                value={startDate}
                options={[
                  { id: '2026-09-01', label: '2026-09-01' },
                  { id: '2026-09-15', label: '2026-09-15' },
                ]}
                onSelect={setStartDate}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.sectionLabel}>Select Date</Text>
              <Dropdown
                label="End Date"
                value={endDate}
                options={[
                  { id: '2026-09-15', label: '2026-09-15' },
                  { id: '2026-10-01', label: '2026-10-01' },
                ]}
                onSelect={setEndDate}
              />
            </View>
          </View>

          {/* Learning Objectives */}
          <Text style={styles.sectionLabel}>Learning Objectives</Text>
          <TextInput
            style={[styles.textInput, styles.textAreaInput]}
            placeholder="Type your message here"
            placeholderTextColor={colors.neutral[400]}
            value={learningObjectives}
            onChangeText={setLearningObjectives}
            multiline
            numberOfLines={4}
          />

          {/* Assessment Type */}
          <Text style={styles.sectionLabel}>Select Assessment</Text>
          <Dropdown
            label="Assessment Type"
            value={selectedAssessment}
            options={assessmentTypes}
            onSelect={setSelectedAssessment}
          />

          {/* File Upload */}
          <Text style={styles.sectionLabel}>Upload File</Text>
          <Card className="mb-4">
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={handleUploadFile}
              activeOpacity={0.7}
            >
              <DocumentUpload size={40} color={colors.primary[300]} />
              <Text style={styles.uploadText}>Tap to Upload file</Text>
              <Text style={styles.uploadSubtext}>Pdf, Image</Text>
            </TouchableOpacity>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <View style={styles.uploadedFilesContainer}>
              <Text style={styles.sectionLabel}>Uploaded Files</Text>
              {uploadedFiles.map((file, index) => (
                <View key={index} style={styles.uploadedFileItem}>
                  <Text style={styles.uploadedFileName}>{file}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
                    }}
                  >
                    <Text style={styles.removeFileButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveLesson}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Lesson</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 8,
    marginTop: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    zIndex: 100,
  },
  halfWidth: {
    flex: 1,
  },

  // ─── Dropdown Styles ───
  dropdownContainer: {
    marginBottom: 12,
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
  },
  dropdownButtonText: {
    fontSize: 14,
    color: colors.neutral[700],
    flex: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 10000,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  dropdownOptionText: {
    fontSize: 14,
    color: colors.neutral[700],
  },
  dropdownOptionTextSelected: {
    fontWeight: '600',
    color: colors.primary[300],
  },

  // ─── Text Input ───
  textInput: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[100],
    marginBottom: 12,
  },
  textAreaInput: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // ─── Upload Box ───
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary[300],
    borderRadius: 12,
    backgroundColor: 'rgba(20, 79, 204, 0.05)',
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[300],
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 4,
  },

  // ─── Uploaded Files ───
  uploadedFilesContainer: {
    marginBottom: 16,
  },
  uploadedFileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
    marginBottom: 8,
  },
  uploadedFileName: {
    fontSize: 14,
    color: colors.neutral[900],
    flex: 1,
  },
  removeFileButton: {
    fontSize: 18,
    color: colors.secondary[300],
    fontWeight: '300',
  },

  // ─── Save Button ───
  saveButton: {
    backgroundColor: colors.primary[300],
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[100],
  },
});
