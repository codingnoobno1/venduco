// Material Design Showcase Page
"use client"

import { View, StyleSheet, ScrollView } from 'react-native'
import { MaterialCard } from '@/components/material/material-card'
import { MaterialButton, MaterialFAB } from '@/components/material/material-button'
import { Text, Chip, ProgressBar, Divider } from 'react-native-paper'

export function MaterialShowcase() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text variant="headlineLarge" style={styles.sectionTitle}>
                    🎨 Material Design Components
                </Text>
                <Text variant="bodyMedium" style={styles.sectionDescription}>
                    React Native Paper components working on web
                </Text>
            </View>

            {/* Buttons */}
            <View style={styles.section}>
                <Text variant="titleLarge" style={styles.subtitle}>Buttons</Text>
                <View style={styles.buttonRow}>
                    <MaterialButton mode="contained">Contained</MaterialButton>
                    <MaterialButton mode="outlined">Outlined</MaterialButton>
                    <MaterialButton mode="text">Text</MaterialButton>
                    <MaterialButton mode="elevated" icon="plus">With Icon</MaterialButton>
                </View>
            </View>

            {/* Cards */}
            <View style={styles.section}>
                <Text variant="titleLarge" style={styles.subtitle}>Cards</Text>
                <View style={styles.cardGrid}>
                    <MaterialCard
                        icon="🚇"
                        title="Metro Projects"
                        description="23 active metro line projects with bidding open"
                        action={{ label: "View Details", onPress: () => console.log('Metro') }}
                    />
                    <MaterialCard
                        icon="🚄"
                        title="Bullet Trains"
                        description="High-speed rail corridor development"
                        action={{ label: "Explore", onPress: () => console.log('Bullet') }}
                    />
                    <MaterialCard
                        icon="✈️"
                        title="Airports"
                        description="Airport expansion and runway projects"
                        action={{ label: "Browse", onPress: () => console.log('Airport') }}
                    />
                </View>
            </View>

            {/* Chips */}
            <View style={styles.section}>
                <Text variant="titleLarge" style={styles.subtitle}>Chips</Text>
                <View style={styles.chipRow}>
                    <Chip icon="check">Active</Chip>
                    <Chip icon="clock">Pending</Chip>
                    <Chip icon="alert">Urgent</Chip>
                    <Chip mode="outlined">Completed</Chip>
                </View>
            </View>

            {/* Progress */}
            <View style={styles.section}>
                <Text variant="titleLarge" style={styles.subtitle}>Progress Indicators</Text>
                <ProgressBar progress={0.75} color="#2563eb" style={styles.progress} />
                <Text variant="bodySmall" style={styles.progressText}>75% Complete</Text>
            </View>

            {/* FAB */}
            <View style={styles.fabContainer}>
                <MaterialFAB icon="plus" label="New Tender" />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        marginBottom: 8,
        fontWeight: '700',
    },
    sectionDescription: {
        opacity: 0.7,
        marginBottom: 16,
    },
    subtitle: {
        marginBottom: 16,
        fontWeight: '600',
    },
    buttonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    cardGrid: {
        gap: 16,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    progress: {
        height: 8,
        borderRadius: 4,
    },
    progressText: {
        marginTop: 8,
        opacity: 0.7,
    },
    fabContainer: {
        marginTop: 24,
        marginBottom: 48,
    },
})
