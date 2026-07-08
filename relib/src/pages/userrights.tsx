import React, { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { MatrixTable } from '../components/table/MatrixTable';
import { DataBroker, type AccessLevel, type Session, type UserRightDefinition } from '../dataBroker';
import { useStatusMessage } from '../hooks/useStatusMessage';

interface UserRightsProps {
    session: Session | null;
    onRightsUpdated?: () => void;
}

const accessLevels: AccessLevel[] = [1, 2, 3];

const toggleLevel = (levels: AccessLevel[], level: AccessLevel): AccessLevel[] => {
    if (levels.includes(level)) {
        return levels.filter((entry) => entry !== level);
    }

    return [...levels, level].sort();
};

export default function UserRights({ session, onRightsUpdated = () => {} }: UserRightsProps) {
    const [definitions, setDefinitions] = useState<UserRightDefinition[]>(() => DataBroker.getUserRights());
    const { statusMessage, showStatusMessage } = useStatusMessage();
    const pagesById = useMemo(
        () => new Map(DataBroker.getPages().map((page) => [page.id, page])),
        [],
    );
    const orderedDefinitions = useMemo(
        () =>
            [...definitions].sort((left, right) => {
                const leftOrder = pagesById.get(left.pageId)?.sortOrder ?? Number.MAX_SAFE_INTEGER;
                const rightOrder = pagesById.get(right.pageId)?.sortOrder ?? Number.MAX_SAFE_INTEGER;

                return leftOrder - rightOrder || left.pageId.localeCompare(right.pageId);
            }),
        [definitions, pagesById],
    );

    const canViewRights = DataBroker.canAccessPage(session?.user, 'userrights', 'readOnly');
    const canEditRights = DataBroker.canAccessPage(session?.user, 'userrights', 'readWrite');

    const handleToggle = (
        pageId: string,
        accessKey: 'readOnly' | 'readWrite' | 'delete',
        level: AccessLevel,
    ) => {
        setDefinitions((current) =>
            current.map((definition) =>
                definition.pageId === pageId
                    ? {
                        ...definition,
                        [accessKey]: toggleLevel(definition[accessKey], level),
                    }
                    : definition,
            ),
        );
    };

    const handleSave = () => {
        DataBroker.updateUserRights(definitions);
        setDefinitions(DataBroker.getUserRights());
        onRightsUpdated();
        showStatusMessage('User rights updated successfully.');
    };

    if (!session) {
        return (
            <section className="userrights-page">
                <div className="userlist-message-card">
                    <h2>Sign in required</h2>
                    <p>You need an active session to view user rights.</p>
                </div>
            </section>
        );
    }

    if (!canViewRights) {
        return (
            <section className="userrights-page">
                <div className="userlist-message-card">
                    <h2>Restricted page</h2>
                    <p>Your assigned roles and rights do not allow access to user-right definitions.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="userrights-page">
            <div className="userlist-heading">
                <div>
                    <p className="eyebrow">Administration</p>
                    <h1>User rights</h1>
                    <p>Configure which access levels have read-only, read-write, or delete rights on each page.</p>
                </div>
            </div>

            {statusMessage ? <p className="profile-success" role="status">{statusMessage}</p> : null}

            <MatrixTable
                rowHeader="Page"
                rows={orderedDefinitions}
                columns={['readOnly', 'readWrite', 'delete'] as const}
                rowKey={(definition) => definition.pageId}
                columnKey={(accessKey) => accessKey}
                renderRowHeader={(definition) => (
                    <div className="userrights-page-name">
                        <strong>{pagesById.get(definition.pageId)?.label ?? definition.pageId}</strong>
                        <span>{definition.pageId}</span>
                    </div>
                )}
                renderColumnHeader={(accessKey) => (
                    accessKey === 'readOnly' ? 'Read-only' : accessKey === 'readWrite' ? 'Read-write' : 'Delete'
                )}
                renderCell={(definition, accessKey) => (
                    <div className="userrights-levels">
                        {accessLevels.map((level) => (
                            <label key={level} className="userlist-checkbox">
                                <input
                                    type="checkbox"
                                    checked={definition[accessKey].includes(level)}
                                    disabled={!canEditRights}
                                    onChange={() => handleToggle(definition.pageId, accessKey, level)}
                                />
                                L{level}
                            </label>
                        ))}
                    </div>
                )}
                emptyMessage="No user-right definitions available."
                minWidth={760}
            />

            <div className="profile-actions">
                {canEditRights ? <Button label="Save rights" onClick={handleSave} /> : null}
            </div>
        </section>
    );
}