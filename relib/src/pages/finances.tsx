import React, { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { DataTable, type DataTableColumn } from '../components/table/DataTable';
import { DataBroker, type FinancesConfig, type Session, type TransactionEntry, type TransactionType } from '../dataBroker';
import { useStatusMessage } from '../hooks/useStatusMessage';

interface FinancesProps {
    session: Session | null;
}

type VisibilityPreset = 'last10' | 'last50' | 'all' | 'lastMonth' | 'dateRange';
type PaginationSize = 10 | 20 | 50 | 'all';

const createEmptyTransactionForm = (): Omit<TransactionEntry, 'id' | 'createdBy'> => ({
    date: new Date().toISOString().slice(0, 10),
    type: 'expense',
    amount: 0,
    description: '',
    category: '',
});

const formatMoney = (amount: number, currency: string): string => {
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
    } catch {
        return `${amount.toFixed(2)} ${currency}`;
    }
};

const isInLastMonth = (isoDate: string): boolean => {
    const value = new Date(isoDate);
    if (Number.isNaN(value.getTime())) {
        return false;
    }
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return value >= startOfLastMonth && value < startOfCurrentMonth;
};

const sortNewestFirst = (entries: TransactionEntry[]): TransactionEntry[] =>
    [...entries].sort((left, right) => {
        const leftTime = new Date(left.date).getTime();
        const rightTime = new Date(right.date).getTime();
        if (rightTime !== leftTime) {
            return rightTime - leftTime;
        }
        return right.id.localeCompare(left.id);
    });

const matchesDateRange = (date: string, fromDate: string, toDate: string): boolean => {
    if (!fromDate || !toDate) {
        return true;
    }
    return date >= fromDate && date <= toDate;
};

const clampPage = (page: number, totalPages: number): number => {
    if (totalPages <= 0) {
        return 1;
    }
    return Math.max(1, Math.min(page, totalPages));
};

export default function Finances({ session }: FinancesProps) {
    const [config, setConfig] = useState<FinancesConfig>(() => DataBroker.getFinancesConfig());
    const [transactions, setTransactions] = useState<TransactionEntry[]>(() => sortNewestFirst(DataBroker.getTransactions()));
    const [editingId, setEditingId] = useState<string | null>(null);
    const [transactionForm, setTransactionForm] = useState(createEmptyTransactionForm());
    const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
    const [visibilityPreset, setVisibilityPreset] = useState<VisibilityPreset>('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [pageSize, setPageSize] = useState<PaginationSize>(20);
    const [page, setPage] = useState(1);
    const { statusMessage, showStatusMessage } = useStatusMessage();

    const canRead = DataBroker.canAccessPage(session?.user, 'finances', 'readOnly');
    const canWrite = DataBroker.canAccessPage(session?.user, 'finances', 'readWrite');
    const canDelete = DataBroker.canAccessPage(session?.user, 'finances', 'delete');

    const currentAmount = useMemo(
        () => transactions.reduce((sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount), 0),
        [transactions],
    );

    const filteredByType = useMemo(
        () => transactions.filter((entry) => (typeFilter === 'all' ? true : entry.type === typeFilter)),
        [transactions, typeFilter],
    );

    const visibleByPreset = useMemo(() => {
        if (visibilityPreset === 'last10') {
            return filteredByType.slice(0, 10);
        }
        if (visibilityPreset === 'last50') {
            return filteredByType.slice(0, 50);
        }
        if (visibilityPreset === 'lastMonth') {
            return filteredByType.filter((entry) => isInLastMonth(entry.date));
        }
        if (visibilityPreset === 'dateRange') {
            return filteredByType.filter((entry) => matchesDateRange(entry.date, fromDate, toDate));
        }
        return filteredByType;
    }, [filteredByType, visibilityPreset, fromDate, toDate]);

    const totalItems = visibleByPreset.length;
    const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
    const activePage = clampPage(page, totalPages);
    const transactionColumns: DataTableColumn<TransactionEntry>[] = [
        { key: 'date', header: 'Date', cell: (entry) => entry.date },
        { key: 'type', header: 'Type', cell: (entry) => entry.type },
        { key: 'category', header: 'Category', cell: (entry) => entry.category },
        { key: 'description', header: 'Description', cell: (entry) => entry.description },
        {
            key: 'amount',
            header: 'Amount',
            align: 'right',
            cell: (entry) => formatMoney(entry.type === 'expense' ? -entry.amount : entry.amount, config.currency || 'EUR'),
        },
        {
            key: 'actions',
            header: 'Actions',
            cell: (entry) => (
                <div className="userlist-row-actions">
                    {canWrite ? (
                        <button type="button" className="userlist-secondary-button" onClick={() => handleEdit(entry)}>
                            Edit
                        </button>
                    ) : null}
                    {canDelete ? (
                        <button type="button" className="userlist-danger-button" onClick={() => handleDelete(entry.id)}>
                            Delete
                        </button>
                    ) : null}
                </div>
            ),
        },
    ];

    const pagedItems = useMemo(() => {
        if (pageSize === 'all') {
            return visibleByPreset;
        }
        const start = (activePage - 1) * pageSize;
        return visibleByPreset.slice(start, start + pageSize);
    }, [visibleByPreset, pageSize, activePage]);

    const refreshTransactions = (): void => {
        setTransactions(sortNewestFirst(DataBroker.getTransactions()));
    };

    const handleConfigChange = (key: keyof FinancesConfig, value: string): void => {
        if (!canWrite) {
            return;
        }
        const next = DataBroker.updateFinancesConfig({ [key]: value });
        setConfig(next);
    };

    const handleEdit = (entry: TransactionEntry): void => {
        if (!canWrite) {
            return;
        }
        setEditingId(entry.id);
        setTransactionForm({
            date: entry.date,
            type: entry.type,
            amount: entry.amount,
            description: entry.description,
            category: entry.category,
        });
    };

    const handleCancelEdit = (): void => {
        setEditingId(null);
        setTransactionForm(createEmptyTransactionForm());
    };

    const handleTransactionSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (!canWrite || !session?.user) {
            return;
        }

        if (editingId) {
            const existing = DataBroker.getTransaction(editingId);
            if (!existing) {
                showStatusMessage('Transaction not found.');
                return;
            }
            DataBroker.updateTransaction(editingId, {
                ...existing,
                ...transactionForm,
                amount: Number(transactionForm.amount),
            });
            showStatusMessage('Transaction updated.');
        } else {
            DataBroker.addTransaction({
                id: '',
                createdBy: session.user.uid,
                ...transactionForm,
                amount: Number(transactionForm.amount),
            });
            showStatusMessage('Transaction added.');
        }

        refreshTransactions();
        handleCancelEdit();
        setPage(1);
    };

    const handleDelete = (id: string): void => {
        if (!canDelete) {
            return;
        }
        DataBroker.deleteTransaction(id);
        refreshTransactions();
        showStatusMessage('Transaction deleted.');
        if (editingId === id) {
            handleCancelEdit();
        }
    };

    const handlePresetChange = (preset: VisibilityPreset): void => {
        setVisibilityPreset(preset);
        setPage(1);
    };

    const handlePageSizeChange = (nextSize: PaginationSize): void => {
        setPageSize(nextSize);
        setPage(1);
    };

    if (!session || !canRead) {
        return (
            <section className="calendar-page">
                <div className="userlist-message-card">
                    <h2>Access unavailable</h2>
                    <p>Your current rights do not allow access to the finances page.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="calendar-page">
            <div className="userlist-heading">
                <div>
                    <p className="eyebrow">Finance Operations</p>
                    <h1>Finances</h1>
                    <p>Track incoming and outgoing transactions with date, type, and visibility filters.</p>
                </div>
            </div>

            {statusMessage ? <p className="profile-success" role="status">{statusMessage}</p> : null}

            <div className="dashboard-card" style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <p className="eyebrow">Current Amount</p>
                        <h2 style={{ margin: 0 }}>{formatMoney(currentAmount, config.currency || 'EUR')}</h2>
                    </div>
                    <div>
                        <label className="profile-meta-label" htmlFor="currency">Currency</label>
                        <input
                            id="currency"
                            className="userlist-input"
                            value={config.currency}
                            onChange={(event) => handleConfigChange('currency', event.target.value)}
                            disabled={!canWrite}
                            style={{ minWidth: '120px' }}
                        />
                    </div>
                </div>

                <div className="calendar-form" style={{ padding: 0, border: '0', boxShadow: 'none', background: 'transparent', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                    <input
                        className="userlist-input"
                        type="text"
                        placeholder="IBAN"
                        value={config.iban}
                        onChange={(event) => handleConfigChange('iban', event.target.value)}
                        disabled={!canWrite}
                    />
                    <input
                        className="userlist-input"
                        type="text"
                        placeholder="PayPal"
                        value={config.paypal}
                        onChange={(event) => handleConfigChange('paypal', event.target.value)}
                        disabled={!canWrite}
                    />
                    <input
                        className="userlist-input"
                        type="text"
                        placeholder="Revolut"
                        value={config.revolut}
                        onChange={(event) => handleConfigChange('revolut', event.target.value)}
                        disabled={!canWrite}
                    />
                </div>
            </div>

            <div className="calendar-toolbar" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <select
                    className="userlist-select"
                    value={visibilityPreset}
                    onChange={(event) => handlePresetChange(event.target.value as VisibilityPreset)}
                >
                    <option value="last10">Last 10</option>
                    <option value="last50">Last 50</option>
                    <option value="all">All</option>
                    <option value="lastMonth">Last month</option>
                    <option value="dateRange">From date to date</option>
                </select>

                <select
                    className="userlist-select"
                    value={typeFilter}
                    onChange={(event) => { setTypeFilter(event.target.value as 'all' | TransactionType); setPage(1); }}
                >
                    <option value="all">All types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>

                <select
                    className="userlist-select"
                    value={String(pageSize)}
                    onChange={(event) => {
                        const next = event.target.value;
                        handlePageSizeChange(next === 'all' ? 'all' : Number(next) as PaginationSize);
                    }}
                >
                    <option value="10">10 / page</option>
                    <option value="20">20 / page</option>
                    <option value="50">50 / page</option>
                    <option value="all">All / page</option>
                </select>

                {visibilityPreset === 'dateRange' ? (
                    <>
                        <input
                            className="userlist-input"
                            type="date"
                            value={fromDate}
                            onChange={(event) => { setFromDate(event.target.value); setPage(1); }}
                        />
                        <input
                            className="userlist-input"
                            type="date"
                            value={toDate}
                            onChange={(event) => { setToDate(event.target.value); setPage(1); }}
                        />
                        <div />
                    </>
                ) : null}
            </div>

            {canWrite ? (
                <form className="calendar-form" onSubmit={handleTransactionSubmit}>
                    <input
                        className="userlist-input"
                        type="date"
                        value={transactionForm.date}
                        onChange={(event) => setTransactionForm((current) => ({ ...current, date: event.target.value }))}
                        required
                    />
                    <select
                        className="userlist-select"
                        value={transactionForm.type}
                        onChange={(event) => setTransactionForm((current) => ({ ...current, type: event.target.value as TransactionType }))}
                    >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                    <input
                        className="userlist-input"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Amount"
                        value={transactionForm.amount}
                        onChange={(event) => setTransactionForm((current) => ({ ...current, amount: Number(event.target.value) || 0 }))}
                        required
                    />
                    <input
                        className="userlist-input"
                        type="text"
                        placeholder="Category"
                        value={transactionForm.category}
                        onChange={(event) => setTransactionForm((current) => ({ ...current, category: event.target.value }))}
                        required
                    />
                    <input
                        className="userlist-input"
                        type="text"
                        placeholder="Description"
                        value={transactionForm.description}
                        onChange={(event) => setTransactionForm((current) => ({ ...current, description: event.target.value }))}
                        required
                    />
                    <div className="profile-actions">
                        <Button label={editingId ? 'Save transaction' : 'Add transaction'} type="submit" onClick={() => undefined} />
                        {editingId ? (
                            <button type="button" className="userlist-secondary-button" onClick={handleCancelEdit}>Cancel</button>
                        ) : null}
                    </div>
                </form>
            ) : (
                <div className="userlist-message-card">
                    <h2>Read-only access</h2>
                    <p>You can view finance information but cannot edit payment channels or transactions.</p>
                </div>
            )}

            <DataTable
                columns={transactionColumns}
                rows={pagedItems}
                rowKey={(entry) => entry.id}
                emptyMessage="No transactions match the current filters."
                minWidth={760}
            />

            <div className="profile-actions" style={{ justifyContent: 'space-between' }}>
                <p style={{ margin: 0, alignSelf: 'center' }}>
                    Showing {pagedItems.length} of {totalItems} transactions
                </p>
                {pageSize === 'all' ? null : (
                    <div className="userlist-row-actions">
                        <button
                            type="button"
                            className="userlist-secondary-button"
                            disabled={activePage <= 1}
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                        >
                            Previous
                        </button>
                        <span style={{ alignSelf: 'center' }}>Page {activePage} of {totalPages}</span>
                        <button
                            type="button"
                            className="userlist-secondary-button"
                            disabled={activePage >= totalPages}
                            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
