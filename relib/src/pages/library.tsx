import React, { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { DataBroker, type LibraryDocument, type Session } from '../dataBroker';
import { useStatusMessage } from '../hooks/useStatusMessage';

interface LibraryProps {
    session: Session | null;
}

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * 1024;

const formatSize = (bytes: number): string => {
    if (bytes >= BYTES_PER_MB) { return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`; }
    if (bytes >= BYTES_PER_KB) { return `${Math.round(bytes / BYTES_PER_KB)} KB`; }
    return `${bytes} B`;
};

const formatDate = (iso: string): string => {
    try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return iso; }
};

const createEmptyForm = (): Omit<LibraryDocument, 'id' | 'uploadedBy' | 'uploadedAt'> => ({
    name: '',
    mimeType: '',
    size: 0,
    description: '',
    category: '',
});

export default function Library({ session }: LibraryProps) {
    const [docs, setDocs] = useState<LibraryDocument[]>(() => DataBroker.getLibraryDocuments());
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formState, setFormState] = useState(createEmptyForm());
    const [formError, setFormError] = useState('');
    const { statusMessage, showStatusMessage } = useStatusMessage();

    const canRead   = DataBroker.canAccessPage(session?.user, 'library', 'readOnly');
    const canWrite  = DataBroker.canAccessPage(session?.user, 'library', 'readWrite');
    const canDelete = DataBroker.canAccessPage(session?.user, 'library', 'delete');

    const users = useMemo(() => {
        const all = DataBroker.getUsers();
        return new Map(all.map((u) => [u.uid, u.name]));
    }, []);

    const categories = useMemo(
        () => ['all', ...new Set(docs.map((d) => d.category).filter(Boolean))].sort((a, b) => a === 'all' ? -1 : a.localeCompare(b)),
        [docs],
    );

    const visibleDocs = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return docs.filter((d) => {
            const matchesCat = categoryFilter === 'all' || d.category === categoryFilter;
            const matchesSearch =
                query.length === 0 ||
                d.name.toLowerCase().includes(query) ||
                d.description.toLowerCase().includes(query) ||
                d.category.toLowerCase().includes(query);
            return matchesCat && matchesSearch;
        });
    }, [docs, searchTerm, categoryFilter]);

    const handleEdit = (doc: LibraryDocument) => {
        setEditingId(doc.id);
        setFormState({ name: doc.name, mimeType: doc.mimeType, size: doc.size, description: doc.description, category: doc.category });
        setFormError('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormState(createEmptyForm());
        setFormError('');
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError('');
        try {
            if (editingId) {
                const existing = DataBroker.getLibraryDocument(editingId);
                if (!existing) { throw new Error('Document not found.'); }
                DataBroker.updateLibraryDocument(editingId, { ...existing, ...formState });
                showStatusMessage('Document updated.');
            } else {
                DataBroker.addLibraryDocument({
                    id: '',
                    ...formState,
                    uploadedBy: session?.user.uid ?? '',
                    uploadedAt: new Date().toISOString(),
                });
                showStatusMessage('Document record added.');
            }
            setDocs(DataBroker.getLibraryDocuments());
            setEditingId(null);
            setFormState(createEmptyForm());
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Could not save document.');
        }
    };

    const handleDelete = (id: string) => {
        DataBroker.deleteLibraryDocument(id);
        setDocs(DataBroker.getLibraryDocuments());
        if (editingId === id) { handleCancelEdit(); }
        showStatusMessage('Document removed.');
    };

    if (!session || !canRead) {
        return (
            <section className="calendar-page">
                <div className="userlist-message-card">
                    <h2>Access unavailable</h2>
                    <p>Your current rights do not allow access to the library.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="calendar-page">
            <div className="userlist-heading">
                <div>
                    <p className="eyebrow">Documents</p>
                    <h1>Library</h1>
                    <p>Browse and manage document records. File upload and download will be available once backend storage is connected.</p>
                </div>
            </div>

            {statusMessage ? <p className="profile-success" role="status">{statusMessage}</p> : null}

            <div className="calendar-toolbar">
                <input
                    className="userlist-input"
                    type="search"
                    placeholder="Search by name, description or category"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="userlist-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat === 'all' ? 'All categories' : cat}</option>
                    ))}
                </select>
            </div>

            {canWrite ? (
                <form className="calendar-form" onSubmit={handleSubmit}>
                    <input
                        className="userlist-input"
                        type="text"
                        placeholder="Document name"
                        value={formState.name}
                        onChange={(e) => setFormState((c) => ({ ...c, name: e.target.value }))}
                        required
                    />
                    <input
                        className="userlist-input"
                        type="text"
                        placeholder="Category"
                        value={formState.category}
                        onChange={(e) => setFormState((c) => ({ ...c, category: e.target.value }))}
                    />
                    <input
                        className="userlist-input"
                        type="text"
                        placeholder="MIME type (e.g. application/pdf)"
                        value={formState.mimeType}
                        onChange={(e) => setFormState((c) => ({ ...c, mimeType: e.target.value }))}
                    />
                    <input
                        className="userlist-input"
                        type="number"
                        min="0"
                        placeholder="File size in bytes"
                        value={formState.size === 0 ? '' : formState.size}
                        onChange={(e) => setFormState((c) => ({ ...c, size: Number(e.target.value) || 0 }))}
                    />
                    <input
                        className="userlist-input"
                        type="text"
                        placeholder="Description"
                        value={formState.description}
                        onChange={(e) => setFormState((c) => ({ ...c, description: e.target.value }))}
                    />
                    {formError ? <p className="login-error">{formError}</p> : null}
                    <div className="profile-actions">
                        <Button label={editingId ? 'Save document' : 'Add document record'} type="submit" onClick={() => undefined} />
                        {editingId ? (
                            <button type="button" className="userlist-secondary-button" onClick={handleCancelEdit}>Cancel</button>
                        ) : null}
                    </div>
                </form>
            ) : (
                <div className="userlist-message-card">
                    <h2>Read-only access</h2>
                    <p>Your current rights allow browsing the library but not adding or editing records.</p>
                </div>
            )}

            <div className="calendar-grid">
                {visibleDocs.length === 0 ? (
                    <p style={{ gridColumn: '1 / -1' }}>No documents match your search.</p>
                ) : visibleDocs.map((doc) => (
                    <article key={doc.id} className="dashboard-card calendar-event-card">
                        <p className="eyebrow">{doc.category || 'Uncategorised'}</p>
                        <h2>{doc.name}</h2>
                        <p>{doc.description}</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)' }}>
                            {doc.mimeType} · {formatSize(doc.size)}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)' }}>
                            Uploaded by {users.get(doc.uploadedBy) ?? doc.uploadedBy} on {formatDate(doc.uploadedAt)}
                        </p>
                        <div className="userlist-row-actions">
                            <button
                                type="button"
                                className="userlist-secondary-button"
                                title="File download requires backend storage"
                                disabled
                            >
                                Download (unavailable)
                            </button>
                            {canWrite ? (
                                <button type="button" className="userlist-secondary-button" onClick={() => handleEdit(doc)}>
                                    Edit
                                </button>
                            ) : null}
                            {canDelete ? (
                                <button type="button" className="userlist-danger-button" onClick={() => handleDelete(doc.id)}>
                                    Delete
                                </button>
                            ) : null}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
