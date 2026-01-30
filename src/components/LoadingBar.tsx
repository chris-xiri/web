import React, { useEffect, useState } from 'react';

interface LoadingBarProps {
    isLoading: boolean;
}

const LoadingBar: React.FC<LoadingBarProps> = ({ isLoading }) => {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isLoading) {
            setVisible(true);
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        return prev;
                    }
                    return prev + (100 - prev) * 0.1;
                });
            }, 200);
        } else {
            setProgress(100);
            const timeout = setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 500);
            return () => clearTimeout(timeout);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoading]);

    if (!visible) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-[9999] pointer-events-none">
            <div
                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%`, boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}
            />
        </div>
    );
};

export default LoadingBar;
