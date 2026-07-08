// A component, located in the header bar, that displays the current login status of the user (logged in or logged out) and provides a button to log in or log out.

import React from 'react';
import { Button } from './Button';

interface LoginStatusProps {
	isLoggedIn: boolean;
	username?: string;
	onLoginClick: () => void;
	onLogout: () => void;
}

export const LoginStatus: React.FC<LoginStatusProps> = ({
	isLoggedIn,
	username,
	onLoginClick,
	onLogout,
}) => {
	return (
		<div className="login-status" aria-live="polite">
			<span className="login-status-text">
				{isLoggedIn ? `Logged in as ${username}` : 'Logged out'}
			</span>

			{isLoggedIn ? (
				<Button label="Logout" onClick={onLogout} />
			) : (
				<Button label="Login" onClick={onLoginClick} />
			)}
		</div>
	);
};

