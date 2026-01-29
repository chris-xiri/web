import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User as AppUser } from '../types';

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    switchView: (mode: 'sales' | 'recruiter' | 'auditor') => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    switchView: () => { },
    logout: async () => { }
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const docRef = doc(db, 'users', firebaseUser.uid);
                const docSnap = await getDoc(docRef);
                const userData = docSnap.exists() ? docSnap.data() : {};

                // Determine default view mode based on role
                let defaultViewMode: AppUser['viewMode'] = undefined;
                if (userData.role === 'facility_manager') defaultViewMode = 'auditor'; // Start in Ops
                if (userData.role === 'sales') defaultViewMode = 'sales';
                if (userData.role === 'recruiter') defaultViewMode = 'recruiter';
                if (userData.role === 'auditor') defaultViewMode = 'auditor';

                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    role: userData.role || 'auditor',
                    territoryId: userData.territoryId,
                    viewMode: defaultViewMode
                } as AppUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
    }, []);

    const switchView = (mode: 'sales' | 'recruiter' | 'auditor') => {
        if (!user) return;

        // Security check: Only allow switching if role permits
        const allowedRoles = ['super_admin', 'facility_manager'];
        if (allowedRoles.includes(user.role)) {
            setUser({ ...user, viewMode: mode });
        }
    };

    const logout = async () => {
        try {
            await auth.signOut();
            setUser(null);
        } catch (error) {
            console.error('Error signing out', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, switchView, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
