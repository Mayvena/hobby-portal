import React from 'react';
import type { PageDefinition, RoleDefinition } from '../../dataBroker';
import { MatrixTable } from '../table/MatrixTable';

interface RolePageAccessTabProps {
    canEdit: boolean;
    pages: PageDefinition[];
    roles: RoleDefinition[];
    pageHasRole: (pageId: string, roleId: string) => boolean;
    isAdminEnforcedForPage: (pageId: string) => boolean;
    onToggle: (pageId: string, roleId: string) => void;
}

export function RolePageAccessTab({
    canEdit,
    pages,
    roles,
    pageHasRole,
    isAdminEnforcedForPage,
    onToggle,
}: RolePageAccessTabProps) {
    return (
        <>
            <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary, #666)' }}>
                Check which roles may access each page. A page with no roles checked is accessible to everyone.
                The <strong>Admin</strong> role is applied automatically whenever any other role is granted.
            </p>
            <MatrixTable
                rowHeader="Page"
                rows={pages}
                columns={roles}
                rowKey={(page) => page.id}
                columnKey={(role) => role.id}
                renderRowHeader={(page) => (
                    <div className="userrights-page-name">
                        <strong>{page.label}</strong>
                        <span>{page.id}</span>
                    </div>
                )}
                renderColumnHeader={(role) => role.label}
                renderCell={(page, role) => {
                    const checked = pageHasRole(page.id, role.id);
                    const isAdminCol = role.id === 'admin';
                    const autoEnforced = isAdminCol && isAdminEnforcedForPage(page.id);

                    return (
                        <label className="userlist-checkbox">
                            <input
                                type="checkbox"
                                checked={checked}
                                disabled={!canEdit || isAdminCol}
                                title={autoEnforced ? 'Admin is automatically granted when any role is set.' : undefined}
                                onChange={() => onToggle(page.id, role.id)}
                            />
                            {autoEnforced ? <em>auto</em> : null}
                        </label>
                    );
                }}
                emptyMessage="No pages available."
                minWidth={760}
            />
        </>
    );
}