import React from 'react';
import Assets from './assets';
import { type Session, type UserProfile } from '../dataBroker';
import Calendar from './calendar';
import Finances from './finances';
import Library from './library';
import Profile from './profile';
import RolesAdmin from './rolesadmin';
import UserList from './userlist';
import UserRights from './userrights.tsx';

export interface DashboardPageRenderContext {
    activeUser: UserProfile;
    session: Session | null;
    selectedProfile: UserProfile | null;
    onLoginClick: () => void;
    onLogout: () => void;
    onSessionRefresh?: () => void;
    onUserSelect: (uid: string) => void;
    onRightsUpdated: () => void;
}

export type DashboardPageRenderer = (context: DashboardPageRenderContext) => React.ReactNode;

export const DEFAULT_PAGE_ID = 'profile';

const renderReportsPage: DashboardPageRenderer = () => (
    <section className="dashboard-panel">
        <p className="eyebrow">Access level 2+</p>
        <h2>Reports</h2>
        <p>Reporting tools are enabled for elevated accounts. Connect this section to analytics or audit widgets next.</p>
    </section>
);

export const dashboardPageRenderers: Record<string, DashboardPageRenderer> = {
    profile: ({ activeUser, selectedProfile, onSessionRefresh }) => (
        <Profile
            key={selectedProfile?.uid ?? activeUser.uid}
            user={selectedProfile}
            currentUser={activeUser}
            heading={selectedProfile?.uid === activeUser.uid ? 'My profile' : 'User profile'}
            onProfileUpdated={onSessionRefresh}
        />
    ),
    calendar: ({ session }) => <Calendar session={session} />,
    reports: renderReportsPage,
    userlist: ({ session, onLoginClick, onLogout, onSessionRefresh, onUserSelect }) => (
        <UserList
            embedded={true}
            session={session}
            onLoginClick={onLoginClick}
            onLogout={onLogout}
            onUsersChanged={onSessionRefresh}
            onUserSelect={onUserSelect}
        />
    ),
    userrights: ({ session, onRightsUpdated }) => (
        <UserRights session={session} onRightsUpdated={onRightsUpdated} />
    ),
    rolesadmin: ({ session, onRightsUpdated }) => (
        <RolesAdmin session={session} onRolesUpdated={onRightsUpdated} />
    ),
    library: ({ session }) => <Library session={session} />,
    finances: ({ session }) => <Finances session={session} />,
    assets: ({ session }) => <Assets session={session} />,
};
