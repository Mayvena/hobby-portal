// A list of all users in the system. Displays a table of users with their details. Allows the admin to add, edit, and delete users. The user can also filter the users by access level. Visible only to admin users. The user list is displayed in a table view, with the ability to sort by column. The user can also search for users by name or username. 

import { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { DataTable } from '../components/table/DataTable';
import { DataBroker } from '../dataBroker';

const createEmptyForm = () => ({
	uid: '',
	name: '',
	age: '18',
	email: '',
	username: '',
	accessLevel: '1',
	roleIds: [],
});

const sortUsers = (users, sortConfig) => {
	const sorted = [...users];
	sorted.sort((left, right) => {
		const leftValue = left[sortConfig.key];
		const rightValue = right[sortConfig.key];

		if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
			return leftValue.join(',').localeCompare(rightValue.join(','));
		}

		if (typeof leftValue === 'boolean' && typeof rightValue === 'boolean') {
			return Number(leftValue) - Number(rightValue);
		}

		if (typeof leftValue === 'number' && typeof rightValue === 'number') {
			return leftValue - rightValue;
		}

		return String(leftValue).localeCompare(String(rightValue));
	});

	if (sortConfig.direction === 'desc') {
		sorted.reverse();
	}

	return sorted;
};

const toggleRoleId = (roleIds, roleId) =>
	roleIds.includes(roleId)
		? roleIds.filter((entry) => entry !== roleId)
		: [...roleIds, roleId].sort();

const sortIndicator = (sortConfig, key) => {
	if (sortConfig.key !== key) {
		return '';
	}

	return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
};

export default function UserList({
	session = null,
	onLoginClick = () => {},
	onLogout = () => {},
	embedded = false,
	onUsersChanged = () => {},
	onUserSelect = () => {},
}) {
	const [users, setUsers] = useState(() => DataBroker.getUsers());
	const [searchTerm, setSearchTerm] = useState('');
	const [accessFilter, setAccessFilter] = useState('all');
	const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
	const [editingUid, setEditingUid] = useState(null);
	const [formState, setFormState] = useState(createEmptyForm());
	const [formError, setFormError] = useState('');
	const availableRoles = DataBroker.getRoles();

	const canViewUserList = DataBroker.canAccessPage(session?.user, 'userlist', 'readOnly');
	const canEditUsers = DataBroker.canAccessPage(session?.user, 'userlist', 'readWrite');
	const canDeleteUsers = DataBroker.canAccessPage(session?.user, 'userlist', 'delete');

	const visibleUsers = sortUsers(
		users.filter((user) => {
			const matchesAccess = accessFilter === 'all' || String(user.accessLevel) === accessFilter;
			const query = searchTerm.trim().toLowerCase();
			const matchesSearch =
				query.length === 0 ||
				user.name.toLowerCase().includes(query) ||
				user.username.toLowerCase().includes(query);

			return matchesAccess && matchesSearch;
		}),
		sortConfig,
	);

	const handleSort = (key) => {
		setSortConfig((current) => ({
			key,
			direction:
				current.key === key && current.direction === 'asc'
					? 'desc'
					: 'asc',
		}));
	};

	const handleEdit = (user) => {
		setEditingUid(user.uid);
		setFormState({
			uid: user.uid,
			name: user.name,
			age: String(user.age),
			email: user.email,
			username: user.username,
			accessLevel: String(user.accessLevel),
			roleIds: [...user.roleIds],
		});
	};

	const handleDelete = (uid) => {
		DataBroker.deleteUser(uid);
		setUsers(DataBroker.getUsers());
		onUsersChanged();
		if (editingUid === uid) {
			setEditingUid(null);
			setFormState(createEmptyForm());
		}
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		setFormError('');

		const nextUser = {
			uid: formState.uid || `USR-${Date.now()}`,
			name: formState.name.trim(),
			age: Number(formState.age),
			email: formState.email.trim(),
			username: formState.username.trim(),
			accessLevel: Number(formState.accessLevel),
			roleIds: [...formState.roleIds],
		};

		try {
			if (editingUid) {
				DataBroker.updateUser(editingUid, nextUser);
			} else {
				DataBroker.addUser(nextUser);
			}
		} catch (error) {
			setFormError(error instanceof Error ? error.message : 'Unable to save user.');
			return;
		}

		setUsers(DataBroker.getUsers());
		onUsersChanged();

		setEditingUid(null);
		setFormState(createEmptyForm());
	};

	const handleCancelEdit = () => {
		setEditingUid(null);
		setFormState(createEmptyForm());
	};

	const userColumns = [
		{
			key: 'uid',
			header: `UID${sortIndicator(sortConfig, 'uid')}`,
			sortable: true,
			sortDirection: sortConfig.key === 'uid' ? sortConfig.direction : null,
			onSort: () => handleSort('uid'),
			cell: (user) => user.uid,
		},
		{
			key: 'name',
			header: `Name${sortIndicator(sortConfig, 'name')}`,
			sortable: true,
			sortDirection: sortConfig.key === 'name' ? sortConfig.direction : null,
			onSort: () => handleSort('name'),
			cell: (user) => (
				<button
					type="button"
					className="userlist-link-button"
					onClick={() => onUserSelect(user.uid)}
				>
					{user.name}
				</button>
			),
		},
		{
			key: 'username',
			header: `Username${sortIndicator(sortConfig, 'username')}`,
			sortable: true,
			sortDirection: sortConfig.key === 'username' ? sortConfig.direction : null,
			onSort: () => handleSort('username'),
			cell: (user) => (
				<button
					type="button"
					className="userlist-link-button"
					onClick={() => onUserSelect(user.uid)}
				>
					{user.username}
				</button>
			),
		},
		{
			key: 'email',
			header: `Email${sortIndicator(sortConfig, 'email')}`,
			sortable: true,
			sortDirection: sortConfig.key === 'email' ? sortConfig.direction : null,
			onSort: () => handleSort('email'),
			cell: (user) => user.email,
		},
		{
			key: 'age',
			header: `Age${sortIndicator(sortConfig, 'age')}`,
			sortable: true,
			sortDirection: sortConfig.key === 'age' ? sortConfig.direction : null,
			onSort: () => handleSort('age'),
			cell: (user) => user.age,
			align: 'right',
		},
		{
			key: 'accessLevel',
			header: `Access${sortIndicator(sortConfig, 'accessLevel')}`,
			sortable: true,
			sortDirection: sortConfig.key === 'accessLevel' ? sortConfig.direction : null,
			onSort: () => handleSort('accessLevel'),
			cell: (user) => user.accessLevel,
			align: 'right',
		},
		{
			key: 'roleIds',
			header: `Roles${sortIndicator(sortConfig, 'roleIds')}`,
			sortable: true,
			sortDirection: sortConfig.key === 'roleIds' ? sortConfig.direction : null,
			onSort: () => handleSort('roleIds'),
			cell: (user) => DataBroker.getUserRoleLabels(user).join(', ') || 'None',
		},
		{
			key: 'actions',
			header: 'Actions',
			cell: (user) => (
				<div className="userlist-row-actions">
					{canEditUsers ? (
						<button type="button" className="userlist-secondary-button" onClick={() => handleEdit(user)}>
							Edit
						</button>
					) : null}
					{canDeleteUsers ? (
						<button type="button" className="userlist-danger-button" onClick={() => handleDelete(user.uid)}>
							Delete
						</button>
					) : null}
				</div>
			),
		},
	];

	const content = (
		<section className="userlist-page">
					<div className="userlist-heading">
						<div>
							<p className="eyebrow">Administration</p>
							<h1>User list</h1>
							<p>Manage users, filter by access level, and search by name or username.</p>
						</div>
					</div>

					{!session ? (
						<div className="userlist-message-card">
							<h2>Sign in required</h2>
							<p>You need an active session to view this page.</p>
						</div>
					) : !canViewUserList ? (
						<div className="userlist-message-card">
							<h2>Restricted page</h2>
							<p>Your assigned roles and rights do not allow access to the user list.</p>
						</div>
					) : (
						<>
							<div className="userlist-toolbar">
								<input
									className="userlist-input"
									type="search"
									placeholder="Search by name or username"
									value={searchTerm}
									onChange={(event) => setSearchTerm(event.target.value)}
								/>
								<select
									className="userlist-select"
									value={accessFilter}
									onChange={(event) => setAccessFilter(event.target.value)}
								>
									<option value="all">All access levels</option>
									<option value="1">Access level 1</option>
									<option value="2">Access level 2</option>
									<option value="3">Access level 3</option>
								</select>
							</div>

							{canEditUsers ? (
							<form className="userlist-form" onSubmit={handleSubmit}>
								<input
									className="userlist-input"
									type="text"
									placeholder="Full name"
									value={formState.name}
									onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
									required
								/>
								<input
									className="userlist-input"
									type="number"
									min="1"
									placeholder="Age"
									value={formState.age}
									onChange={(event) => setFormState((current) => ({ ...current, age: event.target.value }))}
									required
								/>
								<input
									className="userlist-input"
									type="email"
									placeholder="Email"
									value={formState.email}
									onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
									required
								/>
								<input
									className="userlist-input"
									type="text"
									placeholder="Username"
									value={formState.username}
									onChange={(event) => setFormState((current) => ({ ...current, username: event.target.value }))}
									required
								/>
								<select
									className="userlist-select"
									value={formState.accessLevel}
									onChange={(event) => setFormState((current) => ({ ...current, accessLevel: event.target.value }))}
								>
									<option value="1">Access level 1</option>
									<option value="2">Access level 2</option>
									<option value="3">Access level 3</option>
								</select>
								<div className="profile-security-list">
									{availableRoles.map((role) => (
										<label key={role.id} className="userlist-checkbox">
											<input
												type="checkbox"
												checked={formState.roleIds.includes(role.id)}
												onChange={() =>
													setFormState((current) => ({
														...current,
														roleIds: toggleRoleId(current.roleIds, role.id),
													}))
												}
											/>
											{role.label}
										</label>
									))}
								</div>
								{formError ? <p className="login-error userlist-form-error">{formError}</p> : null}
								<div className="userlist-form-actions">
									<button type="submit" className="main-login-button">
										{editingUid ? 'Save user' : 'Add user'}
									</button>
									{editingUid ? (
										<button type="button" className="userlist-secondary-button" onClick={handleCancelEdit}>
											Cancel
										</button>
									) : null}
								</div>
							</form>
							) : (
								<div className="userlist-message-card">
									<h2>Read-only access</h2>
									<p>Your current rights allow viewing users but not editing them.</p>
								</div>
							)}

							<DataTable
								columns={userColumns}
								rows={visibleUsers}
								rowKey={(user) => user.uid}
								emptyMessage="No users match the current filters."
								minWidth={860}
							/>
						</>
					)}
		</section>
	);

	if (embedded) {
		return content;
	}

	return (
		<div className="App">
			<main className="app-shell userlist-shell">
				<AppHeader
					title="Relib"
					subtitle="User administration"
					isLoggedIn={Boolean(session)}
					username={session?.user?.username}
					onLoginClick={onLoginClick}
					onLogout={onLogout}
				/>
				{content}
			</main>
		</div>
	);
}