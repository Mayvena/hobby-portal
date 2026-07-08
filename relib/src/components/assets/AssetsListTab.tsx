import React from 'react';
import type { AssetCategory, AssetItem } from '../../dataBroker';
import { DataTable, type DataTableColumn } from '../table/DataTable';

interface AssetsListTabProps {
    searchTerm: string;
    categoryFilter: string;
    minPriceFilter: string;
    maxPriceFilter: string;
    sortedCategories: AssetCategory[];
    filteredAssets: AssetItem[];
    sortedAssets: AssetItem[];
    categoriesById: Map<string, string>;
    isStoreManager: boolean;
    canManage: boolean;
    canManageDelete: boolean;
    onSearchTermChange: (value: string) => void;
    onCategoryFilterChange: (value: string) => void;
    onMinPriceFilterChange: (value: string) => void;
    onMaxPriceFilterChange: (value: string) => void;
    onClearFilters: () => void;
    onSort: (field: 'name' | 'price') => void;
    sortIndicator: (field: 'name' | 'price') => string;
    formatMoney: (amount: number) => string;
    onEditAsset: (asset: AssetItem) => void;
    onSellAsset: (asset: AssetItem) => void;
    onDeleteAsset: (assetId: string) => void;
}

export function AssetsListTab({
    searchTerm,
    categoryFilter,
    minPriceFilter,
    maxPriceFilter,
    sortedCategories,
    filteredAssets,
    sortedAssets,
    categoriesById,
    isStoreManager,
    canManage,
    canManageDelete,
    onSearchTermChange,
    onCategoryFilterChange,
    onMinPriceFilterChange,
    onMaxPriceFilterChange,
    onClearFilters,
    onSort,
    sortIndicator,
    formatMoney,
    onEditAsset,
    onSellAsset,
    onDeleteAsset,
}: AssetsListTabProps) {
    const columns: DataTableColumn<AssetItem>[] = [
        {
            key: 'name',
            header: `Name${sortIndicator('name')}`,
            sortable: true,
            sortDirection: sortIndicator('name').trim() === '▲' ? 'asc' : sortIndicator('name').trim() === '▼' ? 'desc' : null,
            onSort: () => onSort('name'),
            cell: (asset) => asset.name,
        },
        {
            key: 'category',
            header: 'Category',
            cell: (asset) => categoriesById.get(asset.categoryId) ?? asset.categoryId,
        },
        {
            key: 'description',
            header: 'Description',
            cell: (asset) => asset.description,
        },
        {
            key: 'price',
            header: `Price${sortIndicator('price')}`,
            sortable: true,
            sortDirection: sortIndicator('price').trim() === '▲' ? 'asc' : sortIndicator('price').trim() === '▼' ? 'desc' : null,
            onSort: () => onSort('price'),
            cell: (asset) => formatMoney(asset.price),
        },
        ...(isStoreManager ? [{
            key: 'actions',
            header: 'Actions',
            cell: (asset: AssetItem) => (
                <div className="userlist-row-actions">
                    <button
                        type="button"
                        className="userlist-secondary-button"
                        onClick={() => onEditAsset(asset)}
                        disabled={!canManage}
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        className="userlist-secondary-button"
                        onClick={() => onSellAsset(asset)}
                        disabled={!canManage}
                    >
                        Sell
                    </button>
                    <button
                        type="button"
                        className="userlist-danger-button"
                        onClick={() => onDeleteAsset(asset.id)}
                        disabled={!canManageDelete}
                    >
                        Remove
                    </button>
                </div>
            ),
        }] : []),
    ];

    return (
        <>
            <div className="userlist-toolbar" style={{ gridTemplateColumns: 'minmax(0, 1fr) repeat(3, minmax(0, 180px)) auto' }}>
                <input
                    className="userlist-input"
                    type="search"
                    placeholder="Search by name, description, category"
                    value={searchTerm}
                    onChange={(event) => onSearchTermChange(event.target.value)}
                />
                <select
                    className="userlist-select"
                    value={categoryFilter}
                    onChange={(event) => onCategoryFilterChange(event.target.value)}
                >
                    <option value="all">All categories</option>
                    {sortedCategories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
                <input
                    className="userlist-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Min price"
                    value={minPriceFilter}
                    onChange={(event) => onMinPriceFilterChange(event.target.value)}
                />
                <input
                    className="userlist-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Max price"
                    value={maxPriceFilter}
                    onChange={(event) => onMaxPriceFilterChange(event.target.value)}
                />
                <button type="button" className="userlist-secondary-button" onClick={onClearFilters}>
                    Clear
                </button>
            </div>

            <p style={{ margin: '0 0 0.75rem', color: 'var(--color-text-secondary, #666)' }}>
                Showing {filteredAssets.length} of {sortedAssets.length} assets
            </p>

            <DataTable
                columns={columns}
                rows={filteredAssets}
                rowKey={(asset) => asset.id}
                emptyMessage="No assets match the current filters."
                minWidth={760}
            />
        </>
    );
}