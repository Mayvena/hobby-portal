import React from 'react';
import { Button } from '../Button';
import { DataTable, type DataTableColumn } from '../table/DataTable';
import type { AssetCategory, AssetItem } from '../../dataBroker';

interface AssetCategoriesTabProps {
    editingCategoryId: string | null;
    categoryForm: Omit<AssetCategory, 'id'>;
    sortedCategories: AssetCategory[];
    assets: AssetItem[];
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCategoryFormChange: (field: keyof Omit<AssetCategory, 'id'>, value: string) => void;
    onCancel: () => void;
    onEditCategory: (category: AssetCategory) => void;
    onDeleteCategory: (categoryId: string) => void;
}

export function AssetCategoriesTab({
    editingCategoryId,
    categoryForm,
    sortedCategories,
    assets,
    onSubmit,
    onCategoryFormChange,
    onCancel,
    onEditCategory,
    onDeleteCategory,
}: AssetCategoriesTabProps) {
    const columns: DataTableColumn<AssetCategory>[] = [
        {
            key: 'name',
            header: 'Name',
            cell: (category) => category.name,
        },
        {
            key: 'description',
            header: 'Description',
            cell: (category) => category.description,
        },
        {
            key: 'assignedAssets',
            header: 'Assigned assets',
            cell: (category) => assets.filter((asset) => asset.categoryId === category.id).length,
        },
        {
            key: 'actions',
            header: 'Actions',
            cell: (category) => (
                <div className="userlist-row-actions">
                    <button type="button" className="userlist-secondary-button" onClick={() => onEditCategory(category)}>
                        Edit
                    </button>
                    <button
                        type="button"
                        className="userlist-danger-button"
                        onClick={() => onDeleteCategory(category.id)}
                    >
                        Delete
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
                    placeholder="Category name"
                    value={categoryForm.name}
                    onChange={(event) => onCategoryFormChange('name', event.target.value)}
                    required
                />
                <input
                    className="userlist-input"
                    type="text"
                    placeholder="Description"
                    value={categoryForm.description}
                    onChange={(event) => onCategoryFormChange('description', event.target.value)}
                    required
                />
                <div className="profile-actions">
                    <Button label={editingCategoryId ? 'Save category' : 'Add category'} type="submit" onClick={() => undefined} />
                    {editingCategoryId ? (
                        <button type="button" className="userlist-secondary-button" onClick={onCancel}>Cancel</button>
                    ) : null}
                </div>
            </form>

            <DataTable
                columns={columns}
                rows={sortedCategories}
                rowKey={(category) => category.id}
                emptyMessage="No categories available."
                minWidth={760}
            />
        </>
    );
}