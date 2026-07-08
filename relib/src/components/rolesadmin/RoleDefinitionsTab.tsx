import React from 'react';
import type { PageDefinition, RoleDefinition, RolePageAccess } from '../../dataBroker';
import { DataTable, type DataTableColumn } from '../table/DataTable';

interface RoleDefinitionsTabProps {
    canEdit: boolean;
    canDelete: boolean;
    editingRoleId: string | null;
    roleForm: RoleDefinition;
    formError: string;
    roles: RoleDefinition[];
    pages: PageDefinition[];
    rolePageAccess: RolePageAccess[];
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onFieldChange: (field: keyof RoleDefinition, value: string) => void;
    onCancelEdit: () => void;
    onEditRole: (role: RoleDefinition) => void;
    onDeleteRole: (roleId: string) => void;
}

export function RoleDefinitionsTab({
    canEdit,
    canDelete,
    editingRoleId,
    roleForm,
    formError,
    roles,
    pages,
    rolePageAccess,
    onSubmit,
    onFieldChange,
    onCancelEdit,
    onEditRole,
    onDeleteRole,
}: RoleDefinitionsTabProps) {
    const columns: DataTableColumn<RoleDefinition>[] = [
        {
            key: 'id',
            header: 'ID',
            cell: (role) => <code>{role.id}</code>,
        },
        {
            key: 'label',
            header: 'Label',
            cell: (role) => role.label,
        },
        {
            key: 'description',
            header: 'Description',
            cell: (role) => role.description,
        },
        {
            key: 'pages',
            header: 'Pages',
            cell: (role) => {
                const assignedPages = pages.filter((page) =>
                    rolePageAccess.some((mapping) => mapping.roleId === role.id && mapping.pageId === page.id),
                );

                return assignedPages.length > 0
                    ? assignedPages.map((page) => page.label).join(', ')
                    : <em style={{ color: 'var(--color-text-secondary, #666)' }}>All pages (unrestricted)</em>;
            },
        },
        {
            key: 'actions',
            header: 'Actions',
            cell: (role) => (
                <div className="userlist-row-actions">
                    {canEdit ? (
                        <button type="button" className="userlist-secondary-button" onClick={() => onEditRole(role)}>
                            Edit
                        </button>
                    ) : null}
                    {canDelete && role.id !== 'admin' ? (
                        <button type="button" className="userlist-danger-button" onClick={() => onDeleteRole(role.id)}>
                            Delete
                        </button>
                    ) : null}
                </div>
            ),
        },
    ];

    return (
        <>
            {canEdit && (
                <form className="userlist-form" onSubmit={onSubmit}>
                    <input
                        className="userlist-input"
                        type="text"
                        placeholder="Role ID (e.g. manager)"
                        value={roleForm.id}
                        disabled={Boolean(editingRoleId)}
                        onChange={(event) => onFieldChange('id', event.target.value)}
                        required
                    />
                    <input
                        className="userlist-input"
                        type="text"
                        placeholder="Label (e.g. Manager)"
                        value={roleForm.label}
                        onChange={(event) => onFieldChange('label', event.target.value)}
                        required
                    />
                    <input
                        className="userlist-input"
                        type="text"
                        placeholder="Description"
                        value={roleForm.description}
                        onChange={(event) => onFieldChange('description', event.target.value)}
                    />
                    {formError ? <p className="login-error userlist-form-error">{formError}</p> : null}
                    <div className="userlist-form-actions">
                        <button type="submit" className="main-login-button">
                            {editingRoleId ? 'Save role' : 'Add role'}
                        </button>
                        {editingRoleId ? (
                            <button
                                type="button"
                                className="userlist-secondary-button"
                                onClick={onCancelEdit}
                            >
                                Cancel
                            </button>
                        ) : null}
                    </div>
                </form>
            )}

            <DataTable
                columns={columns}
                rows={roles}
                rowKey={(role) => role.id}
                emptyMessage="No roles available."
                minWidth={760}
            />
        </>
    );
}