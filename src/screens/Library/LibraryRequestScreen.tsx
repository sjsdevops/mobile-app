import { useState } from 'react';
import {
    ActivityIndicator,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Book1, TickCircle } from 'iconsax-react-nativejs';
import { colors } from '../../theme/colors';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useAuth } from '../../contexts/AuthContext';
import { createBookRequest } from '../../services/libraryService';

export function LibraryRequestScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { bookId, bookTitle } = useLocalSearchParams<{ bookId: string; bookTitle: string }>();

    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit() {
        if (!user?.id || !bookId) return;
        setSubmitting(true);
        setError('');
        try {
            const isStudent = user.role === 'student';
            await createBookRequest({
                book_id: bookId,
                student_id: isStudent ? user.id : undefined,
                employee_id: !isStudent ? user.id : undefined,
                remarks: remarks.trim() || undefined,
                created_by: user.id,
                modified_by: user.id,
            });
            setSuccess(true);
        } catch (e: any) {
            const msg = e?.response?.data?.detail || e?.message || 'Failed to submit request';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    if (success) {
        return (
            <SafeAreaView style={s.safe} edges={['top']}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
                <View style={s.successView}>
                    <TickCircle color={colors.green[200]} size={64} variant="Bold" />
                    <Text style={s.successTitle}>Request Submitted!</Text>
                    <Text style={s.successSubtitle}>
                        Your request for "{bookTitle}" has been submitted. You'll be notified once it's approved.
                    </Text>
                    <TouchableOpacity style={s.doneBtn} onPress={() => router.back()} activeOpacity={0.85}>
                        <Text style={s.doneBtnText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface.light} />
            <ScreenHeader title="Request Book" onBack={() => router.back()} />

            <View style={s.content}>
                {/* Book info */}
                <View style={s.bookCard}>
                    <View style={s.bookIcon}>
                        <Book1 color={colors.primary[300]} size={24} variant="Bold" />
                    </View>
                    <View>
                        <Text style={s.bookTitle}>{bookTitle}</Text>
                        <Text style={s.bookId}>ID: {bookId}</Text>
                    </View>
                </View>

                {/* Remarks */}
                <Text style={s.label}>Remarks (optional)</Text>
                <TextInput
                    style={s.textarea}
                    placeholder="Why do you need this book?"
                    placeholderTextColor={colors.neutral[400]}
                    value={remarks}
                    onChangeText={setRemarks}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                {/* Error */}
                {error ? (
                    <View style={s.errorBox}>
                        <Text style={s.errorText}>{error}</Text>
                    </View>
                ) : null}

                <View style={{ flex: 1 }} />

                {/* Submit */}
                <TouchableOpacity
                    style={[s.submitBtn, submitting && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                    activeOpacity={0.85}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={s.submitBtnText}>Submit Request</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface.light },
    content: { flex: 1, padding: 20 },

    bookCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: colors.primary.alpha, borderRadius: 16, padding: 16, marginBottom: 24,
    },
    bookIcon: {
        width: 48, height: 48, borderRadius: 14, backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
    },
    bookTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral[900] },
    bookId: { fontSize: 12, color: colors.neutral[500], marginTop: 2 },

    label: { fontSize: 14, fontWeight: '600', color: colors.neutral[800], marginBottom: 8 },
    textarea: {
        backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: colors.neutral[200],
        padding: 14, fontSize: 14, color: colors.neutral[900], minHeight: 120,
    },

    errorBox: { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginTop: 12 },
    errorText: { fontSize: 13, color: '#DC2626' },

    submitBtn: {
        backgroundColor: colors.primary[300], borderRadius: 14, paddingVertical: 16,
        alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

    successView: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
    successTitle: { fontSize: 22, fontWeight: '700', color: colors.neutral[900] },
    successSubtitle: { fontSize: 14, color: colors.neutral[500], textAlign: 'center', lineHeight: 20 },
    doneBtn: {
        backgroundColor: colors.primary[300], borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40,
        marginTop: 12,
    },
    doneBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
