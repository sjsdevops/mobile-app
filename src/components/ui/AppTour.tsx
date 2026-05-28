import { useState, useEffect } from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';

const { width: SCREEN_W } = Dimensions.get('window');
const TOUR_KEY = 'app_tour_completed';

export interface TourStep {
    id: string;
    title: string;
    description: string;
}

interface AppTourProps {
    steps: TourStep[];
    onComplete?: () => void;
}

export function AppTour({ steps, onComplete }: AppTourProps) {
    const [visible, setVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        (async () => {
            const done = await AsyncStorage.getItem(TOUR_KEY);
            if (!done) {
                setVisible(true);
            }
        })();
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish();
        }
    };

    const handleSkip = () => {
        handleFinish();
    };

    const handleFinish = async () => {
        setVisible(false);
        await AsyncStorage.setItem(TOUR_KEY, 'true');
        onComplete?.();
    };

    if (!visible || steps.length === 0) return null;

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    return (
        <Modal visible transparent animationType="fade">
            <View style={s.overlay}>
                <View style={s.card}>
                    {/* Step indicator dots */}
                    <View style={s.dots}>
                        {steps.map((_, i) => (
                            <View key={i} style={[s.dot, i === currentStep && s.dotActive]} />
                        ))}
                    </View>

                    {/* Content */}
                    <Text style={s.title}>{step.title}</Text>
                    <Text style={s.description}>{step.description}</Text>

                    {/* Step counter */}
                    <Text style={s.counter}>{currentStep + 1} of {steps.length}</Text>

                    {/* Buttons */}
                    <View style={s.buttons}>
                        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
                            <Text style={s.skipText}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.nextBtn} onPress={handleNext} activeOpacity={0.85}>
                            <Text style={s.nextBtnText}>{isLast ? 'Get Started' : 'Next'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

/** Reset tour (for testing) */
export async function resetAppTour() {
    await AsyncStorage.removeItem(TOUR_KEY);
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 28,
        width: SCREEN_W - 48,
        alignItems: 'center',
    },
    dots: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.neutral[300],
    },
    dotActive: {
        backgroundColor: colors.primary[300],
        width: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.neutral[900],
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: colors.neutral[600],
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 16,
    },
    counter: {
        fontSize: 12,
        color: colors.neutral[400],
        marginBottom: 20,
    },
    buttons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[500],
    },
    nextBtn: {
        backgroundColor: colors.primary[300],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    nextBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
});
