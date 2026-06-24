import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LibraryBook {
    book_id: string;
    book_code: string;
    title: string;
    author: string;
    publisher: string;
    edition: string;
    publication_year: number;
    genre_id: string | null;
    category_id: string | null;
    genre?: { genre_id: string; name: string } | null;
    category?: { category_id: string; name: string } | null;
    language: string;
    total_stock: number;
    reserved_stock: number;
}

export interface LibraryRequest {
    request_id: string;
    book_id: string;
    student_id: string | null;
    employee_id: string | null;
    requested_person_type: string;
    requested_person?: {
        full_name: string;
        role_name: string;
        class_name?: string;
        section_name?: string;
    };
    status: 'Pending' | 'Issued' | 'Returned' | 'Rejected' | 'Overdue';
    request_date: string;
    issue_date: string | null;
    due_date: string | null;
    return_date: string | null;
    remarks: string | null;
    book?: LibraryBook;
    created_at: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getLibraryBooks(search?: string): Promise<LibraryBook[]> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/library/books${query}`);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
}

export async function getMyRequests(
    userId: string,
    userType: 'student' | 'employee',
    status?: string,
): Promise<LibraryRequest[]> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/library/requests${query}`);
    const data = response.data?.data ?? response.data;
    const all: LibraryRequest[] = Array.isArray(data) ? data : [];
    // Filter to only this user's requests
    return all.filter((r) =>
        userType === 'student' ? r.student_id === userId : r.employee_id === userId
    );
}

export async function createBookRequest(payload: {
    book_id: string;
    student_id?: string;
    employee_id?: string;
    remarks?: string;
    created_by: string;
    modified_by: string;
}): Promise<void> {
    await api.post('/library/requests', payload);
}
