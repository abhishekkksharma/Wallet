import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { persistor, store } from '../store/store';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Timeout fallback to prevent infinite loading
        const timeout = setTimeout(() => {
            if (loading) {
                console.warn('Auth session check timed out - proceeding without session');
                setLoading(false);
            }
        }, 5000);

        // Check initial session
        supabase.auth.getSession()
            .then(({ data: { session }, error }) => {
                if (error) {
                    console.error('Auth session error:', error);
                }
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Auth getSession failed:', error);
                setLoading(false);
            });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            clearTimeout(timeout);
            subscription.unsubscribe();
        };
    }, []);

    const value = {
        session,
        user,
        loading,
        signOut: async () => {
            store.dispatch({ type: 'USER_LOGOUT' });
            await persistor.purge();
            return supabase.auth.signOut();
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
