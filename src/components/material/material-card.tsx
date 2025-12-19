// Material Design Card Component using React Native Paper
"use client"

import { Card, Text, Button, Surface } from 'react-native-paper'
import { View, StyleSheet } from 'react-native'
import { motion } from 'framer-motion'

interface MaterialCardProps {
    title: string
    description: string
    action?: {
        label: string
        onPress: () => void
    }
    icon?: string
    elevated?: boolean
}

export function MaterialCard({ title, description, action, icon, elevated = true }: MaterialCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <Card mode={elevated ? "elevated" : "contained"} style={styles.card}>
                <Card.Content>
                    {icon && <Text variant="displaySmall" style={styles.icon}>{icon}</Text>}
                    <Text variant="titleLarge" style={styles.title}>{title}</Text>
                    <Text variant="bodyMedium" style={styles.description}>{description}</Text>
                </Card.Content>
                {action && (
                    <Card.Actions>
                        <Button mode="contained" onPress={action.onPress}>
                            {action.label}
                        </Button>
                    </Card.Actions>
                )}
            </Card>
        </motion.div>
    )
}

const styles = StyleSheet.create({
    card: {
        margin: 8,
    },
    icon: {
        marginBottom: 8,
    },
    title: {
        marginBottom: 8,
        fontWeight: '700',
    },
    description: {
        marginBottom: 16,
        opacity: 0.8,
    },
})
