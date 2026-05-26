import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import { useState, useCallback } from 'react';
import { colors } from '../../theme/colors';
import { Screen } from '../../components/ui/Screen';
import { ScreenHeader, CircleIconBtn } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StateMessage } from '../../components/ui/StateMessage';
import { ModalDropdown } from '../../components/ui/ModalDropdown';
import { useLessonPlanVM, type Chapter, type FilterTab } from './LessonPlanScreen.vm';
import { useAuth } from '../../contexts/AuthContext';

const FILTER_TABS: Array<{ id: FilterTab; label: string }> = [
  { id: 'all', label: 'All Lessons' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
];

// ─── Filter Chips Component ────────────────────────────────────────────────────

function FilterChips({
  active,
  onChange,
}: {
  active: FilterTab;
  onChange: (f: FilterTab) => void;
}) {
  return (
    <View style={sStyles.filterWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={sStyles.filterRow}
      >
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[sStyles.chip, active === tab.id && sStyles.chipActive]}
            onPress={() => onChange(tab.id)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                sStyles.chipText,
                active === tab.id && sStyles.chipTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Dropdown Component ────────────────────────────────────────────────────────

// ─── Chapter Card ──────────────────────────────────────────────────────────────

type ChapterCardProps = {
  chapter: Chapter;
  onViewDetails: (chapter: Chapter) => void;
};

function ChapterCard({ chapter, onViewDetails }: ChapterCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.green[200];
      case 'inprogress':
        return colors.yellow[200];
      case 'notstarted':
        return colors.secondary[300];
      default:
        return colors.neutral[500];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'inprogress':
        return 'Inprogress';
      case 'notstarted':
        return 'Not Started';
      default:
        return status;
    }
  };

  return (
    <Card className="mb-4">
      <View style={sStyles.chapterContent}>
        <View style={sStyles.chapterHeader}>
          <Text style={sStyles.chapterNumber}>
            {chapter.name.split(' ')[0]}. {chapter.name.split(' ').slice(1).join(' ')}
          </Text>
          <Badge
            label={getStatusLabel(chapter.status)}
            variant={
              chapter.status === 'completed'
                ? 'green'
                : chapter.status === 'inprogress'
                  ? 'blue'
                  : 'gray'
            }
          />
        </View>

        <Text style={sStyles.chapterDates}>{chapter.startDate}</Text>

        <View style={sStyles.chapterStats}>
          <View style={sStyles.statItem}>
            <Text style={sStyles.statLabel}>{chapter.completionPercentage}% Completed</Text>
          </View>
          <TouchableOpacity
            onPress={() => onViewDetails(chapter)}
            activeOpacity={0.7}
          >
            <Text style={sStyles.viewDetailsLink}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

// ─── Subject Progress Card ─────────────────────────────────────────────────────

type SubjectProgressCardProps = {
  name: string;
  completed: number;
  pending: number;
  syllabusPercentage: number;
};

function SubjectProgressCard({
  name,
  completed,
  pending,
  syllabusPercentage,
}: SubjectProgressCardProps) {
  return (
    <View style={sStyles.subjectCard}>
      <Text style={sStyles.subjectName}>{name}</Text>

      {/* Stats Row */}
      <View style={sStyles.statsRow}>
        <View style={sStyles.statItemInline}>
          <Text style={sStyles.statValue}>{completed}</Text>
          <Text style={sStyles.statLabelSmall}>Completed</Text>
        </View>
        <View style={sStyles.statItemInline}>
          <Text style={[sStyles.statValue, { color: colors.yellow[200] }]}>{pending}</Text>
          <Text style={sStyles.statLabelSmall}>Pending</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={sStyles.progressSection}>
        <Text style={sStyles.progressLabel}>Syllabus Coverage</Text>
        <View style={sStyles.progressBar}>
          <View
            style={[
              sStyles.progressFill,
              { width: `${syllabusPercentage}%` },
            ]}
          />
        </View>
        <Text style={sStyles.progressPercentage}>{syllabusPercentage}%</Text>
      </View>
    </View>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function LessonPlanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const vm = useLessonPlanVM();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Refresh lessons when screen comes into focus (e.g., after adding a lesson)
  useFocusEffect(
    useCallback(() => {
      vm.refreshLessons();
    }, [vm.refreshLessons])
  );

  const handleViewDetails = (chapter: Chapter) => {
    setSelectedChapter(chapter);
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddLesson = () => {
    router.push('/add-lesson-plan');
  };

  return (
    <Screen>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.muted} />
      <ScrollView
        contentContainerStyle={sStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ScreenHeader
          title="Lesson Plan"
          onBack={handleBack}
        />

        {/* Content */}
        <View style={sStyles.content}>
          {/* Academic Year - hidden for students */}
          {!isStudent && (
            <>
              <Text style={sStyles.sectionLabel}>Academic Year</Text>
              <ModalDropdown
                label="Select Academic Year"
                value={vm.academicYear}
                options={vm.academicYearOptions}
                onSelect={vm.setAcademicYear}
              />
            </>
          )}

          {/* Class and Section Row - hidden for students */}
          {!isStudent && (
            <View style={sStyles.rowContainer}>
              <View style={sStyles.halfWidth}>
                <Text style={sStyles.sectionLabel}>Select Class</Text>
                <ModalDropdown
                  label="Class"
                  value={vm.selectedClass}
                  options={vm.classes}
                  onSelect={vm.setSelectedClass}
                />
              </View>
              <View style={sStyles.halfWidth}>
                <Text style={sStyles.sectionLabel}>Select Section</Text>
                <ModalDropdown
                  label="Section"
                  value={vm.selectedSection}
                  options={vm.sections}
                  onSelect={vm.setSelectedSection}
                />
              </View>
            </View>
          )}

          {/* Subject */}
          <Text style={sStyles.sectionLabel}>Select Subject</Text>
          <ModalDropdown
            label="Subject"
            value={vm.selectedSubject}
            options={vm.subjects}
            onSelect={vm.setSelectedSubject}
          />

          {/* Subject Progress or Empty State */}
          {vm.loading ? (
            <View style={sStyles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[300]} />
            </View>
          ) : vm.hasData && vm.subjectProgress ? (
            <View style={sStyles.contentSection}>
              {/* Subject Progress Card */}
              <SubjectProgressCard
                name={vm.subjectProgress.name}
                completed={vm.subjectProgress.completedLessons}
                pending={vm.subjectProgress.pendingLessons}
                syllabusPercentage={vm.subjectProgress.syllabusPercentage}
              />

              {/* Filter Tabs */}
              <FilterChips active={vm.filterTab} onChange={vm.setFilterTab} />

              {/* Chapters List */}
              <View style={sStyles.chaptersSection}>
                <Text style={sStyles.chaptersTitle}>Chapters</Text>
                {vm.getFilteredChapters().length > 0 ? (
                  vm.getFilteredChapters().map((chapter) => (
                    <ChapterCard
                      key={chapter.id}
                      chapter={chapter}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                ) : (
                  <StateMessage message={`No ${vm.filterTab !== 'all' ? vm.filterTab : ''} lessons found`} />
                )}
              </View>

              {/* Add Lesson Button */}
              {!isStudent && vm.canAddLesson && (
                <TouchableOpacity
                  style={sStyles.addButton}
                  onPress={handleAddLesson}
                  activeOpacity={0.8}
                >
                  <Text style={sStyles.addButtonIcon}>+</Text>
                  <Text style={sStyles.addButtonText}>Add Lesson Plan</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={sStyles.emptyStateContainer}>
              <View style={sStyles.emptyIcon}>
                {/* Empty folder icon placeholder */}
                <Text style={sStyles.emptyIconText}>📁</Text>
              </View>
              <Text style={sStyles.emptyTitle}>No Lesson Plans Added You</Text>
              <Text style={sStyles.emptySubtitle}>
                Start by creating a structured lesson plan for your class to track progress effectively
              </Text>
              {!isStudent && vm.canAddLesson && (
                <TouchableOpacity
                  style={sStyles.addButton}
                  onPress={handleAddLesson}
                  activeOpacity={0.8}
                >
                  <Text style={sStyles.addButtonText}>Add Lesson Plan</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {vm.error && (
            <StateMessage message={vm.error} />
          )}
        </View>
      </ScrollView>

      {/* Chapter Details Modal */}
      {selectedChapter && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedChapter(null)}
        >
          <View style={sStyles.modalOverlay}>
            <View style={sStyles.modalContent}>
              <View style={sStyles.modalHeader}>
                <Text style={sStyles.modalTitle}>{selectedChapter.name}</Text>
                <TouchableOpacity onPress={() => setSelectedChapter(null)}>
                  <Text style={sStyles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={sStyles.modalBody}>
                <Text style={sStyles.modalLabel}>Date Range</Text>
                <Text style={sStyles.modalValue}>{selectedChapter.startDate}</Text>
                <Text style={[sStyles.modalLabel, { marginTop: 16 }]}>
                  Completion
                </Text>
                <Text style={sStyles.modalValue}>{selectedChapter.completionPercentage}%</Text>
                <Text style={[sStyles.modalLabel, { marginTop: 16 }]}>
                  Status
                </Text>
                <Text style={sStyles.modalValue}>
                  {selectedChapter.status === 'completed'
                    ? 'Completed'
                    : selectedChapter.status === 'inprogress'
                      ? 'In Progress'
                      : 'Not Started'}
                </Text>
              </View>
              <TouchableOpacity
                style={sStyles.modalCloseButton}
                onPress={() => setSelectedChapter(null)}
              >
                <Text style={sStyles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
              {vm.canApprove && selectedChapter.status !== 'completed' && (
                <TouchableOpacity
                  style={[sStyles.modalCloseButton, { backgroundColor: colors.green[200], marginTop: 10 }]}
                  onPress={() => {
                    vm.approveLesson(selectedChapter.id);
                    setSelectedChapter(null);
                  }}
                >
                  <Text style={sStyles.modalCloseButtonText}>Approve Lesson</Text>
                </TouchableOpacity>
              )}
              {vm.canComplete && selectedChapter.status !== 'completed' && (
                <TouchableOpacity
                  style={[sStyles.modalCloseButton, { backgroundColor: colors.green[200], marginTop: 10 }]}
                  onPress={() => {
                    vm.completeLesson(selectedChapter.id);
                    setSelectedChapter(null);
                  }}
                >
                  <Text style={sStyles.modalCloseButtonText}>Complete Lesson</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </Screen>
  );
}

const sStyles = StyleSheet.create({
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

  // ─── Subject Progress Card ───
  subjectCard: {
    backgroundColor: colors.primary[300],
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  subjectName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[100],
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statItemInline: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.neutral[100],
  },
  statLabelSmall: {
    fontSize: 12,
    color: colors.neutral[100],
    marginTop: 4,
  },
  progressSection: {
    marginTop: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.neutral[100],
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.neutral[100],
    borderRadius: 3,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[100],
    textAlign: 'right',
  },

  // ─── Filter Chips ───
  filterWrap: {
    height: 60,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'flex-start',
  },
  chip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary[300],
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  chipTextActive: {
    color: colors.neutral[100],
  },

  // ─── Chapter Card ───
  chapterContent: {
    gap: 8,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  chapterNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    flex: 1,
  },
  chapterDates: {
    fontSize: 13,
    color: colors.neutral[500],
  },
  chapterStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: colors.neutral[600],
  },
  viewDetailsLink: {
    fontSize: 13,
    color: colors.primary[300],
    fontWeight: '600',
  },

  // ─── Chapters Section ───
  contentSection: {
    marginTop: 0,
  },
  chaptersSection: {
    marginBottom: 16,
  },
  chaptersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 12,
  },

  // ─── Add Button ───
  addButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary[300],
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 16,
  },
  addButtonIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[100],
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[100],
  },

  // ─── Empty State ───
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyStateContainer: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  // ─── Modal ───
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.neutral[100],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
    flex: 1,
  },
  modalClose: {
    fontSize: 24,
    color: colors.neutral[500],
    fontWeight: '300',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[600],
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 14,
    color: colors.neutral[900],
    fontWeight: '500',
  },
  modalCloseButton: {
    backgroundColor: colors.primary[300],
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[100],
  },
});
