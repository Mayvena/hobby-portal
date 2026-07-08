import React from 'react';
import { Button } from '../Button';
import type { AssetCategory, AssetItem } from '../../dataBroker';
import { DataTable, type DataTableColumn } from '../table/DataTable';

interface AssetsManageTabProps {
    editingAssetId: string | null;
    assetForm: Omit<AssetItem, 'id'>;
    sortedCategories: AssetCategory[];
    sortedAssets: AssetItem[];
    categoriesById: Map<string, string>;
    formatMoney: (amount: number) => string;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onAssetFormChange: (field: keyof Omit<AssetItem, 'id'>, value: string | number) => void;
    onCancel: () => void;
    onEditAsset: (asset: AssetItem) => void;
    onSellAsset: (asset: AssetItem) => void;
    onDeleteAsset: (assetId: string) => void;
}

export function AssetsManageTab({
    editingAssetId,
    assetForm,
    sortedCategories,
    sortedAssets,
    categoriesById,
    formatMoney,
    onSubmit,
    onAssetFormChange,
    onCancel,
    onEditAsset,
    onSellAsset,
    onDeleteAsset,
}: AssetsManageTabProps) {
    const columns: DataTableColumn<AssetItem>[] = [
        {
            key: 'name',
            header: 'Name',
            cell: (asset) => asset.name,
        },
        {
            key: 'category',
            header: 'Category',
            cell: (asset) => categoriesById.get(asset.categoryId) ?? asset.categoryId,
        },
        {
            key: 'price',
            header: 'Price',
            cell: (asset) => formatMoney(asset.price),
            align: 'right',
        },
        {
            key: 'actions',
            header: 'Actions',
            cell: (asset) => (
                <div className="userlist-row-actions">
                    <button type="button" className="userlist-secondary-button" onClick={() => onEditAsset(asset)}>
                        Edit
                    </button>
                    <button type="button" className="userlist-secondary-button" onClick={() => onSellAsset(asset)}>
                        Sell
                    </button>
                    <button type="button" className="userlist-danger-button" onClick={() => onDeleteAsset(asset.id)}>
                        Remove
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <form className="calendar-form" onSubmit={onSubmit}>
                <input
                    className="userlist-input"
                    type="text"
                    placeholder="Asset name"
                    value={assetForm.name}
                    onChange={(event) => onAssetFormChange('name', event.target.value)}
                    required
                />
                <select
                    className="userlist-select"
                    value={assetForm.categoryId}
                    onChange={(event) => onAssetFormChange('categoryId', event.target.value)}
                    required
                >
                    <option value="">Select category</option>
                    {sortedCategories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
                <input
                    className="userlist-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={assetForm.price === 0 ? '' : assetForm.price}
                    onChange={(event) => onAssetFormChange('price', Number(event.target.value) || 0)}
                    required
                />
                <input
                    className="userlist-input"
                    type="text"
                    placeholder="Description"
                    value={assetForm.description}
                    onChange={(event) => onAssetFormChange('description', event.target.value)}
                    required
                />
                <div className="profile-actions">
                    <Button label={editingAssetId ? 'Save asset' : 'Add asset'} type="submit" onClick={() => undefined} />
                    {editingAssetId ? (
                        <button type="button" className="userlist-secondary-button" onClick={onCancel}>Cancel</button>
                    ) : null}
                </div>
            </form>

            <DataTable
                columns={columns}
                rows={sortedAssets}
                rowKey={(asset) => asset.id}
                emptyMessage="No assets to manage."
                minWidth={760}
            />
        </>
    );
}