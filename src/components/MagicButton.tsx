import React from 'react';
import styles from './MagicButton.module.css';

interface MagicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
}

export default function MagicButton({ children, variant = 'primary', className = '', ...props }: MagicButtonProps) {
    return (
        <button
            className={`${styles.magicButton} ${className}`}
            {...props}
        >
            <span className={styles.text}>
                {children}
            </span>
            <div className={styles.glowOverlay} />
        </button>
    );
}
