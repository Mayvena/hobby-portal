import React, { useMemo, useState } from 'react';
import { DataBroker, type RoleDefinition, type Session } from '../dataBroker';
import { RoleDefinitionsTab } from '../components/rolesadmin/RoleDefinitionsTab';
import { RolePageAccessTab } from '../components/rolesadmin/RolePageAccessTab';
import { UserRoleAssignmentsTab } from '../components/rolesadmin/UserRoleAssignmentsTab';
import { useStatusMessage } from '../hooks/useStatusMessage';

interface RolesAdminProps {
    session: Session | null;
    onRolesUpdated?: () => void;
}

type ActiveTab = 'roles' | 'pageAccess' | 'userAssignments';

const createEmptyRole = (): RoleDefinition => ({ id: '', label: '', description: '' });

export default function RolesAdmin({ session, onRolesUpdated = () => {} }: RolesAdminProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('roles');
    const [roles, setRoles] = useState<RoleDefinition[]>(() => DataBroker.getRoles());
    const [rolePageAccess, setRolePageAccess] = useState(() => DataBroker.getRolePageAccess());
    const [userRoleMappings, setUserRoleMappings] = useState(() => DataBroker.getUserRoleMappings());
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [roleForm, setRoleForm] = useState<RoleDefinition>(createEmptyRole());
    const [formError, setFormError] = useState('');
    const { statusMessage, showStatusMessage } = useStatusMessage();

    const pages = useMemo(() => DataBroker.getPages(), []);
    const users = useMemo(() => DataBroker.getUsers(), []);

    const canView = DataBroker.canAccessPage(session?.user, 'rolesadmin', 'readOnly');
    const canEdit = DataBroker.canAccessPage(session?.user, 'rolesadmin', 'readWrite');
    const canDelete = DataBroker.canAccessPage(session?.user, 'rolesadmin', 'delete');

    const reloadAll = () => {
        setRoles(DataBroker.getRoles());
        setRolePageAccess(DataBroker.getRolePageAccess());
        setUserRoleMappings(DataBroker.getUserRoleMappings());
        onRolesUpdated();
    };

    // ── Role definitions ────────────────────────────────────────────────────

    const handleRoleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError('');
        try {
            if (editingRoleId) {
                DataBroker.updateRole(editingRoleId, roleForm);
            } else {
                DataBroker.addRole(roleForm);
            }
            reloadAll();
            setEditingRoleId(null);
            setRoleForm(createEmptyRole());
            showStatusMessage(editingRoleId ? 'Role updated.' : 'Role added.');
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Could not save role.');
        }
    };

    const handleEditRole = (role: RoleDefinition) => {
        setEditingRoleId(role.id);
        setRoleForm({ ...role });
        setFormError('');
    };

    const handleCancelRoleEdit = () => {
        setEditingRoleId(null);
        setRoleForm(createEmptyRole());
        setFormError('');
    };

    const handleDeleteRole = (id: string) => {
        try {
            DataBroker.deleteRole(id);
            reloadAll();
            if (editingRoleId === id) { setEditingRoleId(null); setRoleForm(createEmptyRole()); }
            showStatusMessage('Role deleted.');
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Could not delete role.');
        }
    };

    // ── Role-page access matrix ─────────────────────────────────────────────

    const pageHasRole = (pageId: string, roleId: string) =>
        rolePageAccess.some((m) => m.pageId === pageId && m.roleId === roleId);

    const isAdminEnforcedForPage = (pageId: string) =>
        rolePageAccess.some((m) => m.pageId === pageId && m.roleId !== 'admin');

    const handlePageRoleToggle = (pageId: string, roleId: string) => {
        if (!canEdit) { return; }
        if (roleId === 'admin') { return; } // admin is auto-managed
        const currentRoles = rolePageAccess.filter((m) => m.pageId === pageId).map((m) => m.roleId);
        if (currentRoles.includes(roleId)) {
            DataBroker.removeRoleFromPage(pageId, roleId);
        } else {
            DataBroker.addRoleToPage(pageId, roleId);
        }
        setRolePageAccess(DataBroker.getRolePageAccess());
        showStatusMessage('Page access updated.');
    };

    // ── User-role assignment matrix ─────────────────────────────────────────

    const userHasRole = (uid: string, roleId: string) =>
        userRoleMappings.some((m) => m.uid === uid && m.roleId === roleId);

    const handleUserRoleToggle = (uid: string, roleId: string) => {
        if (!canEdit) { return; }
        if (userHasRole(uid, roleId)) {
            DataBroker.removeUserRole(uid, roleId);
        } else {
            DataBroker.addUserRole(uid, roleId);
        }
        setUserRoleMappings(DataBroker.getUserRoleMappings());
        showStatusMessage('User role updated.');
    };

    if (!session) {
        return (
            <section className="userrights-page">
                <div className="userlist-message-card">
                    <h2>Sign in required</h2>
                    <p>You need an active session to manage roles.</p>
                </div>
            </section>
        );
    }

    if (!canView) {
        return (
            <section className="userrights-page">
                <div className="userlist-message-card">
                    <h2>Restricted page</h2>
                    <p>Your assigned roles and rights do not allow access to role administration.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="userrights-page">
            <div className="userlist-heading">
                <div>
                    <p className="eyebrow">Administration</p>
                    <h1>Role administration</h1>
                    <p>Define roles, assign page access per role, and assign roles to users.</p>
                </div>
            </div>

            {statusMessage ? <p className="profile-success" role="status">{statusMessage}</p> : null}

            <div className="calendar-view-switcher" style={{ marginBottom: '1.5rem' }}>
                {(['roles', 'pageAccess', 'userAssignments'] as ActiveTab[]).map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        className={`userlist-secondary-button${activeTab === tab ? ' calendar-view-active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'roles' ? 'Role definitions' : tab === 'pageAccess' ? 'Page access' : 'User assignments'}
                    </button>
                ))}
            </div>

            {activeTab === 'roles' && (
                <RoleDefinitionsTab
                    canEdit={canEdit}
                    canDelete={canDelete}
                    editingRoleId={editingRoleId}
                    roleForm={roleForm}
                    formError={formError}
                    roles={roles}
                    pages={pages}
                    rolePageAccess={rolePageAccess}
                    onSubmit={handleRoleSubmit}
                    onFieldChange={(field, value) => setRoleForm((current) => ({ ...current, [field]: value }))}
                    onCancelEdit={handleCancelRoleEdit}
                    onEditRole={handleEditRole}
                    onDeleteRole={handleDeleteRole}
                />
            )}

            {activeTab === 'pageAccess' && (
                <RolePageAccessTab
                    canEdit={canEdit}
                    pages={pages}
                    roles={roles}
                    pageHasRole={pageHasRole}
                    isAdminEnforcedForPage={isAdminEnforcedForPage}
                    onToggle={handlePageRoleToggle}
                />
            )}

            {activeTab === 'userAssignments' && (
                <UserRoleAssignmentsTab
                    canEdit={canEdit}
                    roles={roles}
                    users={users}
                    userHasRole={userHasRole}
                    onToggle={handleUserRoleToggle}
                />
            )}
        </section>
    );
}
