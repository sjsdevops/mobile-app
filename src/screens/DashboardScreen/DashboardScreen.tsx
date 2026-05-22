import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  HamburgerMenu,
  Notification1,
  Calendar1,
  Book1,
  ClipboardTick,
  NoteText,
  TaskSquare,
  Teacher,
  Timer1,
  EmptyWallet,
  BrifecaseTimer,
  People,
} from 'iconsax-react-nativejs';
import type { FC } from 'react';
import type { IconProps } from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';
import { useDashboardVM } from './DashboardScreen.vm';

type IconComponent = FC<IconProps>;

// ─── Timetable Data ───────────────────────────────────────────────────────────

type Period = {
  id: string;
  startTime: string; // "08:00"
  endTime: string;
  subject: string;
  className: string;
  isBreak?: boolean;
  breakLabel?: string;
};

const STUDENT_ROUTINE: Record<string, Period[]> = {
  mon: [
    { id: '1', startTime: '08:00', endTime: '08:45', subject: 'Physics', className: 'Class 8-B' },
    { id: '2', startTime: '09:00', endTime: '09:45', subject: 'Mathematics', className: 'Class 8-B' },
    { id: 'b1', startTime: '09:45', endTime: '10:15', subject: '', className: '', isBreak: true, breakLabel: 'Morning Break' },
    { id: '3', startTime: '10:15', endTime: '11:00', subject: 'Chemistry', className: 'Class 8-B' },
    { id: '4', startTime: '11:00', endTime: '11:45', subject: 'English', className: 'Class 8-B' },
    { id: '5', startTime: '11:45', endTime: '12:30', subject: 'Social', className: 'Class 8-B' },
  ],
  tue: [
    { id: '1', startTime: '08:00', endTime: '08:45', subject: 'Physics', className: 'Class 8-B' },
    { id: '2', startTime: '09:00', endTime: '09:45', subject: 'Hindi', className: 'Class 8-B' },
    { id: 'b1', startTime: '09:45', endTime: '10:15', subject: '', className: '', isBreak: true, breakLabel: 'Morning Break' },
    { id: '3', startTime: '10:15', endTime: '11:00', subject: 'Mathematics', className: 'Class 8-B' },
    { id: '4', startTime: '11:00', endTime: '11:45', subject: 'Chemistry', className: 'Class 8-B' },
  ],
  wed: [
    { id: '1', startTime: '08:00', endTime: '08:45', subject: 'Chemistry', className: 'Class 8-B' },
    { id: '2', startTime: '09:00', endTime: '09:45', subject: 'Physics', className: 'Class 8-B' },
    { id: 'b1', startTime: '09:45', endTime: '10:15', subject: '', className: '', isBreak: true, breakLabel: 'Morning Break' },
    { id: '3', startTime: '10:15', endTime: '11:00', subject: 'Mathematics', className: 'Class 8-B' },
    { id: '4', startTime: '11:00', endTime: '11:45', subject: 'English', className: 'Class 8-B' },
  ],
  thu: [
    { id: '1', startTime: '08:00', endTime: '08:45', subject: 'Mathematics', className: 'Class 8-B' },
    { id: '2', startTime: '09:00', endTime: '09:45', subject: 'Physics', className: 'Class 8-B' },
    { id: 'b1', startTime: '09:45', endTime: '10:15', subject: '', className: '', isBreak: true, breakLabel: 'Morning Break' },
    { id: '3', startTime: '10:15', endTime: '11:00', subject: 'Chemistry', className: 'Class 8-B' },
    { id: '4', startTime: '11:00', endTime: '11:45', subject: 'Social', className: 'Class 8-B' },
  ],
  fri: [
    { id: '1', startTime: '08:00', endTime: '08:45', subject: 'Physics', className: 'Class 8-B' },
    { id: '2', startTime: '09:00', endTime: '09:45', subject: 'Chemistry', className: 'Class 8-B' },
    { id: 'b1', startTime: '09:45', endTime: '10:15', subject: '', className: '', isBreak: true, breakLabel: 'Morning Break' },
    { id: '3', startTime: '10:15', endTime: '11:00', subject: 'Mathematics', className: 'Class 8-B' },
    { id: '4', startTime: '11:00', endTime: '11:45', subject: 'English', className: 'Class 8-B' },
  ],
  sat: [
    { id: '1', startTime: '08:00', endTime: '08:45', subject: 'Physics', className: 'Class 8-B' },
    { id: '2', startTime: '09:00', endTime: '09:45', subject: 'Mathematics', className: 'Class 8-B' },
  ],
  sun: [],
};

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// ─── Helper Functions ─────────────────────────────────────────────────────────

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function getNextClass(): { subject: string; time: string; className: string } | null {
  const now = new Date();
  const dayIndex = now.getDay();
  const dayKey = DAY_KEYS[dayIndex];
  const currentMinutes = timeToMinutes(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);

  const todaySchedule = STUDENT_ROUTINE[dayKey] || [];
  const nextPeriod = todaySchedule.find((p) => {
    const startMinutes = timeToMinutes(p.startTime);
    return startMinutes >= currentMinutes && !p.isBreak;
  });

  if (nextPeriod) {
    const [h, m] = nextPeriod.startTime.split(':');
    const hour = parseInt(h);
    const min = parseInt(m);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour || 12;
    const time = `${displayHour}:${m} ${ampm}`;
    return {
      subject: nextPeriod.subject,
      time,
      className: nextPeriod.className,
    };
  }

  return null;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type GridItemData = { id: string; label: string; bg: string; icon: IconComponent; iconColor: string };

const CLASS_MANAGEMENT_ITEMS: GridItemData[] = [
  { id: 'timetable', label: 'Class Time Table', bg: colors.primary.alpha, icon: Calendar1, iconColor: colors.primary[300] },
  { id: 'lesson', label: 'Lesson Plan', bg: colors.purple.alpha, icon: Book1, iconColor: colors.purple[300] },
  { id: 'attendance', label: 'Attendance', bg: colors.secondary.alpha, icon: ClipboardTick, iconColor: colors.secondary[300] },
  { id: 'homework', label: 'Homework', bg: colors.green.alpha, icon: NoteText, iconColor: colors.green[200] },
  { id: 'exams', label: 'Exams', bg: colors.purple.alpha, icon: TaskSquare, iconColor: colors.purple[300] },
  { id: 'case', label: 'Student Case Study', bg: colors.purple.alpha, icon: Teacher, iconColor: colors.purple[400] },
];

const WORKSPACE_ITEMS: GridItemData[] = [
  { id: 'myattendance', label: 'My Attendance', bg: colors.yellow.alpha, icon: Timer1, iconColor: colors.yellow[200] },
  { id: 'payroll', label: 'Payroll', bg: colors.primary.alpha, icon: EmptyWallet, iconColor: colors.primary[300] },
  { id: 'leave', label: 'Leave Tracker', bg: colors.secondary.alpha, icon: BrifecaseTimer, iconColor: colors.secondary[300] },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function GridItem({
  label,
  bg,
  icon: Icon,
  iconColor,
  onPress,
}: {
  label: string;
  bg: string;
  icon: IconComponent;
  iconColor: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.gridItem} activeOpacity={0.75} onPress={onPress}>
      <View style={[styles.gridIconCircle, { backgroundColor: bg }]}>
        <Icon color={iconColor} size={26} variant="Bold" />
      </View>
      <Text style={styles.gridLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function DashboardScreen() {
  const router = useRouter();
  const { user, visibleClassManagementIds, visibleWorkspaceIds } = useDashboardVM();

  const filteredClassItems = CLASS_MANAGEMENT_ITEMS.filter((item) =>
    visibleClassManagementIds.includes(item.id)
  );
  const filteredWorkspaceItems = WORKSPACE_ITEMS.filter((item) =>
    visibleWorkspaceIds.includes(item.id)
  );

  const displayName = user?.firstName || 'User';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />

      {/* ── Top header ── */}
      <View style={styles.header}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <HamburgerMenu color={colors.neutral[900]} size={22} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Notification1 color={colors.neutral[700]} size={22} variant="Bold" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/profile')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ── */}
        <Text style={styles.greeting}>Hey {displayName}! {getGreeting()}</Text>
        <Text style={styles.quote}>"Great dreams of great dreamers are always transcended."</Text>

        {/* ── Assigned class card ── */}
        <View style={styles.classCard}>
          <View style={styles.classCardDecorCircle} />
          <View style={styles.classCardDecorCircle2} />
          <Text style={styles.classCardTag}>ASSIGNED CLASS TEACHER</Text>
          <Text style={styles.classCardName}>CLASS 8-B</Text>
          <Text style={styles.classCardSubject}>Physics</Text>
          <View style={styles.classCardStats}>
            <View>
              <Text style={styles.classCardStatValue}>34</Text>
              <Text style={styles.classCardStatLabel}>Students</Text>
            </View>
            <View style={styles.classCardStatDivider} />
            <View>
              <Text style={styles.classCardStatValue}>92%</Text>
              <Text style={styles.classCardStatLabel}>Avg. Attendance</Text>
            </View>
          </View>
        </View>

        {/* ── Today's Overview ── */}
        <SectionTitle title="Today's Overview" />
        <View style={styles.overviewCard}>
          <View style={[styles.overviewIconCircle, { backgroundColor: colors.yellow.alpha }]}>
            <Timer1 color={colors.yellow[200]} size={24} variant="Bold" />
          </View>
          <View>
            <Text style={styles.overviewSubLabel}>Next Class</Text>
            <Text style={styles.overviewValue}>10:45 AM - Class 10 - A</Text>
          </View>
        </View>

        {/* ── Class Management ── */}
        {filteredClassItems.length > 0 && (
          <>
            <SectionTitle title="Class Management" />
            <View style={styles.grid}>
              {filteredClassItems.map((item) => (
                <GridItem
                  key={item.id}
                  label={item.label}
                  bg={item.bg}
                  icon={item.icon}
                  iconColor={item.iconColor}
                  onPress={
                    item.id === 'timetable' ? () => router.push('/timetable') :
                      item.id === 'lesson' ? () => router.push('/lesson-plan') :
                        item.id === 'attendance' ? () => router.push('/attendance') :
                          item.id === 'exams' ? () => router.push('/(tabs)/exams') :
                            undefined
                  }
                />
              ))}
            </View>
          </>
        )}

        {/* ── My Workspace ── */}
        {filteredWorkspaceItems.length > 0 && (
          <>
            <SectionTitle title="My Workspace" />
            <View style={styles.grid}>
              {filteredWorkspaceItems.map((item) => (
                <GridItem
                  key={item.id}
                  label={item.label}
                  bg={item.bg}
                  icon={item.icon}
                  iconColor={item.iconColor}
                  onPress={item.id === 'myattendance' ? () => router.push('/my-attendance') : undefined}
                />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function StudentDashboardScreen() {
  const router = useRouter();

  const nextClass = useMemo(() => {
    return getNextClass();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />

      <View style={styles.header}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <HamburgerMenu color={colors.neutral[900]} size={22} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Notification1 color={colors.neutral[700]} size={22} variant="Bold" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/profile')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>S</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Hey Student! {getGreeting()}</Text>
        <Text style={styles.quote}>"Great dreams of great dreamers are always transcended."</Text>

        <View style={styles.studentClassCard}>
          <View style={styles.classCardDecorCircle} />
          <View style={styles.classCardDecorCircle2} />
          <Text style={styles.classCardTag}>CLASS TEACHER</Text>
          <Text style={styles.classCardName}>Shikha</Text>
          <Text style={styles.classCardSubject}>CLASS 8-B</Text>
          <View style={styles.classCardStats}>
            <View>
              <Text style={styles.classCardStatValue}>34</Text>
              <Text style={styles.classCardStatLabel}>Roll No</Text>
            </View>
            <View style={styles.classCardStatDivider} />
            <View>
              <Text style={styles.classCardStatValue}>92%</Text>
              <Text style={styles.classCardStatLabel}>Avg. Attendance</Text>
            </View>
          </View>
        </View>

        <SectionTitle title="Today's Overview" />
        <View style={styles.overviewCard}>
          <View style={[styles.overviewIconCircle, { backgroundColor: colors.yellow.alpha }]}>
            <Timer1 color={colors.yellow[200]} size={24} variant="Bold" />
          </View>
          <View>
            <Text style={styles.overviewSubLabel}>Next Class</Text>
            <Text style={styles.overviewValue}>
              {nextClass
                ? `${nextClass.time} - ${nextClass.subject}`
                : 'No classes for today'}
            </Text>
          </View>
        </View>

        <SectionTitle title="Class Management" />
        <View style={styles.grid}>
          {CLASS_MANAGEMENT_ITEMS.map((item) => (
            <GridItem
              key={item.id}
              label={item.label}
              bg={item.bg}
              icon={item.icon}
              iconColor={item.iconColor}
              onPress={
                item.id === 'timetable' ? () => router.push('/timetable') :
                  item.id === 'lesson' ? () => router.push('/lesson-plan') :
                    item.id === 'attendance' ? () => router.push('/view-attendance') :
                      item.id === 'exams' ? () => router.push('/student-exam-results') :
                        undefined
              }
            />
          ))}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface.light,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[900],
    marginLeft: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: { padding: 4 },
  avatarBtn: {},
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: colors.neutral[700] },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  // Greeting
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  quote: {
    fontSize: 13,
    color: colors.neutral[500],
    fontStyle: 'italic',
    marginBottom: 20,
  },

  // Class card
  classCard: {
    backgroundColor: colors.primary[300],
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  studentClassCard: {
    backgroundColor: colors.primary[300],
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  classCardDecorCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -20,
    top: -20,
  },
  classCardDecorCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    right: 40,
    top: 20,
  },
  classCardTag: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  classCardName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.neutral[100],
    marginBottom: 2,
  },
  classCardSubject: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 18,
  },
  classCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  classCardStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[100],
  },
  classCardStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  classCardStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 12,
  },

  // Today's overview
  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 14,
    shadowColor: colors.neutral[100],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  overviewIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  overviewSubLabel: {
    fontSize: 12,
    color: colors.neutral[500],
    marginBottom: 2,
  },
  overviewValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[900],
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridItem: {
    width: '47%',
    backgroundColor: colors.neutral[100],
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    shadowColor: colors.neutral[100],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  gridIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  gridLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[800],
    textAlign: 'center',
  },
});
