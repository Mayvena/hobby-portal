import React from 'react';

interface MatrixTableProps<Row, Column> {
    rowHeader: React.ReactNode;
    rows: Row[];
    columns: Column[];
    rowKey: (row: Row) => string;
    columnKey: (column: Column) => string;
    renderRowHeader: (row: Row) => React.ReactNode;
    renderColumnHeader: (column: Column) => React.ReactNode;
    renderCell: (row: Row, column: Column) => React.ReactNode;
    emptyMessage: string;
    minWidth?: number;
    wrapperClassName?: string;
    tableClassName?: string;
}

export function MatrixTable<Row, Column>({
    rowHeader,
    rows,
    columns,
    rowKey,
    columnKey,
    renderRowHeader,
    renderColumnHeader,
    renderCell,
    emptyMessage,
    minWidth,
    wrapperClassName = 'common-table-wrap',
    tableClassName = 'common-table',
}: MatrixTableProps<Row, Column>) {
    return (
        <div className={wrapperClassName}>
            <table className={tableClassName} style={minWidth ? { minWidth } : undefined}>
                <thead>
                    <tr>
                        <th>{rowHeader}</th>
                        {columns.map((column) => (
                            <th key={columnKey(column)}>{renderColumnHeader(column)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={rowKey(row)}>
                            <td>{renderRowHeader(row)}</td>
                            {columns.map((column) => (
                                <td key={columnKey(column)}>{renderCell(row, column)}</td>
                            ))}
                        </tr>
                    ))}
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + 1}>{emptyMessage}</td>
                        </tr>
                    ) : null}
                </tbody>
            </table>
        </div>
    );
}