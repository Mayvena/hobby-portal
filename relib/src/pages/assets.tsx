import React, { useMemo, useState } from 'react';
import { AssetCategoriesTab } from '../components/assets/AssetCategoriesTab';
import { AssetsListTab } from '../components/assets/AssetsListTab';
import { AssetsManageTab } from '../components/assets/AssetsManageTab';
import { DataBroker, type AssetCategory, type AssetItem, type Session } from '../dataBroker';
import { useStatusMessage } from '../hooks/useStatusMessage';

interface AssetsProps {
    session: Session | null;
}

type AssetsTab = 'list' | 'manage' | 'categories';
type SortField = 'name' | 'price';
type SortDir = 'asc' | 'desc';

const STORE_MANAGER_ROLE_ID = 'storemanager';

const createEmptyAssetForm = (): Omit<AssetItem, 'id'> => ({
    name: '',
    categoryId: '',
    description: '',
    price: 0,
});

const createEmptyCategoryForm = (): Omit<AssetCategory, 'id'> => ({
    name: '',
    description: '',
});

const formatMoney = (amount: number, currency: string): string => {
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
    } catch {
        return `${amount.toFixed(2)} ${currency}`;
    }
};

export default function Assets({ session }: AssetsProps) {
    const [activeTab, setActiveTab] = useState<AssetsTab>('list');
    const [assets, setAssets] = useState<AssetItem[]>(() => DataBroker.getAssets());
    const [categories, setCategories] = useState<AssetCategory[]>(() => DataBroker.getAssetCategories());
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [minPriceFilter, setMinPriceFilter] = useState('');
    const [maxPriceFilter, setMaxPriceFilter] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
    const [assetForm, setAssetForm] = useState(createEmptyAssetForm());
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [categoryForm, setCategoryForm] = useState(createEmptyCategoryForm());
    const [formError, setFormError] = useState('');
    const { statusMessage, showStatusMessage } = useStatusMessage();

    const canRead = DataBroker.canAccessPage(session?.user, 'assets', 'readOnly');
    const canWrite = DataBroker.canAccessPage(session?.user, 'assets', 'readWrite');
    const canDelete = DataBroker.canAccessPage(session?.user, 'assets', 'delete');
    const isStoreManager = DataBroker.userHasRole(session?.user, STORE_MANAGER_ROLE_ID);

    const canManage = canWrite && isStoreManager;
    const canManageDelete = canDelete && isStoreManager;

    const financesConfig = useMemo(() => DataBroker.getFinancesConfig(), []);

    const categoriesById = useMemo(
        () => new Map(categories.map((category) => [category.id, category.name])),
        [categories],
    );

    const sortedAssets = useMemo(() => {
        return [...assets].sort((left, right) => {
            let cmp = 0;
            if (sortField === 'name') {
                cmp = left.name.localeCompare(right.name);
            } else {
                cmp = left.price - right.price;
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [assets, sortField, sortDir]);

    const handleSort = (field: SortField): void => {
        setSortDir((current) => (sortField === field && current === 'asc' ? 'desc' : 'asc'));
        setSortField(field);
    };

    const sortIndicator = (field: SortField): string => {
        if (sortField !== field) { return ''; }
        return sortDir === 'asc' ? ' ▲' : ' ▼';
    };

    const filteredAssets = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        const minPrice = minPriceFilter.trim() === '' ? null : Number(minPriceFilter);
        const maxPrice = maxPriceFilter.trim() === '' ? null : Number(maxPriceFilter);

        return sortedAssets.filter((asset) => {
            const categoryName = (categoriesById.get(asset.categoryId) ?? '').toLowerCase();
            const matchesQuery =
                query.length === 0 ||
                asset.name.toLowerCase().includes(query) ||
                asset.description.toLowerCase().includes(query) ||
                categoryName.includes(query);
            const matchesCategory = categoryFilter === 'all' || asset.categoryId === categoryFilter;
            const matchesMin = minPrice === null || Number.isNaN(minPrice) || asset.price >= minPrice;
            const matchesMax = maxPrice === null || Number.isNaN(maxPrice) || asset.price <= maxPrice;
            return matchesQuery && matchesCategory && matchesMin && matchesMax;
        });
    }, [sortedAssets, categoriesById, searchTerm, categoryFilter, minPriceFilter, maxPriceFilter]);

    const sortedCategories = useMemo(
        () => [...categories].sort((left, right) => left.name.localeCompare(right.name)),
        [categories],
    );

    const refreshData = (): void => {
        setAssets(DataBroker.getAssets());
        setCategories(DataBroker.getAssetCategories());
    };

    const resetAssetForm = (): void => {
        setEditingAssetId(null);
        setAssetForm(createEmptyAssetForm());
    };

    const resetCategoryForm = (): void => {
        setEditingCategoryId(null);
        setCategoryForm(createEmptyCategoryForm());
    };

    const handleAssetSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (!canManage) {
            return;
        }
        setFormError('');
        try {
            if (editingAssetId) {
                DataBroker.updateAsset(editingAssetId, { id: editingAssetId, ...assetForm });
                showStatusMessage('Asset updated.');
            } else {
                DataBroker.addAsset({ id: '', ...assetForm });
                showStatusMessage('Asset added.');
            }
            refreshData();
            resetAssetForm();
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Could not save asset.');
        }
    };

    const handleAssetEdit = (asset: AssetItem): void => {
        if (!canManage) {
            return;
        }
        setFormError('');
        setEditingAssetId(asset.id);
        setAssetForm({
            name: asset.name,
            categoryId: asset.categoryId,
            description: asset.description,
            price: asset.price,
        });
        setActiveTab('manage');
    };

    const handleAssetDelete = (assetId: string): void => {
        if (!canManageDelete) {
            return;
        }
        DataBroker.deleteAsset(assetId);
        refreshData();
        if (editingAssetId === assetId) {
            resetAssetForm();
        }
        showStatusMessage('Asset removed.');
    };

    const handleAssetSell = (asset: AssetItem): void => {
        if (!canManage || !session?.user) {
            return;
        }
        const transaction = DataBroker.sellAsset(asset.id, session.user.uid);
        if (!transaction) {
            setFormError('Asset could not be sold.');
            return;
        }
        refreshData();
        if (editingAssetId === asset.id) {
            resetAssetForm();
        }
        showStatusMessage(`Asset sold. Transaction ${transaction.id} created.`);
    };

    const handleCategorySubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (!canManage) {
            return;
        }
        setFormError('');
        try {
            if (editingCategoryId) {
                DataBroker.updateAssetCategory(editingCategoryId, { id: editingCategoryId, ...categoryForm });
                showStatusMessage('Category updated.');
            } else {
                DataBroker.addAssetCategory({ id: '', ...categoryForm });
                showStatusMessage('Category added.');
            }
            refreshData();
            resetCategoryForm();
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Could not save category.');
        }
    };

    const handleCategoryEdit = (category: AssetCategory): void => {
        if (!canManage) {
            return;
        }
        setFormError('');
        setEditingCategoryId(category.id);
        setCategoryForm({
            name: category.name,
            description: category.description,
        });
        setActiveTab('categories');
    };

    const handleCategoryDelete = (categoryId: string): void => {
        if (!canManageDelete) {
            return;
        }
        setFormError('');
        try {
            DataBroker.deleteAssetCategory(categoryId);
            refreshData();
            if (editingCategoryId === categoryId) {
                resetCategoryForm();
            }
            showStatusMessage('Category deleted.');
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Could not delete category.');
        }
    };

    if (!session || !canRead) {
        return (
            <section className="calendar-page">
                <div className="userlist-message-card">
                    <h2>Access unavailable</h2>
                    <p>Your current rights do not allow access to the assets page.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="calendar-page">
            <div className="userlist-heading">
                <div>
                    <p className="eyebrow">Organization Store</p>
                    <h1>Assets</h1>
                    <p>Track all material assets owned by the organization and manage store operations.</p>
                </div>
            </div>

            {statusMessage ? <p className="profile-success" role="status">{statusMessage}</p> : null}
            {formError ? <p className="login-error" role="alert">{formError}</p> : null}

            <div className="calendar-view-switcher" style={{ marginBottom: '1.5rem' }}>
                <button
                    type="button"
                    className={`userlist-secondary-button${activeTab === 'list' ? ' calendar-view-active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    Asset list
                </button>
                {isStoreManager ? (
                    <button
                        type="button"
                        className={`userlist-secondary-button${activeTab === 'manage' ? ' calendar-view-active' : ''}`}
                        onClick={() => setActiveTab('manage')}
                    >
                        Manage assets
                    </button>
                ) : null}
                {isStoreManager ? (
                    <button
                        type="button"
                        className={`userlist-secondary-button${activeTab === 'categories' ? ' calendar-view-active' : ''}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        Categories
                    </button>
                ) : null}
            </div>

            {activeTab === 'list' ? (
                <AssetsListTab
                    searchTerm={searchTerm}
                    categoryFilter={categoryFilter}
                    minPriceFilter={minPriceFilter}
                    maxPriceFilter={maxPriceFilter}
                    sortedCategories={sortedCategories}
                    filteredAssets={filteredAssets}
                    sortedAssets={sortedAssets}
                    categoriesById={categoriesById}
                    isStoreManager={isStoreManager}
                    canManage={canManage}
                    canManageDelete={canManageDelete}
                    onSearchTermChange={setSearchTerm}
                    onCategoryFilterChange={setCategoryFilter}
                    onMinPriceFilterChange={setMinPriceFilter}
                    onMaxPriceFilterChange={setMaxPriceFilter}
                    onClearFilters={() => {
                        setSearchTerm('');
                        setCategoryFilter('all');
                        setMinPriceFilter('');
                        setMaxPriceFilter('');
                        setSortField('name');
                        setSortDir('asc');
                    }}
                    onSort={handleSort}
                    sortIndicator={sortIndicator}
                    formatMoney={(amount) => formatMoney(amount, financesConfig.currency || 'EUR')}
                    onEditAsset={handleAssetEdit}
                    onSellAsset={handleAssetSell}
                    onDeleteAsset={handleAssetDelete}
                />
            ) : null}

            {activeTab === 'manage' && isStoreManager ? (
                <AssetsManageTab
                    editingAssetId={editingAssetId}
                    assetForm={assetForm}
                    sortedCategories={sortedCategories}
                    sortedAssets={sortedAssets}
                    categoriesById={categoriesById}
                    formatMoney={(amount) => formatMoney(amount, financesConfig.currency || 'EUR')}
                    onSubmit={handleAssetSubmit}
                    onAssetFormChange={(field, value) => setAssetForm((current) => ({ ...current, [field]: value }))}
                    onCancel={resetAssetForm}
                    onEditAsset={handleAssetEdit}
                    onSellAsset={handleAssetSell}
                    onDeleteAsset={handleAssetDelete}
                />
            ) : null}

            {activeTab === 'categories' && isStoreManager ? (
                <AssetCategoriesTab
                    editingCategoryId={editingCategoryId}
                    categoryForm={categoryForm}
                    sortedCategories={sortedCategories}
                    assets={assets}
                    onSubmit={handleCategorySubmit}
                    onCategoryFormChange={(field, value) => setCategoryForm((current) => ({ ...current, [field]: value }))}
                    onCancel={resetCategoryForm}
                    onEditCategory={handleCategoryEdit}
                    onDeleteCategory={handleCategoryDelete}
                />
            ) : null}
        </section>
    );
}
