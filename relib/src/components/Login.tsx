// Login dialogue component, contains a form with username and password fields, and a submit button. It uses the TextField and Button components.

import React, { useState } from 'react';
import { TextField } from './TextField';
import { Button } from './Button';
import { Dialogue } from './Dialogue';

interface LoginProps {
	onClose: () => void;
	onLogin?: (credentials: { username: string; password: string }) => string | void;
}

export const Login: React.FC<LoginProps> = ({ onClose, onLogin }) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!username.trim() || !password.trim()) {
			setError('Enter both a username and password.');
			return;
		}

		setError('');
		const loginError = onLogin?.({ username: username.trim(), password });
		if (typeof loginError === 'string') {
			setError(loginError);
		}
	};

	return (
		<Dialogue
			title="Login"
			onClose={onClose}
			useDimOverlay={true}
			content={
				<form className="login-form" onSubmit={handleSubmit}>
					<TextField
						label="Username"
						value={username}
						onChange={(event) => setUsername(event.target.value)}
					/>
					<TextField
						label="Password"
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
					/>
					{error ? <p className="login-error">{error}</p> : null}
					<div className="login-actions">
						<Button label="Sign in" type="submit" onClick={() => undefined} />
					</div>
				</form>
			}
		/>
	);
};
