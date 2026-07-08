// A profile page for the user. Allows change of user details. 

import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Dialogue } from '../components/Dialogue';
import { DataBroker, type UserProfile } from '../dataBroker';

interface ProfileProps {
	user: UserProfile | null;
	currentUser: UserProfile | null;
	heading?: string;
	onProfileUpdated?: () => void;
}

type ProfileFormState = {
	name: string;
	age: string;
	email: string;
	username: string;
	accessLevel: '1' | '2' | '3';
	roleIds: string[];
	password: string;
	confirmPassword: string;
};

type PendingProfileUpdate = UserProfile & { password?: string };

const toFormState = (user: UserProfile): ProfileFormState => ({
	name: user.name,
	age: String(user.age),
	email: user.email,
	username: user.username,
	accessLevel: String(user.accessLevel) as '1' | '2' | '3',
	roleIds: [...user.roleIds],
	password: '',
	confirmPassword: '',
});

export default function Profile({
	user,
	currentUser,
	heading = 'Profile',
	onProfileUpdated = () => {},
}: ProfileProps) {
	const [formState, setFormState] = useState<ProfileFormState | null>(
		user ? toFormState(user) : null,
	);
	const [formError, setFormError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [pendingProfile, setPendingProfile] = useState<PendingProfileUpdate | null>(null);

	useEffect(() => {
		if (!successMessage) {
			return undefined;
		}

		const timeoutId = window.setTimeout(() => {
			setSuccessMessage('');
		}, 3000);

		return () => window.clearTimeout(timeoutId);
	}, [successMessage]);

	if (!user) {
		return (
			<section className="dashboard-panel">
				<h2>Profile unavailable</h2>
				<p>Sign in to view your profile details.</p>
			</section>
		);
	}

	const isOwnProfile = currentUser?.uid === user.uid;
	const availableRoles = DataBroker.getRoles();
	const hasProfileWriteAccess = DataBroker.canAccessPage(currentUser, 'profile', 'readWrite');
	const canEditProfile =
		Boolean(currentUser) && hasProfileWriteAccess && (isOwnProfile || DataBroker.userHasRole(currentUser, 'admin'));
	const canEditAccessLevel = DataBroker.userHasRole(currentUser, 'admin') && hasProfileWriteAccess;
	const canManageRoles = DataBroker.userHasRole(currentUser, 'admin') && hasProfileWriteAccess;

	const commitProfileUpdate = (nextProfile: PendingProfileUpdate) => {
		try {
			DataBroker.updateUser(user.uid, nextProfile);
			onProfileUpdated();
			setFormError('');
			setSuccessMessage('Profile updated successfully.');
			setFormState((current) =>
				current
					? {
						...current,
						password: '',
						confirmPassword: '',
					}
					: current,
			);
			setIsConfirmOpen(false);
			setPendingProfile(null);
		} catch (error) {
			setFormError(error instanceof Error ? error.message : 'Unable to update profile.');
			setSuccessMessage('');
			setIsConfirmOpen(false);
			setPendingProfile(null);
		}
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!formState) {
			return;
		}

		setFormError('');
		setSuccessMessage('');

		if (formState.password && formState.password !== formState.confirmPassword) {
			setFormError('Password confirmation does not match.');
			return;
		}

		const nextProfile: PendingProfileUpdate = {
			...user,
			name: formState.name.trim(),
			age: Number(formState.age),
			email: formState.email.trim(),
			username: formState.username.trim(),
			accessLevel: canEditAccessLevel
				? (Number(formState.accessLevel) as 1 | 2 | 3)
				: user.accessLevel,
			roleIds: canManageRoles ? [...formState.roleIds] : [...user.roleIds],
			password: formState.password.trim() || undefined,
		};

		const roleSelectionChanged =
			nextProfile.roleIds.length !== user.roleIds.length ||
			nextProfile.roleIds.some((roleId) => !user.roleIds.includes(roleId));

		if (
			isOwnProfile &&
			((canEditAccessLevel && nextProfile.accessLevel !== user.accessLevel) ||
				(canManageRoles && roleSelectionChanged))
		) {
			setPendingProfile(nextProfile);
			setIsConfirmOpen(true);
			return;
		}

		commitProfileUpdate(nextProfile);
	};

	return (
		<section className="dashboard-panel profile-page">
			<div className="profile-header-block">
				<p className="eyebrow">Account view</p>
				<h1>{heading}</h1>
			</div>
			<div className="profile-grid">
				<article className="dashboard-card profile-card">
					<p className="eyebrow">Account</p>
					<form className="profile-form" onSubmit={handleSubmit}>
						<label className="profile-field">
							<span>Name</span>
							<input
								className="userlist-input"
								type="text"
								value={formState?.name ?? ''}
								onChange={(event) =>
									setFormState((current) =>
										current ? { ...current, name: event.target.value } : current,
									)
								}
								disabled={!canEditProfile}
								required
							/>
						</label>
						<label className="profile-field">
							<span>Username</span>
							<input
								className="userlist-input"
								type="text"
								value={formState?.username ?? ''}
								onChange={(event) =>
									setFormState((current) =>
										current ? { ...current, username: event.target.value } : current,
									)
								}
								disabled={!canEditProfile}
								required
							/>
						</label>
						<label className="profile-field">
							<span>Email</span>
							<input
								className="userlist-input"
								type="email"
								value={formState?.email ?? ''}
								onChange={(event) =>
									setFormState((current) =>
										current ? { ...current, email: event.target.value } : current,
									)
								}
								disabled={!canEditProfile}
								required
							/>
						</label>
						<label className="profile-field">
							<span>Age</span>
							<input
								className="userlist-input"
								type="number"
								min="1"
								value={formState?.age ?? ''}
								onChange={(event) =>
									setFormState((current) =>
										current ? { ...current, age: event.target.value } : current,
									)
								}
								disabled={!canEditProfile}
								required
							/>
						</label>
						<label className="profile-field">
							<span>New password</span>
							<input
								className="userlist-input"
								type="password"
								value={formState?.password ?? ''}
								onChange={(event) =>
									setFormState((current) =>
										current ? { ...current, password: event.target.value } : current,
									)
								}
								disabled={!canEditProfile}
								placeholder="Leave blank to keep current password"
							/>
						</label>
						<label className="profile-field">
							<span>Confirm password</span>
							<input
								className="userlist-input"
								type="password"
								value={formState?.confirmPassword ?? ''}
								onChange={(event) =>
									setFormState((current) =>
										current
											? { ...current, confirmPassword: event.target.value }
											: current,
									)
								}
								disabled={!canEditProfile}
								placeholder="Re-enter new password"
							/>
						</label>
						{formError ? <p className="login-error">{formError}</p> : null}
						{successMessage ? <p className="profile-success" role="status">{successMessage}</p> : null}
						{canEditProfile ? (
							<div className="profile-actions">
								<Button label="Save profile" type="submit" onClick={() => undefined} />
							</div>
						) : (
							<p>You do not have permission to edit this profile.</p>
						)}
					</form>
				</article>
				<article className="dashboard-card profile-card">
					<p className="eyebrow">Security</p>
					<div className="profile-security-list">
						<div>
							<span className="profile-meta-label">UID</span>
							<h2>{user.uid}</h2>
						</div>
						<label className="profile-field">
							<span>Access level</span>
							{canEditAccessLevel ? (
								<select
									className="userlist-select"
									value={formState?.accessLevel ?? '1'}
									onChange={(event) =>
										setFormState((current) =>
											current
												? {
													...current,
													accessLevel: event.target.value as '1' | '2' | '3',
												}
												: current,
										)
									}
								>
									<option value="1">Access level 1</option>
									<option value="2">Access level 2</option>
									<option value="3">Access level 3</option>
								</select>
							) : (
								<p>Access level {user.accessLevel}</p>
							)}
						</label>
						<div>
							<span className="profile-meta-label">Roles</span>
							{canManageRoles ? (
								<div className="profile-security-list">
									{availableRoles.map((role) => (
										<label key={role.id} className="userlist-checkbox">
											<input
												type="checkbox"
												checked={formState?.roleIds.includes(role.id) ?? false}
												onChange={(event) =>
													setFormState((current) => {
														if (!current) {
															return current;
														}

														const nextRoleIds = event.target.checked
															? [...current.roleIds, role.id]
															: current.roleIds.filter((roleId) => roleId !== role.id);

														return {
															...current,
															roleIds: [...new Set(nextRoleIds)].sort(),
														};
													})
												}
											/>
											{role.label}
										</label>
									))}
								</div>
							) : (
								<p>{DataBroker.getUserRoleLabels(user).join(', ') || 'No roles assigned.'}</p>
							)}
						</div>
					</div>
				</article>
			</div>
			{isConfirmOpen && pendingProfile ? (
				<Dialogue
					title="Confirm access change"
					onClose={() => {
						setIsConfirmOpen(false);
						setPendingProfile(null);
					}}
					useDimOverlay={true}
					content={
						<div className="profile-confirmation">
							<p>
								Changing your own access level or roles may remove access to parts of the dashboard,
								including the current page. Do you want to continue?
							</p>
							<div className="profile-actions">
								<Button
									label="Cancel"
									onClick={() => {
										setIsConfirmOpen(false);
										setPendingProfile(null);
									}}
								/>
								<Button label="Confirm change" onClick={() => commitProfileUpdate(pendingProfile)} />
							</div>
						</div>
					}
				/>
			) : null}
		</section>
	);
}