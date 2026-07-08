// Dashboard, displayed to the logged in user. Provides access to the components that the user has the sufficient user level to use. Displays a welcome message and a logout button.

import React, { useMemo, useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { DashboardMenu } from '../components/DashboardMenu';
import { DataBroker, type Session } from '../dataBroker';
import { dashboardPageRenderers, DEFAULT_PAGE_ID } from './dashboardPageRegistry';

interface DashboardProps {
	session: Session | null;
	onLoginClick: () => void;
	onLogout: () => void;
	onSessionRefresh?: () => void;
}

export default function Dashboard({
	session,
	onLoginClick,
	onLogout,
	onSessionRefresh,
}: DashboardProps) {
	const activeUser = session?.user;
	const pageDefinitions = useMemo(() => DataBroker.getPages(), []);
	const fallbackPageId = pageDefinitions[0]?.id ?? DEFAULT_PAGE_ID;
	const [activeView, setActiveView] = useState(fallbackPageId);
	const [rightsRevision, setRightsRevision] = useState(0);
	const [selectedProfileState, setSelectedProfileState] = useState<{
		ownerUid: string | null;
		profileUid: string | null;
	}>({
		ownerUid: activeUser?.uid ?? null,
		profileUid: activeUser?.uid ?? null,
	});

	const visibleViews = useMemo(() => {
		void rightsRevision;

		if (!activeUser) {
			return [fallbackPageId];
		}

		return pageDefinitions
			.filter((item) =>
				DataBroker.canAccessPage(activeUser, item.id, 'readOnly'),
			)
			.map((item) => item.id);
	}, [activeUser, fallbackPageId, pageDefinitions, rightsRevision]);

	const resolvedActiveView = visibleViews.includes(activeView)
		? activeView
		: (visibleViews[0] ?? fallbackPageId);
	const selectedProfileUid = selectedProfileState.ownerUid === (activeUser?.uid ?? null)
		? selectedProfileState.profileUid
		: (activeUser?.uid ?? null);

	const selectedProfile = selectedProfileUid
		? DataBroker.getUserByUid(selectedProfileUid)
		: activeUser ?? null;

	const handleUserSelect = (uid: string) => {
		setSelectedProfileState({
			ownerUid: activeUser?.uid ?? null,
			profileUid: uid,
		});
		setActiveView(DEFAULT_PAGE_ID);
	};

	const handleRightsUpdated = () => {
		setRightsRevision((current) => current + 1);
	};

	const renderPanel = () => {
		if (!activeUser) {
			return (
				<section className="dashboard-panel">
					<h2>Sign in required</h2>
					<p>You need an active session to access the dashboard.</p>
				</section>
			);
		}

		if (!visibleViews.includes(resolvedActiveView)) {
			return (
				<section className="dashboard-panel">
					<h2>Access unavailable</h2>
					<p>Your current rights do not allow access to this page.</p>
				</section>
			);
		}

		const renderer = dashboardPageRenderers[resolvedActiveView];
		const pageDefinition = pageDefinitions.find((page) => page.id === resolvedActiveView);

		if (!renderer) {
			return (
				<section className="dashboard-panel">
					<h2>{pageDefinition?.label ?? 'Page unavailable'}</h2>
					<p>This page is defined in the page table but does not yet have a dashboard renderer.</p>
				</section>
			);
		}

		return renderer({
			activeUser,
			session,
			selectedProfile,
			onLoginClick,
			onLogout,
			onSessionRefresh,
			onUserSelect: handleUserSelect,
			onRightsUpdated: handleRightsUpdated,
		});
	};

	return (
		<div className="App">
			<main className="app-shell dashboard-shell">
				<AppHeader
					title="Relib"
					subtitle="Component dashboard"
					isLoggedIn={Boolean(session)}
					username={session?.user?.username}
					onLoginClick={onLoginClick}
					onLogout={onLogout}
				/>

				<div className="dashboard-frame">
					<div className="dashboard-layout">
					<DashboardMenu
						user={activeUser ?? null}
						activeItem={resolvedActiveView}
						onSelect={setActiveView}
					/>
					<div className="dashboard-content">{renderPanel()}</div>
					</div>
				</div>
			</main>
		</div>
	);
}