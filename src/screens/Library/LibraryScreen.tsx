import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Book1, SearchNormal1, Clock, TickCircle, CloseCircle } from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useLibraryVM, type LibraryTab } from './Library.vm';
import type { LibraryBook, LibraryRequest } from '../../services/libraryService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Book Card ────────────────────────────────────────────────────────────────

function BookCard({ book, onRequest }: { book: LibraryBook; onRequest: () => void }) {
    const available = book.total_stock - book.reserved_stock;
    const isAvailable = available > 0;

    return (
        <View style={s.bookCard}>
            <View style={s.bookIconCircle}>
                <Book1 color={colors.primary[300]} size={22} variant="Bold" />
            </View>
            <View style={s.bookInfo}>
                <Text style={s.bookTitle} numberOfLines={1}>{book.title}</Text>
                <Text style={s.bookMeta}>{book.author} • {book.book_code}</Text>
                <View style={s.bookStockRow}>
                    <Text style={[s.bookStock, isAvailable ? s.stockGreen : s.stockRed]}>
                        {isAvailable ? `${available} available` : 'Unavailable'}
                    </Text>
                    {book.genre?.name && (
                        <View style={s.genreBadge}>
                            <Text style={s.genreBadgeText}>{book.genre.name}</Text>
                        </View>
                    )}
                </View>
            </View>
            {isAvailable && (
                <TouchableOpacity style={s.requestBtn} onPress={onRequest} activeOpacity={0.85}>
                    <Text style={s.requestBtnText}>Request</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── Request History Card ─────────────────────────────────────────────────────

function RequestCard({ item }: { item: LibraryRequest }) {
    const isOverdue = item.status === 'Overdue';
    const isPending = item.status === 'Pending';
    const isIssued = item.status === 'Issued';
    const isReturned = item.status === 'Returned';
    const isRejected = item.status === 'Rejected';

    const cardStyle = isOverdue ? s.cardOverdue : isIssued ? s.cardIssued : s.cardDefault;
    const statusColor = isOverdue ? '#DC2626' : isPending ? '#F59E0B' : isIssued ? colors.primary[300] : isReturned ? colors.green[200] : colors.neutral[500];

    return (
        <View style={[s.historyCard, cardStyle]}>
            <View style={s.historyCardHeader}>
                <Text style={s.historyBookTitle} numberOfLines={1}>{item.book?.title ?? '—'}</Text>
                <View style={[s.statusPill, { backgroundColor: statusColor + '18' }]}>
                    <Text style={[s.statusText, { color: statusColor }]}>{item.status}</Text>
                </View>
            </View>
            <Text style={s.historyBookCode}>{item.book?.book_code ?? ''} • {item.book?.author ?? ''}</Text>
            <View style={s.historyDates}>
                {item.issue_date && (
                    <Text style={s.historyDateText}>Issued: {fmtDate(item.issue_date)}</Text>
                )}
                {item.due_date && (
                    <Text style={[s.historyDateText, isOverdue && { color: '#DC2626', fontWeight: '700' }]}>
                        Due: {fmtDate(item.due_date)}
                    </Text>
                )}
                {item.return_date && (
                    <Text style={s.historyDateText}>Returned: {fmtDate(item.return_date)}</Text>
                )}
            </View>
            {isOverdue && (
                <View style={s.overdueWarning}>
                    <Clock color="#DC2626" size={14} variant="Bold" />
                    <Text style={s.overdueWarningText}>This book is overdue. Please return it immediately.</Text>
                </View>
            )}
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function LibraryScreen() {
    const router = useRouter();
    const vm = useLibraryVM();

    const TABS: { key: LibraryTab; label: string }[] = [
        { key: 'books', label: 'All Books' },
        { key: 'history', label: 'My History' },
    ];

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
            <ScreenHeader title="Library" onBack={() => router.back()} />

            {/* Tabs */}
            <View style={s.tabRow}>
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[s.tab, vm.activeTab === tab.key && s.tabActive]}
                        onPress={() => vm.setActiveTab(tab.key)}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.tabText, vm.activeTab === tab.key && s.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {vm.loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={colors.primary[300]} />
                </View>
            ) : vm.activeTab === 'books' ? (
                /* ── Books Tab ── */
                <>
                    {/* Search */}
                    <View style={s.searchWrapper}>
                        <SearchNormal1 color={colors.neutral[400]} size={18} variant="Linear" />
                        <TextInput
                            style={s.searchInput}
                            placeholder="Search books..."
                            placeholderTextColor={colors.neutral[400]}
                            value={vm.searchQuery}
                            onChangeText={vm.setSearchQuery}
                        />
                    </View>

                    <FlatList
                        data={vm.books}
                        keyExtractor={(item) => item.book_id}
                        contentContainerStyle={s.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={s.center}>
                                <Book1 color={colors.neutral[300]} size={48} variant="Bold" />
                                <Text style={s.emptyText}>No books found</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <BookCard
                                book={item}
                                onRequest={() => router.push({
                                    pathname: '/library-request',
                                    params: { bookId: item.book_id, bookTitle: item.title },
                                })}
                            />
                        )}
                    />
                </>
            ) : (
                /* ── History Tab ── */
                <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
                    {/* Active / Overdue */}
                    {vm.activeRequests.length > 0 && (
                        <>
                            <Text style={s.sectionTitle}>Active & Overdue</Text>
                            {vm.activeRequests.map((r) => (
                                <RequestCard key={r.request_id} item={r} />
                            ))}
                        </>
                    )}

                    {/* Completed */}
                    {vm.completedRequests.length > 0 && (
                        <>
                            <Text style={[s.sectionTitle, { marginTop: 20 }]}>Completed</Text>
                            {vm.completedRequests.map((r) => (
                                <RequestCard key={r.request_id} item={r} />
                            ))}
                        </>
                    )}

                    {vm.requests.length === 0 && (
                        <View style={s.center}>
                            <Clock color={colors.neutral[300]} size={48} variant="Bold" />
                            <Text style={s.emptyText}>No request history</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface.light },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 40 },
    list: { paddingHorizontal: 16, paddingBottom: 100 },

    // Tabs
    tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f0f2f8', alignItems: 'center' },
    tabActive: { backgroundColor: colors.primary[300] },
    tabText: { fontSize: 14, fontWeight: '600', color: colors.neutral[500] },
    tabTextActive: { color: '#fff' },

    // Search
    searchWrapper: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12,
        backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
        gap: 10, borderWidth: 1, borderColor: colors.neutral[200],
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.neutral[900] },

    // Book card
    bookCard: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    },
    bookIconCircle: {
        width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary.alpha,
        alignItems: 'center', justifyContent: 'center',
    },
    bookInfo: { flex: 1 },
    bookTitle: { fontSize: 15, fontWeight: '700', color: colors.neutral[900], marginBottom: 2 },
    bookMeta: { fontSize: 12, color: colors.neutral[500], marginBottom: 4 },
    bookStockRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bookStock: { fontSize: 12, fontWeight: '600' },
    stockGreen: { color: colors.green[200] },
    stockRed: { color: colors.secondary[300] },
    genreBadge: { backgroundColor: colors.primary.alpha, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
    genreBadgeText: { fontSize: 10, fontWeight: '600', color: colors.primary[300] },
    requestBtn: {
        backgroundColor: colors.primary[300], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
    },
    requestBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },

    // History card
    historyCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: colors.neutral[200],
    },
    cardOverdue: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
    cardIssued: { borderColor: colors.primary[100], backgroundColor: '#F0F4FF' },
    cardDefault: {},
    historyCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    historyBookTitle: { fontSize: 15, fontWeight: '700', color: colors.neutral[900], flex: 1, marginRight: 8 },
    historyBookCode: { fontSize: 12, color: colors.neutral[500], marginBottom: 8 },
    historyDates: { gap: 3 },
    historyDateText: { fontSize: 12, color: colors.neutral[600] },
    statusPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    statusText: { fontSize: 11, fontWeight: '700' },
    overdueWarning: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
        backgroundColor: '#FEE2E2', borderRadius: 8, padding: 10,
    },
    overdueWarningText: { fontSize: 12, color: '#DC2626', flex: 1 },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral[800], marginBottom: 10, marginTop: 4 },
    emptyText: { fontSize: 15, color: colors.neutral[400], marginTop: 8 },
});
