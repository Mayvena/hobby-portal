// A bar right under the application header that contains navigation links and other controls.

import React from 'react';

interface HeaderBarLink {
	label: string;
	href: string;
}

interface HeaderBarProps {
	links?: HeaderBarLink[];
	children?: React.ReactNode;
}

const defaultLinks: HeaderBarLink[] = [
	{ label: 'Home', href: '#' },
	{ label: 'Library', href: '#library' },
	{ label: 'About', href: '#about' },
];

export const HeaderBar: React.FC<HeaderBarProps> = ({
	links = defaultLinks,
	children,
}) => {
	return (
		<nav className="header-bar" aria-label="Primary navigation">
			<ul className="header-bar-links">
				{links.map((link) => (
					<li key={link.label}>
						<a href={link.href}>{link.label}</a>
					</li>
				))}
			</ul>
			<div className="header-bar-controls">{children}</div>
		</nav>
	);
};