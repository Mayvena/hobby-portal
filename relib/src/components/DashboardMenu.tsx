// A vertical menu component that displays a list of links to the different components available in the application. The menu is displayed on the left side of the screen and can be collapsed or expanded. The menu items are displayed based on the user's access level. The menu is used in the dashboard page and is only visible to logged in users.

import React, { useMemo, useState } from 'react';
import { DataBroker, type PageDefinition, type UserProfile } from '../dataBroker';

export type DashboardMenuItem = PageDefinition;

interface DashboardMenuProps {
	user: UserProfile | null;
	activeItem: string;
	onSelect: (itemId: string) => void;
}

export const DashboardMenu: React.FC<DashboardMenuProps> = ({
	user,
	activeItem,
	onSelect,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(false);

	const visibleItems = useMemo(
		() =>
			DataBroker.getPages().filter((item) => {
				const hasRights = DataBroker.canAccessPage(user, item.id, 'readOnly');
				return hasRights;
			}),
		[user],
	);

	return (
		<aside className={`dashboard-menu${isCollapsed ? ' is-collapsed' : ''}`}>
			<div className="dashboard-menu-header">
				<h2>Dashboard</h2>
				<button
					type="button"
					className="dashboard-menu-toggle"
					onClick={() => setIsCollapsed((current) => !current)}
				>
					{isCollapsed ? 'Expand' : 'Collapse'}
				</button>
			</div>

			<nav aria-label="Dashboard sections">
				<ul className="dashboard-menu-list">
					{visibleItems.map((item) => (
						<li key={item.id}>
							<button
								type="button"
								className={`dashboard-menu-item${activeItem === item.id ? ' is-active' : ''}`}
								aria-current={activeItem === item.id ? 'page' : undefined}
								aria-label={item.label}
								title={item.label}
								onClick={() => onSelect(item.id)}
							>
								{isCollapsed ? item.label.slice(0, 1) : item.label}
							</button>
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
};