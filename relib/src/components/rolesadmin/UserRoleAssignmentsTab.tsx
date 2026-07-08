import React from 'react';
import type { RoleDefinition, UserProfile } from '../../dataBroker';
import { MatrixTable } from '../table/MatrixTable';

interface UserRoleAssignmentsTabProps {
    canEdit: boolean;
    roles: RoleDefinition[];
    users: UserProfile[];
    userHasRole: (uid: string, roleId: string) => boolean;
    onToggle: (uid: string, roleId: string) => void;
}

export function UserRoleAssignmentsTab({
    canEdit,
    roles,
    users,
    userHasRole,
    onToggle,
}: UserRoleAssignmentsTabProps) {
    return (
        <>
            <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary, #666)' }}>
                Assign roles to users. Users can hold multiple roles simultaneously.
            </p>
            <MatrixTable
                rowHeader="User"
                rows={users}
                columns={[{ id: '__access__', label: 'Access' }, ...roles]}
                rowKey={(user) => user.uid}
                columnKey={(column) => column.id}
                renderRowHeader={(user) => (
                    <div className="userrights-page-name">
                        <strong>{user.name}</strong>
                        <span>{user.username}</span>
                    </div>
                )}
                renderColumnHeader={(column) => column.label}
                renderCell={(user, column) => {
                    if (column.id === '__access__') {
                        return `L${user.accessLevel}`;
                    }

                    return (
                        <label className="userlist-checkbox">
                            <input
                                type="checkbox"
                                checked={userHasRole(user.uid, column.id)}
                                disabled={!canEdit}
                                onChange={() => onToggle(user.uid, column.id)}
                            />
                        </label>
                    );
                }}
                emptyMessage="No users available."
                minWidth={760}
            />
        </>
    );
}