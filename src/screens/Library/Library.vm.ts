import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    getLibraryBooks,
    getMyRequests,
    type LibraryBook,
    type LibraryRequest,
} from '../../services/libraryService';

export type LibraryTab = 'books' | 'history';

export function useLibraryVM() {
    const { user } = useAuth();
    const userId = user?.id ?? '';
    const userType = user?.role === 'student' ? 'student' : 'employee';

    const [activeTab, setActiveTab] = useState<LibraryTab>('books');
    const [books, setBooks] = useState<LibraryBook[]>([]);
    const [requests, setRequests] = useState<LibraryRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadBooks = useCallback(async () => {
        try {
            const data = await getLibraryBooks(searchQuery || undefined);
            setBooks(data);
        } catch (e) {
            console.error('[Library] Failed to load books:', e);
        }
    }, [searchQuery]);

    const loadRequests = useCallback(async () => {
        if (!userId) return;
        try {
            // Load all statuses for history
            const data = await getMyRequests(userId, userType);
            setRequests(data);
        } catch (e) {
            console.error('[Library] Failed to load requests:', e);
        }
    }, [userId, userType]);

    useEffect(() => {
        setLoading(true);
        Promise.all([loadBooks(), loadRequests()])
            .finally(() => setLoading(false));
    }, [loadBooks, loadRequests]);

    // Filtered books based on search
    const filteredBooks = useMemo(() => {
        if (!searchQuery.trim()) return books;
        const q = searchQuery.toLowerCase();
        return books.filter((b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.book_code.toLowerCase().includes(q)
        );
    }, [books, searchQuery]);

    // Split history into active (pending/issued) and completed (returned/rejected/overdue)
    const activeRequests = useMemo(() =>
        requests.filter((r) => r.status === 'Pending' || r.status === 'Issued' || r.status === 'Overdue'),
        [requests]
    );

    const completedRequests = useMemo(() =>
        requests.filter((r) => r.status === 'Returned' || r.status === 'Rejected'),
        [requests]
    );

    return {
        activeTab,
        setActiveTab,
        books: filteredBooks,
        requests,
        activeRequests,
        completedRequests,
        loading,
        searchQuery,
        setSearchQuery,
        refresh: async () => {
            await Promise.all([loadBooks(), loadRequests()]);
        },
        userId,
        userType,
    };
}
