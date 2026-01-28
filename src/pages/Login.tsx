import { useState, FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-xiri-background p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-xiri-primary rounded-xl flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-white text-2xl font-bold">X</span>
                    </div>
                    <h1 className="text-3xl font-bold text-xiri-primary tracking-tight">XIRI</h1>
                    <p className="text-xiri-secondary text-sm font-medium mt-1 uppercase tracking-widest">Facility Solutions</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-xiri-danger p-3 rounded-lg mb-6 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <span className="w-2 h-2 bg-xiri-danger rounded-full animate-pulse" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-xiri-accent/20 focus:border-xiri-accent outline-none transition-all placeholder:text-slate-400"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-xiri-accent/20 focus:border-xiri-accent outline-none transition-all placeholder:text-slate-400"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-xiri-primary text-white py-3.5 rounded-xl font-bold hover:bg-xiri-secondary active:scale-[0.98] transition-all shadow-lg shadow-xiri-primary/10 mt-2"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
