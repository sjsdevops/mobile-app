import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { colors } from '../src/theme/colors';

export default function WebViewScreen() {
    const { url, title } = useLocalSearchParams<{ url: string; title?: string }>();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScreenHeader title={title || 'Terms & Policies'} />
            <WebView
                source={{ uri: url || '' }}
                style={styles.webview}
                startInLoadingState
                renderLoading={() => (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color={colors.primary[300]} />
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.surface.light,
    },
    webview: {
        flex: 1,
    },
    loader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
