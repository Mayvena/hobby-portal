import React from 'react';

type TableAlign = 'left' | 'center' | 'right';

export interface DataTableColumn<Row> {
    key: string;
    header: React.ReactNode;
    cell: (row: Row) => React.ReactNode;
    align?: TableAlign;
    headerClassName?: string;
    cellClassName?: string | ((row: Row) => string | undefined);
    sortable?: boolean;
    sortDirection?: 'asc' | 'desc' | null;
    onSort?: () => void;
}

interface DataTableProps<Row> {
    columns: DataTableColumn<Row>[];
    rows: Row[];
    rowKey: (row: Row) => string;
    emptyMessage: string;
    minWidth?: number;
    wrapperClassName?: string;
    tableClassName?: string;
}

const alignClassName = (align?: TableAlign): string | undefined => {
    if (!align) {
        return undefined;
    }

    return `common-table-cell-${align}`;
};

const joinClassNames = (...parts: Array<string | undefined>): string | undefined => {
    const value = parts.filter(Boolean).join(' ');
    return value.length > 0 ? value : undefined;
};

export function DataTable<Row>({
    columns,
    rows,
    rowKey,
    emptyMessage,
    minWidth,
    wrapperClassName = 'common-table-wrap',
    tableClassName = 'common-table',
}: DataTableProps<Row>) {
    return (
        <div className={wrapperClassName}>
            <table className={tableClassName} style={minWidth ? { minWidth } : undefined}>
                <thead>
                    <tr>
                        {columns.map((column) => {
                            const ariaSort = column.sortable
                                ? (column.sortDirection ?? 'none')
                                : undefined;

                            return (
                                <th
                                    key={column.key}
                                    className={joinClassNames(column.headerClassName, alignClassName(column.align))}
                                    aria-sort={ariaSort}
                                >
                                    {column.sortable && column.onSort ? (
                                        <button type="button" className="common-table-sort-button" onClick={column.onSort}>
                                            {column.header}
                                        </button>
                                    ) : (
                                        column.header
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={rowKey(row)}>
                            {columns.map((column) => {
                                const columnCellClassName = typeof column.cellClassName === 'function'
                                    ? column.cellClassName(row)
                                    : column.cellClassName;

                                return (
                                    <td
                                        key={column.key}
                                        className={joinClassNames(columnCellClassName, alignClassName(column.align))}
                                    >
                                        {column.cell(row)}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length}>{emptyMessage}</td>
                        </tr>
                    ) : null}
                </tbody>
            </table>
        </div>
    );
}