// Data provider class that temporarily fetches data from a JSON file. This is a placeholder for future data fetching logic.
import dummyData from './data/dummy.json';

type DummyUser = {
    uid: string;
    name: string;
    age: number;
    email: string;
    username: string;
    password: string;
    accessLevel: 1 | 2 | 3;
};

type DummyRole = {
    id: string;
    label: string;
    description: string;
};

type DummyUserRoleMapping = {
    uid: string;
    roleId: string;
};

type DummyUserRight = {
    pageId: string;
    readOnly: AccessLevel[];
    readWrite: AccessLevel[];
    delete: AccessLevel[];
};

type DummyPage = {
    id: string;
    label: string;
    sortOrder: number;
};

type DummyRolePageAccess = {
    roleId: string;
    pageId: string;
};

type DummyCalendarEvent = {
    id: string;
    title: string;
    date: string;
    category: string;
    description: string;
};

type DummyLibraryDocument = {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    uploadedBy: string;
    uploadedAt: string;
    description: string;
    category: string;
};

type DummyFinancesConfig = {
    iban: string;
    paypal: string;
    revolut: string;
    currency: string;
};

type DummyTransaction = {
    id: string;
    date: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: string;
    createdBy: string;
};

type DummyAssetCategory = {
    id: string;
    name: string;
    description: string;
};

type DummyAsset = {
    id: string;
    name: string;
    categoryId: string;
    description: string;
    price: number;
};

export type AccessLevel = 1 | 2 | 3;
export type AccessMode = 'readOnly' | 'readWrite' | 'delete';

export type UserProfile = {
    uid: string;
    name: string;
    age: number;
    email: string;
    username: string;
    accessLevel: AccessLevel;
    roleIds: string[];
};

export type UserRightDefinition = DummyUserRight;
export type CalendarEvent = DummyCalendarEvent;
export type LibraryDocument = DummyLibraryDocument;
export type FinancesConfig = DummyFinancesConfig;
export type TransactionType = DummyTransaction['type'];
export type TransactionEntry = DummyTransaction;
export type AssetCategory = DummyAssetCategory;
export type AssetItem = DummyAsset;
export type PageDefinition = DummyPage;
export type RoleDefinition = DummyRole;
export type UserRoleMapping = DummyUserRoleMapping;
export type RolePageAccess = DummyRolePageAccess;

export type Session = {
    id: string;
    createdAt: string;
    user: UserProfile;
};

const SESSION_STORAGE_KEY = 'relib.session';
const USERS_STORAGE_KEY = 'relib.users';
const ROLES_STORAGE_KEY = 'relib.roles';
const USER_ROLE_MAPPINGS_KEY = 'relib.user-roles';
const PAGES_STORAGE_KEY = 'relib.pages';
const ROLE_PAGE_ACCESS_KEY = 'relib.role-page-access';
const USER_RIGHTS_STORAGE_KEY = 'relib.user-rights';
const CALENDAR_EVENTS_STORAGE_KEY = 'relib.calendar-events';
const LIBRARY_DOCUMENTS_STORAGE_KEY = 'relib.library-documents';
const FINANCES_CONFIG_STORAGE_KEY = 'relib.finances-config';
const TRANSACTIONS_STORAGE_KEY = 'relib.transactions';
const ASSET_CATEGORIES_STORAGE_KEY = 'relib.asset-categories';
const ASSETS_STORAGE_KEY = 'relib.assets';

const ADMIN_ROLE_ID = 'admin';

const normalizeUser = (raw: Record<string, unknown>): DummyUser => ({
    uid: String(raw.uid ?? '').trim(),
    name: String(raw.name ?? '').trim(),
    age: Number(raw.age ?? 0),
    email: String(raw.email ?? '').trim(),
    username: String(raw.username ?? '').trim(),
    password: String(raw.password ?? '').trim(),
    accessLevel: ([1, 2, 3].includes(Number(raw.accessLevel)) ? Number(raw.accessLevel) : 1) as AccessLevel,
});

const normalizeRole = (raw: Record<string, unknown>): DummyRole => ({
    id: String(raw.id ?? '').trim(),
    label: String(raw.label ?? '').trim(),
    description: String(raw.description ?? '').trim(),
});

const normalizePage = (raw: Record<string, unknown>): DummyPage => ({
    id: String(raw.id ?? '').trim(),
    label: String(raw.label ?? '').trim(),
    sortOrder: Number(raw.sortOrder ?? 0),
});

const buildUserProfile = (user: DummyUser, mappings: DummyUserRoleMapping[]): UserProfile => ({
    uid: user.uid,
    name: user.name,
    age: user.age,
    email: user.email,
    username: user.username,
    accessLevel: user.accessLevel,
    roleIds: mappings.filter((m) => m.uid === user.uid).map((m) => m.roleId).sort(),
});

const ensureAdminRole = (roleIds: string[]): string[] =>
    roleIds.length === 0 ? [] : [...new Set([...roleIds, ADMIN_ROLE_ID])].sort();

const seedUsers = (): DummyUser[] =>
    (dummyData.users as Array<Record<string, unknown>>).map(normalizeUser);
const seedRoles = (): DummyRole[] =>
    (dummyData.roles as Array<Record<string, unknown>>).map(normalizeRole);
const seedUserRoleMappings = (): DummyUserRoleMapping[] => {
    const data = dummyData as unknown as { userRoles?: Array<Record<string, unknown>> };
    return (data.userRoles ?? []).map((m) => ({
        uid: String(m.uid ?? '').trim(),
        roleId: String(m.roleId ?? '').trim(),
    }));
};
const seedPages = (): DummyPage[] =>
    (dummyData.pages as Array<Record<string, unknown>>).map(normalizePage);
const seedRolePageAccess = (): DummyRolePageAccess[] => {
    const data = dummyData as unknown as { rolePageAccess?: Array<Record<string, unknown>> };
    return (data.rolePageAccess ?? []).map((m) => ({
        roleId: String(m.roleId ?? '').trim(),
        pageId: String(m.pageId ?? '').trim(),
    }));
};
const seedUserRights = (): DummyUserRight[] =>
    (dummyData.userRights as DummyUserRight[]).map((definition) => ({
        ...definition,
        readOnly: [...definition.readOnly],
        readWrite: [...definition.readWrite],
        delete: [...definition.delete],
    }));
const seedCalendarEvents = (): DummyCalendarEvent[] =>
    (dummyData.calendarEvents as DummyCalendarEvent[]).map((event) => ({ ...event }));
const seedLibraryDocuments = (): DummyLibraryDocument[] => {
    const data = dummyData as unknown as { libraryDocuments?: DummyLibraryDocument[] };
    return (data.libraryDocuments ?? []).map((doc) => ({ ...doc }));
};
const seedFinancesConfig = (): DummyFinancesConfig => {
    const data = dummyData as unknown as { financesConfig?: DummyFinancesConfig };
    return {
        iban: data.financesConfig?.iban ?? '',
        paypal: data.financesConfig?.paypal ?? '',
        revolut: data.financesConfig?.revolut ?? '',
        currency: data.financesConfig?.currency ?? 'EUR',
    };
};
const seedTransactions = (): DummyTransaction[] => {
    const data = dummyData as unknown as { transactions?: DummyTransaction[] };
    return (data.transactions ?? []).map((txn) => ({ ...txn }));
};
const seedAssetCategories = (): DummyAssetCategory[] => {
    const data = dummyData as unknown as { assetCategories?: DummyAssetCategory[] };
    return (data.assetCategories ?? []).map((category) => ({ ...category }));
};
const seedAssets = (): DummyAsset[] => {
    const data = dummyData as unknown as { assets?: DummyAsset[] };
    return (data.assets ?? []).map((asset) => ({ ...asset }));
};

const loadStoredUsers = (): DummyUser[] => {
    if (typeof window === 'undefined') { return seedUsers(); }
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
        const users = seedUsers();
        window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        return users;
    }
    try {
        const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
        if (!Array.isArray(parsed)) { throw new Error('Invalid user store'); }
        return parsed.map(normalizeUser);
    } catch {
        const users = seedUsers();
        window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        return users;
    }
};

const persistUsers = (users: DummyUser[]): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
};

const loadStoredRoles = (): DummyRole[] => {
    if (typeof window === 'undefined') { return seedRoles(); }
    const raw = window.localStorage.getItem(ROLES_STORAGE_KEY);
    if (!raw) {
        const roles = seedRoles();
        window.localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
        return roles;
    }
    try {
        const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
        if (!Array.isArray(parsed)) { throw new Error('Invalid role store'); }
        const stored = parsed.map(normalizeRole);
        const storedIds = new Set(stored.map((role) => role.id));
        const missing = seedRoles().filter((role) => !storedIds.has(role.id));
        if (missing.length > 0) {
            const merged = [...stored, ...missing];
            window.localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(merged));
            return merged;
        }
        return stored;
    } catch {
        const roles = seedRoles();
        window.localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
        return roles;
    }
};

const persistRoles = (roles: DummyRole[]): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
    }
};

const loadStoredUserRoleMappings = (): DummyUserRoleMapping[] => {
    if (typeof window === 'undefined') { return seedUserRoleMappings(); }
    const raw = window.localStorage.getItem(USER_ROLE_MAPPINGS_KEY);
    if (!raw) {
        // migrate from old users storage that may have roleIds or isAdmin embedded
        const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsers) {
            try {
                const oldUsers = JSON.parse(storedUsers) as Array<Record<string, unknown>>;
                const migrated: DummyUserRoleMapping[] = [];
                for (const u of oldUsers) {
                    const legacyRoles = Array.isArray(u.roleIds) ? (u.roleIds as string[]) : [];
                    for (const r of legacyRoles) {
                        migrated.push({ uid: String(u.uid ?? '').trim(), roleId: String(r).trim() });
                    }
                    if (legacyRoles.length === 0 && u.isAdmin) {
                        migrated.push({ uid: String(u.uid ?? '').trim(), roleId: ADMIN_ROLE_ID });
                    }
                }
                if (migrated.length > 0) {
                    window.localStorage.setItem(USER_ROLE_MAPPINGS_KEY, JSON.stringify(migrated));
                    return migrated;
                }
            } catch { /* fall through to seed */ }
        }
        const mappings = seedUserRoleMappings();
        window.localStorage.setItem(USER_ROLE_MAPPINGS_KEY, JSON.stringify(mappings));
        return mappings;
    }
    try {
        const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
        if (!Array.isArray(parsed)) { throw new Error('Invalid user-role store'); }
        return parsed.map((m) => ({ uid: String(m.uid ?? '').trim(), roleId: String(m.roleId ?? '').trim() }));
    } catch {
        const mappings = seedUserRoleMappings();
        window.localStorage.setItem(USER_ROLE_MAPPINGS_KEY, JSON.stringify(mappings));
        return mappings;
    }
};

const persistUserRoleMappings = (mappings: DummyUserRoleMapping[]): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(USER_ROLE_MAPPINGS_KEY, JSON.stringify(mappings));
    }
};

const loadStoredPages = (): DummyPage[] => {
    if (typeof window === 'undefined') { return seedPages(); }
    const raw = window.localStorage.getItem(PAGES_STORAGE_KEY);
    if (!raw) {
        const pages = seedPages();
        window.localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(pages));
        return pages;
    }
    try {
        const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
        if (!Array.isArray(parsed)) { throw new Error('Invalid page store'); }
        const stored = parsed.map(normalizePage);
        const storedIds = new Set(stored.map((p) => p.id));
        const missing = seedPages().filter((p) => !storedIds.has(p.id));
        if (missing.length > 0) {
            const merged = [...stored, ...missing];
            window.localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(merged));
            return merged;
        }
        return stored;
    } catch {
        const pages = seedPages();
        window.localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(pages));
        return pages;
    }
};

const loadStoredRolePageAccess = (): DummyRolePageAccess[] => {
    if (typeof window === 'undefined') { return seedRolePageAccess(); }
    const raw = window.localStorage.getItem(ROLE_PAGE_ACCESS_KEY);
    if (!raw) {
        // migrate from old pages storage that may have requiredRoleIds or adminOnly
        const storedPages = window.localStorage.getItem(PAGES_STORAGE_KEY);
        if (storedPages) {
            try {
                const oldPages = JSON.parse(storedPages) as Array<Record<string, unknown>>;
                const migrated: DummyRolePageAccess[] = [];
                for (const p of oldPages) {
                    if (Array.isArray(p.requiredRoleIds)) {
                        for (const r of (p.requiredRoleIds as string[])) {
                            migrated.push({ roleId: String(r).trim(), pageId: String(p.id ?? '').trim() });
                        }
                    } else if (p.adminOnly) {
                        migrated.push({ roleId: ADMIN_ROLE_ID, pageId: String(p.id ?? '').trim() });
                    }
                }
                if (migrated.length > 0) {
                    window.localStorage.setItem(ROLE_PAGE_ACCESS_KEY, JSON.stringify(migrated));
                    return migrated;
                }
            } catch { /* fall through to seed */ }
        }
        const access = seedRolePageAccess();
        window.localStorage.setItem(ROLE_PAGE_ACCESS_KEY, JSON.stringify(access));
        return access;
    }
    try {
        const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
        if (!Array.isArray(parsed)) { throw new Error('Invalid role-page-access store'); }
        const stored = parsed.map((m) => ({ roleId: String(m.roleId ?? '').trim(), pageId: String(m.pageId ?? '').trim() }));
        // merge any seed entries whose (roleId, pageId) pair is not yet in the stored set
        const storedKeys = new Set(stored.map((m) => `${m.roleId}:${m.pageId}`));
        const missing = seedRolePageAccess().filter((m) => !storedKeys.has(`${m.roleId}:${m.pageId}`));
        if (missing.length > 0) {
            const merged = [...stored, ...missing];
            window.localStorage.setItem(ROLE_PAGE_ACCESS_KEY, JSON.stringify(merged));
            return merged;
        }
        return stored;
    } catch {
        const access = seedRolePageAccess();
        window.localStorage.setItem(ROLE_PAGE_ACCESS_KEY, JSON.stringify(access));
        return access;
    }
};

const persistRolePageAccess = (access: DummyRolePageAccess[]): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(ROLE_PAGE_ACCESS_KEY, JSON.stringify(access));
    }
};

const loadStoredUserRights = (): DummyUserRight[] => {
    if (typeof window === 'undefined') {
        return seedUserRights();
    }

    const raw = window.localStorage.getItem(USER_RIGHTS_STORAGE_KEY);
    if (!raw) {
        const rights = seedUserRights();
        window.localStorage.setItem(USER_RIGHTS_STORAGE_KEY, JSON.stringify(rights));
        return rights;
    }

    try {
        const parsed = JSON.parse(raw) as DummyUserRight[];
        if (!Array.isArray(parsed)) {
            throw new Error('Invalid rights store');
        }
        const storedPageIds = new Set(parsed.map((d) => d.pageId));
        const missing = seedUserRights().filter((d) => !storedPageIds.has(d.pageId));
        if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            window.localStorage.setItem(USER_RIGHTS_STORAGE_KEY, JSON.stringify(merged));
            return merged;
        }
        return parsed;
    } catch {
        const rights = seedUserRights();
        window.localStorage.setItem(USER_RIGHTS_STORAGE_KEY, JSON.stringify(rights));
        return rights;
    }
};

const persistUserRights = (rights: DummyUserRight[]): void => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(USER_RIGHTS_STORAGE_KEY, JSON.stringify(rights));
};

const loadStoredCalendarEvents = (): DummyCalendarEvent[] => {
    if (typeof window === 'undefined') {
        return seedCalendarEvents();
    }

    const raw = window.localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
    if (!raw) {
        const events = seedCalendarEvents();
        window.localStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(events));
        return events;
    }

    try {
        const parsed = JSON.parse(raw) as DummyCalendarEvent[];
        if (!Array.isArray(parsed)) {
            throw new Error('Invalid calendar store');
        }
        return parsed;
    } catch {
        const events = seedCalendarEvents();
        window.localStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(events));
        return events;
    }
};

const persistCalendarEvents = (events: DummyCalendarEvent[]): void => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(events));
};

const loadStoredLibraryDocuments = (): DummyLibraryDocument[] => {
    if (typeof window === 'undefined') { return seedLibraryDocuments(); }
    const raw = window.localStorage.getItem(LIBRARY_DOCUMENTS_STORAGE_KEY);
    if (!raw) {
        const docs = seedLibraryDocuments();
        window.localStorage.setItem(LIBRARY_DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
        return docs;
    }
    try {
        const parsed = JSON.parse(raw) as DummyLibraryDocument[];
        if (!Array.isArray(parsed)) { throw new Error('Invalid library store'); }
        return parsed;
    } catch {
        const docs = seedLibraryDocuments();
        window.localStorage.setItem(LIBRARY_DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
        return docs;
    }
};

const persistLibraryDocuments = (docs: DummyLibraryDocument[]): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(LIBRARY_DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
    }
};

const loadStoredFinancesConfig = (): DummyFinancesConfig => {
    if (typeof window === 'undefined') { return seedFinancesConfig(); }
    const raw = window.localStorage.getItem(FINANCES_CONFIG_STORAGE_KEY);
    if (!raw) {
        const config = seedFinancesConfig();
        window.localStorage.setItem(FINANCES_CONFIG_STORAGE_KEY, JSON.stringify(config));
        return config;
    }
    try {
        const parsed = JSON.parse(raw) as Partial<DummyFinancesConfig>;
        const seed = seedFinancesConfig();
        const merged: DummyFinancesConfig = {
            iban: String(parsed.iban ?? seed.iban),
            paypal: String(parsed.paypal ?? seed.paypal),
            revolut: String(parsed.revolut ?? seed.revolut),
            currency: String(parsed.currency ?? seed.currency),
        };
        window.localStorage.setItem(FINANCES_CONFIG_STORAGE_KEY, JSON.stringify(merged));
        return merged;
    } catch {
        const config = seedFinancesConfig();
        window.localStorage.setItem(FINANCES_CONFIG_STORAGE_KEY, JSON.stringify(config));
        return config;
    }
};

const persistFinancesConfig = (config: DummyFinancesConfig): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(FINANCES_CONFIG_STORAGE_KEY, JSON.stringify(config));
    }
};

const loadStoredTransactions = (): DummyTransaction[] => {
    if (typeof window === 'undefined') { return seedTransactions(); }
    const raw = window.localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!raw) {
        const txns = seedTransactions();
        window.localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(txns));
        return txns;
    }
    try {
        const parsed = JSON.parse(raw) as DummyTransaction[];
        if (!Array.isArray(parsed)) {
            throw new Error('Invalid transaction store');
        }
        const storedIds = new Set(parsed.map((txn) => txn.id));
        const missing = seedTransactions().filter((txn) => !storedIds.has(txn.id));
        if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            window.localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(merged));
            return merged;
        }
        return parsed;
    } catch {
        const txns = seedTransactions();
        window.localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(txns));
        return txns;
    }
};

const persistTransactions = (txns: DummyTransaction[]): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(txns));
    }
};

const loadStoredAssetCategories = (): DummyAssetCategory[] => {
    if (typeof window === 'undefined') { return seedAssetCategories(); }
    const raw = window.localStorage.getItem(ASSET_CATEGORIES_STORAGE_KEY);
    if (!raw) {
        const categories = seedAssetCategories();
        window.localStorage.setItem(ASSET_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
        return categories;
    }
    try {
        const parsed = JSON.parse(raw) as DummyAssetCategory[];
        if (!Array.isArray(parsed)) {
            throw new Error('Invalid asset category store');
        }
        const storedIds = new Set(parsed.map((category) => category.id));
        const missing = seedAssetCategories().filter((category) => !storedIds.has(category.id));
        if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            window.localStorage.setItem(ASSET_CATEGORIES_STORAGE_KEY, JSON.stringify(merged));
            return merged;
        }
        return parsed;
    } catch {
        const categories = seedAssetCategories();
        window.localStorage.setItem(ASSET_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
        return categories;
    }
};

const persistAssetCategories = (categories: DummyAssetCategory[]): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(ASSET_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    }
};

const loadStoredAssets = (): DummyAsset[] => {
    if (typeof window === 'undefined') { return seedAssets(); }
    const raw = window.localStorage.getItem(ASSETS_STORAGE_KEY);
    if (!raw) {
        const assets = seedAssets();
        window.localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
        return assets;
    }
    try {
        const parsed = JSON.parse(raw) as DummyAsset[];
        if (!Array.isArray(parsed)) {
            throw new Error('Invalid assets store');
        }
        const storedIds = new Set(parsed.map((asset) => asset.id));
        const missing = seedAssets().filter((asset) => !storedIds.has(asset.id));
        if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            window.localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(merged));
            return merged;
        }
        return parsed;
    } catch {
        const assets = seedAssets();
        window.localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
        return assets;
    }
};

const persistAssets = (assets: DummyAsset[]): void => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
    }
};

export class DataBroker {
    static getRoles(): RoleDefinition[] {
        return loadStoredRoles().map((role) => ({ ...role }));
    }

    static getRole(roleId: string): RoleDefinition | null {
        return DataBroker.getRoles().find((role) => role.id === roleId) ?? null;
    }

    static addRole(role: RoleDefinition): RoleDefinition {
        const roles = loadStoredRoles();
        const normalizedId = role.id.trim();
        if (!normalizedId) { throw new Error('Role ID cannot be empty.'); }
        if (roles.some((r) => r.id === normalizedId)) { throw new Error('A role with this ID already exists.'); }
        const nextRole: DummyRole = { id: normalizedId, label: role.label.trim(), description: role.description.trim() };
        persistRoles([...roles, nextRole]);
        return { ...nextRole };
    }

    static updateRole(id: string, role: RoleDefinition): RoleDefinition | null {
        const roles = loadStoredRoles();
        if (!roles.some((r) => r.id === id)) { return null; }
        const nextRole: DummyRole = { id, label: role.label.trim(), description: role.description.trim() };
        persistRoles(roles.map((r) => (r.id === id ? nextRole : r)));
        return { ...nextRole };
    }

    static deleteRole(id: string): boolean {
        if (id === ADMIN_ROLE_ID) { throw new Error('The admin role cannot be deleted.'); }
        const roles = loadStoredRoles();
        const next = roles.filter((r) => r.id !== id);
        if (next.length === roles.length) { return false; }
        persistRoles(next);
        // remove from user-role and role-page-access mappings
        persistUserRoleMappings(loadStoredUserRoleMappings().filter((m) => m.roleId !== id));
        persistRolePageAccess(loadStoredRolePageAccess().filter((m) => m.roleId !== id));
        return true;
    }

    static userHasRole(user: UserProfile | null | undefined, roleId: string): boolean {
        return Boolean(user?.roleIds.includes(roleId));
    }

    static userHasAnyRole(user: UserProfile | null | undefined, roleIds: string[]): boolean {
        if (!user) { return false; }
        return roleIds.some((roleId) => user.roleIds.includes(roleId));
    }

    static getUserRoleLabels(user: UserProfile | null | undefined): string[] {
        if (!user) { return []; }
        const rolesById = new Map(DataBroker.getRoles().map((role) => [role.id, role.label]));
        return user.roleIds.map((roleId) => rolesById.get(roleId) ?? roleId);
    }

    static getPages(): PageDefinition[] {
        return loadStoredPages()
            .map((page) => ({ ...page }))
            .sort((left, right) => left.sortOrder - right.sortOrder);
    }

    static getPage(pageId: string): PageDefinition | null {
        return DataBroker.getPages().find((page) => page.id === pageId) ?? null;
    }

    static getCalendarEvents(): CalendarEvent[] {
        return loadStoredCalendarEvents().map((event) => ({ ...event }));
    }

    static addCalendarEvent(event: CalendarEvent): CalendarEvent {
        const events = loadStoredCalendarEvents();
        const nextEvent = {
            ...event,
            id: event.id.trim() || `evt-${Date.now()}`,
            title: event.title.trim(),
            category: event.category.trim(),
            description: event.description.trim(),
        };

        const nextEvents = [...events, nextEvent];
        persistCalendarEvents(nextEvents);
        return { ...nextEvent };
    }

    static updateCalendarEvent(id: string, event: CalendarEvent): CalendarEvent | null {
        const events = loadStoredCalendarEvents();
        const existing = events.find((entry) => entry.id === id);

        if (!existing) {
            return null;
        }

        const nextEvent = {
            ...event,
            id: event.id.trim() || id,
            title: event.title.trim(),
            category: event.category.trim(),
            description: event.description.trim(),
        };

        const nextEvents = events.map((entry) => (entry.id === id ? nextEvent : entry));
        persistCalendarEvents(nextEvents);
        return { ...nextEvent };
    }

    static deleteCalendarEvent(id: string): boolean {
        const events = loadStoredCalendarEvents();
        const nextEvents = events.filter((entry) => entry.id !== id);

        if (nextEvents.length === events.length) {
            return false;
        }

        persistCalendarEvents(nextEvents);
        return true;
    }

    // ── Library document APIs ───────────────────────────────────────────────

    static getLibraryDocuments(): LibraryDocument[] {
        return loadStoredLibraryDocuments().map((doc) => ({ ...doc }));
    }

    static getLibraryDocument(id: string): LibraryDocument | null {
        return loadStoredLibraryDocuments().find((doc) => doc.id === id) ?? null;
    }

    static addLibraryDocument(doc: LibraryDocument): LibraryDocument {
        const docs = loadStoredLibraryDocuments();
        const nextDoc: DummyLibraryDocument = {
            id: doc.id.trim() || `doc-${Date.now()}`,
            name: doc.name.trim(),
            mimeType: doc.mimeType.trim(),
            size: doc.size,
            uploadedBy: doc.uploadedBy.trim(),
            uploadedAt: doc.uploadedAt || new Date().toISOString(),
            description: doc.description.trim(),
            category: doc.category.trim(),
        };
        if (docs.some((d) => d.id === nextDoc.id)) {
            throw new Error('A document with this ID already exists.');
        }
        persistLibraryDocuments([...docs, nextDoc]);
        return { ...nextDoc };
    }

    static updateLibraryDocument(id: string, doc: LibraryDocument): LibraryDocument | null {
        const docs = loadStoredLibraryDocuments();
        const existing = docs.find((d) => d.id === id);
        if (!existing) { return null; }
        const nextDoc: DummyLibraryDocument = {
            id,
            name: doc.name.trim(),
            mimeType: doc.mimeType.trim(),
            size: doc.size,
            uploadedBy: existing.uploadedBy,
            uploadedAt: existing.uploadedAt,
            description: doc.description.trim(),
            category: doc.category.trim(),
        };
        persistLibraryDocuments(docs.map((d) => (d.id === id ? nextDoc : d)));
        return { ...nextDoc };
    }

    static deleteLibraryDocument(id: string): boolean {
        const docs = loadStoredLibraryDocuments();
        const next = docs.filter((d) => d.id !== id);
        if (next.length === docs.length) { return false; }
        persistLibraryDocuments(next);
        return true;
    }

    // ── Finances APIs ───────────────────────────────────────────────────────

    static getFinancesConfig(): FinancesConfig {
        return { ...loadStoredFinancesConfig() };
    }

    static updateFinancesConfig(config: Partial<FinancesConfig>): FinancesConfig {
        const current = loadStoredFinancesConfig();
        const next: DummyFinancesConfig = {
            iban: String(config.iban ?? current.iban).trim(),
            paypal: String(config.paypal ?? current.paypal).trim(),
            revolut: String(config.revolut ?? current.revolut).trim(),
            currency: String(config.currency ?? current.currency).trim() || 'EUR',
        };
        persistFinancesConfig(next);
        return { ...next };
    }

    static getTransactions(): TransactionEntry[] {
        return loadStoredTransactions().map((txn) => ({ ...txn }));
    }

    static getCurrentAmount(): number {
        return loadStoredTransactions().reduce(
            (sum, entry) => sum + (entry.type === 'income' ? entry.amount : -entry.amount),
            0,
        );
    }

    static getTransaction(id: string): TransactionEntry | null {
        return loadStoredTransactions().find((txn) => txn.id === id) ?? null;
    }

    static addTransaction(txn: TransactionEntry): TransactionEntry {
        const transactions = loadStoredTransactions();
        const next: DummyTransaction = {
            id: txn.id.trim() || `txn-${Date.now()}`,
            date: txn.date,
            type: txn.type,
            amount: Number(txn.amount),
            description: txn.description.trim(),
            category: txn.category.trim(),
            createdBy: txn.createdBy.trim(),
        };
        if (transactions.some((entry) => entry.id === next.id)) {
            throw new Error('A transaction with this ID already exists.');
        }
        persistTransactions([...transactions, next]);
        return { ...next };
    }

    static updateTransaction(id: string, txn: TransactionEntry): TransactionEntry | null {
        const transactions = loadStoredTransactions();
        const existing = transactions.find((entry) => entry.id === id);
        if (!existing) { return null; }
        const next: DummyTransaction = {
            ...existing,
            date: txn.date,
            type: txn.type,
            amount: Number(txn.amount),
            description: txn.description.trim(),
            category: txn.category.trim(),
        };
        persistTransactions(transactions.map((entry) => (entry.id === id ? next : entry)));
        return { ...next };
    }

    static deleteTransaction(id: string): boolean {
        const transactions = loadStoredTransactions();
        const next = transactions.filter((entry) => entry.id !== id);
        if (next.length === transactions.length) { return false; }
        persistTransactions(next);
        return true;
    }

    // ── Assets APIs ─────────────────────────────────────────────────────────

    static getAssetCategories(): AssetCategory[] {
        return loadStoredAssetCategories().map((category) => ({ ...category }));
    }

    static addAssetCategory(category: AssetCategory): AssetCategory {
        const categories = loadStoredAssetCategories();
        const next: DummyAssetCategory = {
            id: category.id.trim() || `cat-${Date.now()}`,
            name: category.name.trim(),
            description: category.description.trim(),
        };
        if (!next.name) {
            throw new Error('Category name is required.');
        }
        if (categories.some((entry) => entry.id === next.id)) {
            throw new Error('A category with this ID already exists.');
        }
        persistAssetCategories([...categories, next]);
        return { ...next };
    }

    static updateAssetCategory(id: string, category: AssetCategory): AssetCategory | null {
        const categories = loadStoredAssetCategories();
        const existing = categories.find((entry) => entry.id === id);
        if (!existing) { return null; }
        const next: DummyAssetCategory = {
            id,
            name: category.name.trim(),
            description: category.description.trim(),
        };
        if (!next.name) {
            throw new Error('Category name is required.');
        }
        persistAssetCategories(categories.map((entry) => (entry.id === id ? next : entry)));
        return { ...next };
    }

    static deleteAssetCategory(id: string): boolean {
        const assets = loadStoredAssets();
        if (assets.some((asset) => asset.categoryId === id)) {
            throw new Error('Cannot delete category while assets are assigned to it.');
        }
        const categories = loadStoredAssetCategories();
        const next = categories.filter((entry) => entry.id !== id);
        if (next.length === categories.length) { return false; }
        persistAssetCategories(next);
        return true;
    }

    static getAssets(): AssetItem[] {
        return loadStoredAssets().map((asset) => ({ ...asset }));
    }

    static addAsset(asset: AssetItem): AssetItem {
        const assets = loadStoredAssets();
        const categories = loadStoredAssetCategories();
        const next: DummyAsset = {
            id: asset.id.trim() || `asset-${Date.now()}`,
            name: asset.name.trim(),
            categoryId: asset.categoryId.trim(),
            description: asset.description.trim(),
            price: Number(asset.price),
        };
        if (!next.name) {
            throw new Error('Asset name is required.');
        }
        if (!categories.some((category) => category.id === next.categoryId)) {
            throw new Error('Please select a valid category.');
        }
        if (assets.some((entry) => entry.id === next.id)) {
            throw new Error('An asset with this ID already exists.');
        }
        persistAssets([...assets, next]);
        return { ...next };
    }

    static updateAsset(id: string, asset: AssetItem): AssetItem | null {
        const assets = loadStoredAssets();
        const existing = assets.find((entry) => entry.id === id);
        if (!existing) { return null; }
        const categories = loadStoredAssetCategories();
        const next: DummyAsset = {
            id,
            name: asset.name.trim(),
            categoryId: asset.categoryId.trim(),
            description: asset.description.trim(),
            price: Number(asset.price),
        };
        if (!next.name) {
            throw new Error('Asset name is required.');
        }
        if (!categories.some((category) => category.id === next.categoryId)) {
            throw new Error('Please select a valid category.');
        }
        persistAssets(assets.map((entry) => (entry.id === id ? next : entry)));
        return { ...next };
    }

    static deleteAsset(id: string): boolean {
        const assets = loadStoredAssets();
        const next = assets.filter((entry) => entry.id !== id);
        if (next.length === assets.length) { return false; }
        persistAssets(next);
        return true;
    }

    static sellAsset(assetId: string, soldByUid: string, soldPrice?: number): TransactionEntry | null {
        const assets = loadStoredAssets();
        const asset = assets.find((entry) => entry.id === assetId);
        if (!asset) {
            return null;
        }

        const amount = Number(soldPrice ?? asset.price);
        const transaction: DummyTransaction = {
            id: `txn-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            type: 'income',
            amount,
            description: `Sold asset: ${asset.name}`,
            category: 'Asset Sales',
            createdBy: soldByUid.trim(),
        };

        persistTransactions([...loadStoredTransactions(), transaction]);
        persistAssets(assets.filter((entry) => entry.id !== assetId));

        return { ...transaction };
    }

    static getUserRights(): UserRightDefinition[] {
        return loadStoredUserRights().map((definition) => ({
            ...definition,
            readOnly: [...definition.readOnly],
            readWrite: [...definition.readWrite],
            delete: [...definition.delete],
        }));
    }

    static updateUserRights(definitions: UserRightDefinition[]): UserRightDefinition[] {
        const sanitized = definitions.map((definition) => ({
            pageId: definition.pageId.trim(),
            readOnly: [...new Set(definition.readOnly)].sort(),
            readWrite: [...new Set(definition.readWrite)].sort(),
            delete: [...new Set(definition.delete)].sort(),
        }));

        persistUserRights(sanitized);
        return DataBroker.getUserRights();
    }

    static getUserRight(pageId: string): UserRightDefinition | null {
        return DataBroker.getUserRights().find((definition) => definition.pageId === pageId) ?? null;
    }

    static canAccessPage(
        user: UserProfile | null | undefined,
        pageId: string,
        mode: AccessMode = 'readOnly',
    ): boolean {
        if (!user) { return false; }

        // role gate: empty = accessible to all; non-empty = user must have at least one matching role
        const pageRoles = loadStoredRolePageAccess()
            .filter((m) => m.pageId === pageId)
            .map((m) => m.roleId);
        if (pageRoles.length > 0 && !user.roleIds.some((r) => pageRoles.includes(r))) {
            return false;
        }

        const definition = DataBroker.getUserRight(pageId);
        if (!definition) { return false; }

        return definition[mode].includes(user.accessLevel);
    }

    static getUsers(): UserProfile[] {
        const users = loadStoredUsers();
        const mappings = loadStoredUserRoleMappings();
        return users.map((u) => buildUserProfile(u, mappings));
    }

    static getUser(username: string): UserProfile | null {
        const match = loadStoredUsers().find((user) => user.username === username);
        if (!match) { return null; }
        return buildUserProfile(match, loadStoredUserRoleMappings());
    }

    static getUserByUid(uid: string): UserProfile | null {
        const match = loadStoredUsers().find((user) => user.uid === uid);
        if (!match) { return null; }
        return buildUserProfile(match, loadStoredUserRoleMappings());
    }

    static createSession(credentials: { username: string; password: string }): Session | null {
        const match = loadStoredUsers().find(
            (user) => user.username === credentials.username && user.password === credentials.password
        );
        if (!match) { return null; }
        const profile = buildUserProfile(match, loadStoredUserRoleMappings());
        return { id: `${profile.username}-${Date.now()}`, createdAt: new Date().toISOString(), user: profile };
    }

    static addUser(user: UserProfile & { password?: string }): UserProfile {
        const users = loadStoredUsers();
        const normalizedUsername = user.username.trim();
        const normalizedUid = user.uid.trim() || `USR-${Date.now()}`;
        if (users.some((e) => e.uid === normalizedUid)) { throw new Error('A user with this UID already exists.'); }
        if (users.some((e) => e.username === normalizedUsername)) { throw new Error('A user with this username already exists.'); }
        const nextUser: DummyUser = {
            uid: normalizedUid, name: user.name.trim(), age: user.age,
            email: user.email.trim(), username: normalizedUsername,
            password: user.password?.trim() || normalizedUsername || 'changeme',
            accessLevel: user.accessLevel,
        };
        persistUsers([...users, nextUser]);
        // save roles to junction table
        const roleIds = (user.roleIds ?? []).map((r) => r.trim()).filter(Boolean);
        if (roleIds.length > 0) {
            const allMappings = loadStoredUserRoleMappings();
            persistUserRoleMappings([...allMappings, ...roleIds.map((roleId) => ({ uid: nextUser.uid, roleId }))]);
        }
        return buildUserProfile(nextUser, loadStoredUserRoleMappings());
    }

    static updateUser(uid: string, user: UserProfile & { password?: string }): UserProfile | null {
        const users = loadStoredUsers();
        const existing = users.find((e) => e.uid === uid);
        if (!existing) { return null; }
        const normalizedUsername = user.username.trim();
        if (users.some((e) => e.uid !== uid && e.username === normalizedUsername)) {
            throw new Error('A user with this username already exists.');
        }
        const nextUser: DummyUser = {
            uid: user.uid.trim() || uid, name: user.name.trim(), age: user.age,
            email: user.email.trim(), username: normalizedUsername,
            password: user.password?.trim() || existing.password,
            accessLevel: user.accessLevel,
        };
        persistUsers(users.map((e) => (e.uid === uid ? nextUser : e)));
        // replace roles in junction table
        const roleIds = (user.roleIds ?? []).map((r) => r.trim()).filter(Boolean);
        const otherMappings = loadStoredUserRoleMappings().filter((m) => m.uid !== nextUser.uid);
        persistUserRoleMappings([...otherMappings, ...roleIds.map((roleId) => ({ uid: nextUser.uid, roleId }))]);
        DataBroker.refreshStoredSession();
        return buildUserProfile(nextUser, loadStoredUserRoleMappings());
    }

    static deleteUser(uid: string): boolean {
        const users = loadStoredUsers();
        const nextUsers = users.filter((user) => user.uid !== uid);
        if (nextUsers.length === users.length) { return false; }
        persistUsers(nextUsers);
        // clean up junction table
        persistUserRoleMappings(loadStoredUserRoleMappings().filter((m) => m.uid !== uid));
        DataBroker.refreshStoredSession();
        return true;
    }

    static loadSession(): Session | null {
        if (typeof window === 'undefined') { return null; }
        const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) { return null; }
        try {
            const parsed = JSON.parse(raw) as Session;
            if (!parsed?.user) { throw new Error('Invalid session'); }
            // ensure roleIds is always an array (handles sessions stored before junction table migration)
            if (!Array.isArray(parsed.user.roleIds)) {
                parsed.user.roleIds = [];
            }
            return parsed;
        } catch {
            window.localStorage.removeItem(SESSION_STORAGE_KEY);
            return null;
        }
    }

    static saveSession(session: Session): void {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    static clearSession(): void {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    static refreshStoredSession(): Session | null {
        const session = DataBroker.loadSession();
        if (!session) {
            return null;
        }

        const refreshedUser = DataBroker.getUserByUid(session.user.uid);
        if (!refreshedUser) {
            DataBroker.clearSession();
            return null;
        }

        const refreshedSession = { ...session, user: refreshedUser };
        DataBroker.saveSession(refreshedSession);
        return refreshedSession;
    }

    static destroySession(): void {
        DataBroker.clearSession();
    }

    // ── User-Role mapping APIs ──────────────────────────────────────────────

    static getUserRoleMappings(): UserRoleMapping[] {
        return loadStoredUserRoleMappings().map((m) => ({ ...m }));
    }

    static setUserRoles(uid: string, roleIds: string[]): void {
        const cleanIds = [...new Set(roleIds.map((r) => r.trim()).filter(Boolean))].sort();
        const others = loadStoredUserRoleMappings().filter((m) => m.uid !== uid);
        persistUserRoleMappings([...others, ...cleanIds.map((roleId) => ({ uid, roleId }))]);
        DataBroker.refreshStoredSession();
    }

    static addUserRole(uid: string, roleId: string): void {
        const mappings = loadStoredUserRoleMappings();
        if (!mappings.some((m) => m.uid === uid && m.roleId === roleId)) {
            persistUserRoleMappings([...mappings, { uid, roleId }]);
            DataBroker.refreshStoredSession();
        }
    }

    static removeUserRole(uid: string, roleId: string): void {
        persistUserRoleMappings(loadStoredUserRoleMappings().filter((m) => !(m.uid === uid && m.roleId === roleId)));
        DataBroker.refreshStoredSession();
    }

    // ── Role-Page access APIs ───────────────────────────────────────────────

    static getRolePageAccess(): RolePageAccess[] {
        return loadStoredRolePageAccess().map((m) => ({ ...m }));
    }

    /** Returns role IDs that may access the given page. Empty = everyone may access. */
    static getRolesForPage(pageId: string): string[] {
        return loadStoredRolePageAccess()
            .filter((m) => m.pageId === pageId)
            .map((m) => m.roleId);
    }

    /** Returns page IDs accessible to the given role. */
    static getPagesForRole(roleId: string): string[] {
        return loadStoredRolePageAccess()
            .filter((m) => m.roleId === roleId)
            .map((m) => m.pageId);
    }

    /**
     * Replace the role set for a page.
     * If any roles are specified, the admin role is automatically included.
     * Pass an empty array to make the page accessible to everyone.
     */
    static setPageRoles(pageId: string, roleIds: string[]): void {
        const finalRoleIds = ensureAdminRole([...new Set(roleIds.map((r) => r.trim()).filter(Boolean))]);
        const others = loadStoredRolePageAccess().filter((m) => m.pageId !== pageId);
        persistRolePageAccess([...others, ...finalRoleIds.map((roleId) => ({ roleId, pageId }))]);
    }

    static addRoleToPage(pageId: string, roleId: string): void {
        const current = DataBroker.getRolesForPage(pageId);
        DataBroker.setPageRoles(pageId, [...current, roleId]);
    }

    static removeRoleFromPage(pageId: string, roleId: string): void {
        if (roleId === ADMIN_ROLE_ID) { throw new Error('The admin role cannot be removed from a page.'); }
        const current = DataBroker.getRolesForPage(pageId).filter((r) => r !== roleId);
        DataBroker.setPageRoles(pageId, current);
    }
}