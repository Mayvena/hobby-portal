// Application header section with title and a secondary header bar.

import React from 'react';
import { HeaderBar } from './HeaderBar';
import { LoginStatus } from './LoginStatus';

interface AppHeaderProps {
	title?: string;
	subtitle?: string;
	isLoggedIn: boolean;
	username?: string;
	onLoginClick: () => void;
	onLogout: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
	title = 'Relib',
	subtitle = 'Reusable components playground',
	isLoggedIn,
	username,
	onLoginClick,
	onLogout,
}) => {
	return (
		<header className="app-header">
			<div className="app-header-main">
				<h1>{title}</h1>
				<p>{subtitle}</p>
			</div>
			<HeaderBar>
				<LoginStatus
					isLoggedIn={isLoggedIn}
					username={username}
					onLoginClick={onLoginClick}
					onLogout={onLogout}
				/>
			</HeaderBar>
		</header>
	);
};
