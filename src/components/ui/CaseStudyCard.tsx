import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { useThemeColors } from '../../theme/ThemeContext';
import { Badge, type BadgeVariant } from './Badge';
import type { CaseStudyItem } from '../../services/caseStudyService';

function statusVariant(status: string | null): BadgeVariant {
    const s = (status ?? '').toLowerCase();
    if (s === 'resolved' || s === 'closed') return 'green';
    if (s === 'open' || s === 'in progress' || s === 'under review') return 'blue';
    return 'gray';
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function CaseStudyCard({
    item,
    expanded = false,
    onViewDetails,
}: {
    item: CaseStudyItem;
    /** Show full notes when true; otherwise truncate to a few lines. */
    expanded?: boolean;
    /** Renders a "View Details" button when provided. */
    onViewDetails?: () => void;
}) {
    const theme = useThemeColors();

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.type} numberOfLines={1}>
                    {item.case_study_type || 'Case Study'}
                </Text>
                {item.status ? <Badge label={item.status} variant={statusVariant(item.status)} /> : null}
            </View>

            <Text style={styles.date}>{formatDate(item.created_at)}</Text>

            {item.notes ? (
                <Text style={styles.notes} numberOfLines={expanded ? undefined : 3}>
                    {item.notes}
                </Text>
            ) : (
                <Text style={styles.notesMuted}>No notes provided.</Text>
            )}

            {onViewDetails ? (
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: theme.primary[300] }]}
                    onPress={onViewDetails}
                    activeOpacity={0.85}
                >
                    <Text style={styles.btnText}>View Details</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        backgroundColor: colors.surface.DEFAULT,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    type: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: colors.neutral[900],
    },
    date: {
        fontSize: 12,
        color: colors.neutral[500],
        marginTop: 4,
    },
    notes: {
        fontSize: 13,
        color: colors.neutral[700],
        lineHeight: 19,
        marginTop: 10,
    },
    notesMuted: {
        fontSize: 13,
        color: colors.neutral[400],
        fontStyle: 'italic',
        marginTop: 10,
    },
    btn: {
        marginTop: 14,
        borderRadius: 999,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.neutral[100],
    },
});
