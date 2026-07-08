// A calendar page for the events. Displays all events in a calendar view. Allows the user to add, edit, and delete events. The user can have read-only, read/write, or read/write/delete access to the events. The calendar is displayed in a month view, with the ability to switch to a week or day view. The user can also filter the events by category.

import React, { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { DataBroker, type CalendarEvent, type Session } from '../dataBroker';

interface CalendarProps {
	session: Session | null;
}

const createEmptyEvent = () => ({
	id: '',
	title: '',
	date: '2026-07-08',
	category: 'General',
	description: '',
});

export default function Calendar({ session }: CalendarProps) {
	const [events, setEvents] = useState<CalendarEvent[]>(() => DataBroker.getCalendarEvents());
	const [view, setView] = useState<'month' | 'week' | 'day'>('month');
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formState, setFormState] = useState(createEmptyEvent());

	const canRead = DataBroker.canAccessPage(session?.user, 'calendar', 'readOnly');
	const canWrite = DataBroker.canAccessPage(session?.user, 'calendar', 'readWrite');
	const canDelete = DataBroker.canAccessPage(session?.user, 'calendar', 'delete');

	const categories = useMemo(
		() => ['all', ...new Set(events.map((event) => event.category))],
		[events],
	);

	const visibleEvents = useMemo(
		() =>
			events.filter((event) =>
				categoryFilter === 'all' ? true : event.category === categoryFilter,
			),
		[events, categoryFilter],
	);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canWrite) {
			return;
		}

		const nextEvent: CalendarEvent = {
			id: editingId ?? `evt-${Date.now()}`,
			title: formState.title.trim(),
			date: formState.date,
			category: formState.category.trim(),
			description: formState.description.trim(),
		};

		if (editingId) {
			DataBroker.updateCalendarEvent(editingId, nextEvent);
		} else {
			DataBroker.addCalendarEvent(nextEvent);
		}

		setEvents(DataBroker.getCalendarEvents());

		setEditingId(null);
		setFormState(createEmptyEvent());
	};

	const handleEdit = (eventItem: CalendarEvent) => {
		if (!canWrite) {
			return;
		}

		setEditingId(eventItem.id);
		setFormState({ ...eventItem });
	};

	const handleDelete = (id: string) => {
		if (!canDelete) {
			return;
		}

		DataBroker.deleteCalendarEvent(id);
		setEvents(DataBroker.getCalendarEvents());
		if (editingId === id) {
			setEditingId(null);
			setFormState(createEmptyEvent());
		}
	};

	if (!session || !canRead) {
		return (
			<section className="calendar-page">
				<div className="userlist-message-card">
					<h2>Access unavailable</h2>
					<p>Your current rights do not allow access to the calendar page.</p>
				</div>
			</section>
		);
	}

	return (
		<section className="calendar-page">
			<div className="userlist-heading">
				<div>
					<p className="eyebrow">Planning</p>
					<h1>Calendar</h1>
					<p>Switch between month, week, and day views, and manage events according to your rights.</p>
				</div>
			</div>

			<div className="calendar-toolbar">
				<div className="calendar-view-switcher">
					{(['month', 'week', 'day'] as const).map((option) => (
						<button
							key={option}
							type="button"
							className={`userlist-secondary-button${view === option ? ' calendar-view-active' : ''}`}
							onClick={() => setView(option)}
						>
							{option}
						</button>
					))}
				</div>
				<select
					className="userlist-select"
					value={categoryFilter}
					onChange={(event) => setCategoryFilter(event.target.value)}
				>
					{categories.map((category) => (
						<option key={category} value={category}>
							{category === 'all' ? 'All categories' : category}
						</option>
					))}
				</select>
			</div>

			{canWrite ? (
				<form className="calendar-form" onSubmit={handleSubmit}>
					<input
						className="userlist-input"
						type="text"
						placeholder="Event title"
						value={formState.title}
						onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
						required
					/>
					<input
						className="userlist-input"
						type="date"
						value={formState.date}
						onChange={(event) => setFormState((current) => ({ ...current, date: event.target.value }))}
						required
					/>
					<input
						className="userlist-input"
						type="text"
						placeholder="Category"
						value={formState.category}
						onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))}
						required
					/>
					<input
						className="userlist-input"
						type="text"
						placeholder="Description"
						value={formState.description}
						onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
						required
					/>
					<div className="profile-actions">
						<Button label={editingId ? 'Save event' : 'Add event'} type="submit" onClick={() => undefined} />
					</div>
				</form>
			) : (
				<div className="userlist-message-card">
					<h2>Read-only access</h2>
					<p>You can view events on this calendar, but your current rights do not allow changes.</p>
				</div>
			)}

			<div className="calendar-grid">
				{visibleEvents.map((eventItem) => (
					<article key={eventItem.id} className="dashboard-card calendar-event-card">
						<p className="eyebrow">{view} view</p>
						<h2>{eventItem.title}</h2>
						<p>{eventItem.date}</p>
						<p>{eventItem.category}</p>
						<p>{eventItem.description}</p>
						<div className="userlist-row-actions">
							{canWrite ? (
								<button type="button" className="userlist-secondary-button" onClick={() => handleEdit(eventItem)}>
									Edit
								</button>
							) : null}
							{canDelete ? (
								<button type="button" className="userlist-danger-button" onClick={() => handleDelete(eventItem.id)}>
									Delete
								</button>
							) : null}
						</div>
					</article>
				))}
			</div>
		</section>
	);
}