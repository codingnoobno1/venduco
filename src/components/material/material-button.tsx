// Material Design Button Components
"use client"

import { Button as PaperButton, FAB } from 'react-native-paper'
import { StyleSheet } from 'react-native'
import { motion } from 'framer-motion'

interface MaterialButtonProps {
    children: string
    onPress?: () => void
    mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal'
    icon?: string
    loading?: boolean
    disabled?: boolean
}

export function MaterialButton({
    children,
    onPress,
    mode = 'contained',
    icon,
    loading,
    disabled
}: MaterialButtonProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ display: 'inline-block' }}
        >
            <PaperButton
                mode={mode}
                onPress={onPress}
                icon={icon}
                loading={loading}
                disabled={disabled}
                style={styles.button}
                contentStyle={styles.buttonContent}
            >
                {children}
            </PaperButton>
        </motion.div>
    )
}

export function MaterialFAB({ icon, label, onPress }: { icon: string, label?: string, onPress?: () => void }) {
    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{ display: 'inline-block' }}
        >
            <FAB
                icon={icon}
                label={label}
                onPress={onPress}
                style={styles.fab}
            />
        </motion.div>
    )
}

const styles = StyleSheet.create({
    button: {
        marginVertical: 4,
        marginHorizontal: 4,
    },
    buttonContent: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    fab: {
        margin: 16,
    },
})
