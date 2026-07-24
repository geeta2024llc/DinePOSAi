'use client';

import React, { useState, useEffect } from 'react';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import {
  InventoryItem,
  MenuItemRecipe,
  Supplier,
  PurchaseOrder,
  WasteLog,
  InventoryTransaction,
  WasteReason
} from '@dineposai/shared-types';
import {
  getIngredients,
  getRecipes,
  getSuppliers,
  getPurchaseOrders,
  getWasteLogs,
  getTransactions,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  createSupplier,
  updateSupplierApi,
  deleteSupplierApi,
  createPurchaseOrderApi,
  receivePurchaseOrder,
  cancelPurchaseOrderApi,
  recordWaste,
  manuallyAdjustStock,
  saveMenuItemRecipeApi
} from '../../../app/inventoryUtils';
import { isDemoTenant } from '@/utils/api';

interface InventoryTabProps {
  t: any;
  tr: any;
  currency: string;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
  menuItemsList: any[]; // We need this to list menu items for recipe mapping
}

export default function InventoryTab({ t, tr, currency, triggerToast, menuItemsList }: InventoryTabProps) {
  const [inventorySubTab, setInventorySubTab] = useState<'stock' | 'recipes' | 'suppliers' | 'orders' | 'waste' | 'ledger'>('stock');
  const [ingredientsList, setIngredientsList] = useState<InventoryItem[]>([]);
  const [recipesList, setRecipesList] = useState<MenuItemRecipe[]>([]);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);
  const [purchaseOrdersList, setPurchaseOrdersList] = useState<PurchaseOrder[]>([]);
  const [wasteLogsList, setWasteLogsList] = useState<WasteLog[]>([]);
  const [transactionsList, setTransactionsList] = useState<InventoryTransaction[]>([]);

  // Modals & Form states
  const [showIngModal, setShowIngModal] = useState(false);
  const [editingIng, setEditingIng] = useState<InventoryItem | null>(null);
  const [ingForm, setIngForm] = useState({
    name: '', sku: '', unit: 'pcs', costPerUnit: 0, stockLevel: 0, minStockLevel: 0
  });

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustingIng, setAdjustingIng] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustNotes, setAdjustNotes] = useState('');

  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeMenuItem, setRecipeMenuItem] = useState<any | null>(null);
  const [recipeIngs, setRecipeIngs] = useState<{ ingredientId: string; quantity: number }[]>([]);

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '', contactName: '', email: '', phone: '', address: ''
  });

  const [showPoModal, setShowPoModal] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poItems, setPoItems] = useState<{ ingredientId: string; quantity: number; unitCost: number }[]>([]);

  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteIngId, setWasteIngId] = useState('');
  const [wasteQty, setWasteQty] = useState(0);
  const [wasteReason, setWasteReason] = useState<WasteReason>('SPOILAGE');
  const [wasteNotes, setWasteNotes] = useState('');

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ type: 'ingredient' | 'supplier'; id: string; name: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const currencySymbols: Record<string, string> = { USD: '$', JPY: '¥', EUR: '€', GBP: '£', CNY: '¥', KRW: '₩' };
  const currencyRates: Record<string, number> = { USD: 1, JPY: 150, EUR: 0.92, GBP: 0.79, CNY: 7.24, KRW: 1340 };
  
  const formatCurrency = (val: number) => {
    const rate = currencyRates[currency] || 1;
    const sym = currencySymbols[currency] || '$';
    const converted = (parseFloat(val as any) || 0) * rate;
    if (currency === 'JPY' || currency === 'KRW') return `${sym}${Math.round(converted).toLocaleString()}`;
    return `${sym}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const reloadInventory = async () => {
    try {
      const [ings, recs, sups, pos, wastes, txs] = await Promise.all([
        getIngredients(),
        getRecipes(),
        getSuppliers(),
        getPurchaseOrders(),
        getWasteLogs(),
        getTransactions()
      ]);
      setIngredientsList(ings);
      setRecipesList(recs);
      setSuppliersList(sups);
      setPurchaseOrdersList(pos);
      setWasteLogsList(wastes);
      setTransactionsList(txs);
    } catch {
      // Backend offline — keep existing state
    }
  };

  useEffect(() => {
    reloadInventory();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      reloadInventory();
    };
    window.addEventListener('dinepos_inventory_update', handleUpdate);
    return () => window.removeEventListener('dinepos_inventory_update', handleUpdate);
  }, []);

  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIng) {
      const updated = await updateIngredient(editingIng.id, {
        name: ingForm.name,
        sku: ingForm.sku || null,
        unit: ingForm.unit,
        costPerUnit: ingForm.costPerUnit,
        stockLevel: ingForm.stockLevel,
        minStockLevel: ingForm.minStockLevel,
      });
      if (updated) {
        triggerToast('Ingredient updated successfully.', 'success');
      } else {
        triggerToast('Failed to update ingredient.', 'info');
      }
    } else {
      const created = await createIngredient({
        name: ingForm.name,
        sku: ingForm.sku || null,
        unit: ingForm.unit,
        costPerUnit: ingForm.costPerUnit,
        stockLevel: ingForm.stockLevel,
        minStockLevel: ingForm.minStockLevel,
      });
      if (created) {
        triggerToast('Ingredient added successfully.', 'success');
      } else {
        triggerToast('Failed to add ingredient.', 'info');
      }
    }
    reloadInventory();
    setShowIngModal(false);
    setEditingIng(null);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingIng) return;
    const success = await manuallyAdjustStock(adjustingIng.id, adjustQty, adjustNotes, 'Admin');
    if (success) {
      triggerToast('Stock level adjusted successfully.', 'success');
      reloadInventory();
      setShowAdjustModal(false);
      setAdjustingIng(null);
      setAdjustQty(0);
      setAdjustNotes('');
    } else {
      triggerToast('Failed to adjust stock level.', 'info');
    }
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeMenuItem) return;
    const success = await saveMenuItemRecipeApi(
      recipeMenuItem.id,
      null,
      recipeIngs.map(ri => ({ ingredientId: ri.ingredientId, quantity: ri.quantity }))
    );
    if (success) {
      triggerToast(`Recipe for "${recipeMenuItem.name}" saved successfully.`, 'success');
    } else {
      triggerToast(`Failed to save recipe for "${recipeMenuItem.name}".`, 'info');
    }
    reloadInventory();
    setShowRecipeModal(false);
    setRecipeMenuItem(null);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      const updated = await updateSupplierApi(editingSupplier.id, {
        name: supplierForm.name,
        contactName: supplierForm.contactName || null,
        email: supplierForm.email || null,
        phone: supplierForm.phone || null,
        address: supplierForm.address || null,
      });
      if (updated) {
        triggerToast('Supplier updated successfully.', 'success');
      } else {
        triggerToast('Failed to update supplier.', 'info');
      }
    } else {
      const created = await createSupplier({
        name: supplierForm.name,
        contactName: supplierForm.contactName || null,
        email: supplierForm.email || null,
        phone: supplierForm.phone || null,
        address: supplierForm.address || null,
      });
      if (created) {
        triggerToast('Supplier added successfully.', 'success');
      } else {
        triggerToast('Failed to add supplier.', 'info');
      }
    }
    reloadInventory();
    setShowSupplierModal(false);
    setEditingSupplier(null);
  };

  const handleCreatePurchaseOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      triggerToast('Please add at least one ingredient to order.', 'info');
      return;
    }
    const created = await createPurchaseOrderApi(
      poSupplierId || null,
      poItems.map(item => ({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unitCost: item.unitCost
      }))
    );
    if (created) {
      triggerToast('Purchase Order generated successfully.', 'success');
    } else {
      triggerToast('Failed to create purchase order.', 'info');
    }
    reloadInventory();
    setShowPoModal(false);
    setPoSupplierId('');
    setPoItems([]);
  };

  const handleReceivePO = async (poId: string) => {
    const success = await receivePurchaseOrder(poId, 'Admin');
    if (success) {
      triggerToast('Purchase order RECEIVED. Stock updated.', 'success');
      reloadInventory();
    } else {
      triggerToast('Failed to receive purchase order.', 'info');
    }
  };

  const handleCancelPO = async (poId: string) => {
    const success = await cancelPurchaseOrderApi(poId);
    if (success) {
      triggerToast('Purchase order cancelled.', 'info');
      reloadInventory();
    } else {
      triggerToast('Failed to cancel purchase order.', 'info');
    }
  };

  const handleRecordWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteIngId) {
      triggerToast('Please select an ingredient.', 'info');
      return;
    }
    const success = await recordWaste(wasteIngId, wasteQty, wasteReason, wasteNotes, 'Admin');
    if (success) {
      triggerToast('Food waste event logged successfully.', 'success');
      reloadInventory();
      setShowWasteModal(false);
      setWasteIngId('');
      setWasteQty(0);
      setWasteReason('SPOILAGE');
      setWasteNotes('');
    } else {
      triggerToast('Failed to log waste event.', 'info');
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    const success = await deleteIngredient(id);
    if (success) {
      triggerToast('Ingredient deleted successfully.', 'success');
    } else {
      triggerToast('Failed to delete ingredient.', 'info');
    }
    reloadInventory();
  };

  const handleDeleteSupplier = async (id: string) => {
    const success = await deleteSupplierApi(id);
    if (success) {
      triggerToast('Supplier deleted.', 'success');
    } else {
      triggerToast('Failed to delete supplier.', 'info');
    }
    reloadInventory();
  };

  const addRecipeRow = () => {
    if (ingredientsList.length === 0) return;
    setRecipeIngs([...recipeIngs, { ingredientId: ingredientsList[0].id, quantity: 1 }]);
  };

  const updateRecipeRow = (index: number, field: 'ingredientId' | 'quantity', value: any) => {
    setRecipeIngs(recipeIngs.map((ri, idx) => idx === index ? { ...ri, [field]: value } : ri));
  };

  const removeRecipeRow = (index: number) => {
    setRecipeIngs(recipeIngs.filter((_, idx) => idx !== index));
  };

  const addPoRow = () => {
    if (ingredientsList.length === 0) return;
    setPoItems([...poItems, { ingredientId: ingredientsList[0].id, quantity: 1, unitCost: ingredientsList[0].costPerUnit }]);
  };

  const updatePoRow = (index: number, field: 'ingredientId' | 'quantity' | 'unitCost', value: any) => {
    setPoItems(poItems.map((item, idx) => {
      if (idx === index) {
        const updated = { ...item, [field]: value } as any;
        if (field === 'ingredientId') {
          const ing = ingredientsList.find(i => i.id === value);
          if (ing) {
            updated.unitCost = ing.costPerUnit;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const removePoRow = (index: number) => {
    setPoItems(poItems.filter((_, idx) => idx !== index));
  };

  return (
    <>
      {/* INVENTORY TAB JSX */}
                  <div className="space-y-8 animate-fade-in duration-300 font-sans">
              
              {/* Header Title Block */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 select-none">
                <div>
                  <h2 className={`font-serif text-[38px] font-bold ${t.accent} tracking-wide leading-none`}>
                    {tr.inventoryTitle || 'Inventory & Recipes'}
                  </h2>
                  <p className={`font-sans text-[12.5px] ${t.textMuted} mt-3 font-semibold`}>
                    {tr.inventoryDesc || 'Monitor raw ingredients, set recipes for automatic order deduction, coordinate with suppliers, and track waste logs.'}
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => triggerToast('Inventory report exported as CSV.', 'success')}
                  className={`px-5 py-2.5 bg-transparent border ${t.buttonOutline} rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2`}
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export CSV
                </button>
              </div>

              {/* OVERVIEW METRICS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
                <div className={`${t.cardBgOpaque} rounded-2xl p-6 shadow-xl flex items-center gap-5 border`}>
                  <div className="w-12 h-12 rounded-xl bg-[#ffe2ab]/10 text-[#ffe2ab] flex items-center justify-center border border-[#ffe2ab]/20">
                    <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                  </div>
                  <div>
                    <div className={`${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1`}>Total Stock Value</div>
                    <div className={`text-xl font-serif font-semibold ${t.text}`}>
                      {currency === 'JPY' ? '¥' : '$'}
                      {ingredientsList.reduce((acc, ing) => acc + (ing.stockLevel * ing.costPerUnit), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className={`${t.cardBgOpaque} rounded-2xl p-6 shadow-xl flex items-center gap-5 border`}>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <span className="material-symbols-outlined text-2xl">warning</span>
                  </div>
                  <div>
                    <div className={`${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1`}>Low Stock Items</div>
                    <div className="text-xl font-serif font-semibold text-amber-400">
                      {ingredientsList.filter(ing => ing.stockLevel <= ing.minStockLevel && ing.stockLevel > 0).length} Items
                    </div>
                  </div>
                </div>

                <div className={`${t.cardBgOpaque} rounded-2xl p-6 shadow-xl flex items-center gap-5 border`}>
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                    <span className="material-symbols-outlined text-2xl">dangerous</span>
                  </div>
                  <div>
                    <div className={`${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1`}>Out of Stock</div>
                    <div className="text-xl font-serif font-semibold text-rose-400">
                      {ingredientsList.filter(ing => ing.stockLevel <= 0).length} Items
                    </div>
                  </div>
                </div>
              </div>

              {/* SUB-TABS SELECTOR */}
              <div className="flex border-b border-white/5 pb-2 gap-2 overflow-x-auto select-none scrollbar-none">
                {[
                  { id: 'stock', label: 'Stock Levels', icon: 'inventory' },
                  { id: 'recipes', label: 'Dish Recipes', icon: 'receipt_long' },
                  { id: 'suppliers', label: 'Suppliers', icon: 'local_shipping' },
                  { id: 'orders', label: 'Purchase Orders', icon: 'shopping_bag' },
                  { id: 'waste', label: 'Waste Logs', icon: 'delete_outline' },
                  { id: 'ledger', label: 'Stock Ledger', icon: 'menu_book' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setInventorySubTab(sub.id as any);
                      setSearchQuery('');
                    }}
                    className={`flex items-center gap-2 px-5 py-3 font-bold text-[11px] uppercase tracking-wider transition-all duration-200 rounded-xl whitespace-nowrap cursor-pointer ${
                      inventorySubTab === sub.id
                        ? `${t.accentBg} ${t.accentText} shadow-md`
                        : `${t.textMuted} hover:text-white hover:bg-white/5`
                    }`}
                  >
                    <span className="material-symbols-outlined text-base leading-none">{sub.icon}</span>
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* TAB 8.1: STOCK LEVELS */}
              {inventorySubTab === 'stock' && (
                <div className={`${t.cardBgOpaque} rounded-2xl border shadow-xl overflow-hidden`}>
                  <div className="p-6 border-b border-white/5 flex items-center justify-between select-none">
                    <h3 className={`${t.text} font-bold text-sm tracking-wide`}>Ingredient Inventory</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIng(null);
                        setIngForm({ name: '', sku: '', unit: 'kg', costPerUnit: 0, stockLevel: 0, minStockLevel: 0 });
                        setShowIngModal(true);
                      }}
                      className={`px-4 py-2 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow`}
                    >
                      + Add Ingredient
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className={`border-b ${t.borderStrong} text-[9.5px] uppercase tracking-wider font-bold ${t.textMuted} select-none`}>
                          <th className="py-4 px-6">Ingredient</th>
                          <th className="py-4 px-4">SKU</th>
                          <th className="py-4 px-4 text-right">Cost / Unit</th>
                          <th className="py-4 px-4 text-right">Current Stock</th>
                          <th className="py-4 px-4 text-right">Min Level</th>
                          <th className="py-4 px-4 text-center">Status</th>
                          <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${t.divider}`}>
                        {ingredientsList
                          .filter(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()) || (ing.sku && ing.sku.toLowerCase().includes(searchQuery.toLowerCase())))
                          .map(ing => {
                            const isOutOfStock = ing.stockLevel <= 0;
                            const isLowStock = ing.stockLevel <= ing.minStockLevel && ing.stockLevel > 0;
                            const statusColor = isOutOfStock ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : isLowStock ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                            const statusText = isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Good';
                            return (
                              <tr key={ing.id} className={`hover:${t.cardHover} transition-colors`}>
                                <td className={`py-4 px-6 font-semibold ${t.text}`}>{ing.name}</td>
                                <td className={`py-4 px-4 font-mono text-[10.5px] ${t.textMuted}`}>{ing.sku || '-'}</td>
                                <td className={`py-4 px-4 text-right ${t.text}`}>${ing.costPerUnit.toFixed(2)} / {ing.unit}</td>
                                <td className={`py-4 px-4 text-right font-mono font-bold ${t.text}`}>{ing.stockLevel.toFixed(2)} {ing.unit}</td>
                                <td className={`py-4 px-4 text-right font-mono ${t.textMuted}`}>{ing.minStockLevel.toFixed(2)} {ing.unit}</td>
                                <td className="py-4 px-4 text-center">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-black ${statusColor}`}>
                                    {statusText}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAdjustingIng(ing);
                                        setAdjustQty(ing.stockLevel);
                                        setAdjustNotes('');
                                        setShowAdjustModal(true);
                                      }}
                                      title="Quick Adjust Stock"
                                      className={`p-1.5 rounded-lg border ${t.border} text-[#ffe2ab] hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center`}
                                    >
                                      <span className="material-symbols-outlined text-sm">tune</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingIng(ing);
                                        setIngForm({
                                          name: ing.name,
                                          sku: ing.sku || '',
                                          unit: ing.unit,
                                          costPerUnit: ing.costPerUnit,
                                          stockLevel: ing.stockLevel,
                                          minStockLevel: ing.minStockLevel
                                        });
                                        setShowIngModal(true);
                                      }}
                                      className={`p-1.5 rounded-lg border ${t.border} text-sky-400 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center`}
                                    >
                                      <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmTarget({ type: 'ingredient', id: ing.id, name: ing.name })}
                                      className={`p-1.5 rounded-lg border ${t.border} text-rose-400 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center`}
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        {ingredientsList.length === 0 && (
                          <tr>
                            <td colSpan={7} className={`py-12 text-center text-xs ${t.textMuted}`}>
                              No ingredients registered yet. Click "+ Add Ingredient" to create one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8.2: RECIPE EDITOR */}
              {inventorySubTab === 'recipes' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Menu Items Directory List (Span 5) */}
                  <div className={`lg:col-span-5 ${t.cardBgOpaque} rounded-2xl border shadow-xl p-6`}>
                    <h3 className={`${t.text} font-bold text-sm tracking-wide mb-5 select-none`}>Menu Item Directory</h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {menuItemsList
                        .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(item => {
                          const recipeItems = recipesList.filter(r => r.menuItemId === item.id);
                          const isConfigured = recipeItems.length > 0;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setRecipeMenuItem(item);
                                const currentIngs = recipeItems.map(r => ({
                                  ingredientId: r.ingredientId,
                                  quantity: r.quantity
                                }));
                                setRecipeIngs(currentIngs);
                                setShowRecipeModal(true);
                              }}
                              className={`p-4 rounded-xl border ${t.border} hover:border-[#ffe2ab]/30 cursor-pointer transition-all duration-300 flex items-center justify-between group hover:-translate-y-0.5`}
                            >
                              <div>
                                <h4 className={`text-xs font-bold ${t.text} group-hover:text-[#ffe2ab] transition-colors`}>{item.name}</h4>
                                <span className={`text-[10px] ${t.textMuted} capitalize`}>{item.category}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold ${
                                isConfigured 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-white/5 text-[#A69984]/50 border border-white/10'
                              }`}>
                                {isConfigured ? `${recipeItems.length} Ingredients` : 'No Recipe'}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Recipe Editor Instructions Panel (Span 7) */}
                  <div className={`lg:col-span-7 ${t.cardBgOpaque} rounded-2xl border shadow-xl p-8 flex flex-col items-center justify-center text-center select-none min-h-[400px]`}>
                    <div className="w-16 h-16 rounded-2xl bg-[#ffe2ab]/5 border border-[#ffe2ab]/20 text-[#ffe2ab] flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-3xl font-light">receipt_long</span>
                    </div>
                    <h3 className={`font-serif text-xl ${t.text} mb-2 tracking-wide`}>Recipe Assignment Panel</h3>
                    <p className={`font-sans text-xs ${t.textMuted} max-w-sm leading-relaxed`}>
                      Select a menu dish from the directory on the left to configure or update its ingredient recipe. Recipes allow the system to automatically deduct stock levels upon successful POS payment validation.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 8.3: SUPPLIERS DIRECTORY */}
              {inventorySubTab === 'suppliers' && (
                <div className={`${t.cardBgOpaque} rounded-2xl border shadow-xl overflow-hidden`}>
                  <div className="p-6 border-b border-white/5 flex items-center justify-between select-none">
                    <h3 className={`${t.text} font-bold text-sm tracking-wide`}>Suppliers Registry</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSupplier(null);
                        setSupplierForm({ name: '', contactName: '', email: '', phone: '', address: '' });
                        setShowSupplierModal(true);
                      }}
                      className={`px-4 py-2 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow`}
                    >
                      + Add Supplier
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className={`border-b ${t.borderStrong} text-[9.5px] uppercase tracking-wider font-bold ${t.textMuted} select-none`}>
                          <th className="py-4 px-6">Supplier Name</th>
                          <th className="py-4 px-4">Contact Person</th>
                          <th className="py-4 px-4">Email Address</th>
                          <th className="py-4 px-4">Phone Number</th>
                          <th className="py-4 px-4">Warehouse Address</th>
                          <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${t.divider}`}>
                        {suppliersList
                          .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.contactName && s.contactName.toLowerCase().includes(searchQuery.toLowerCase())))
                          .map(sup => (
                            <tr key={sup.id} className={`hover:${t.cardHover} transition-colors`}>
                              <td className={`py-4 px-6 font-semibold ${t.text}`}>{sup.name}</td>
                              <td className={`py-4 px-4 ${t.text}`}>{sup.contactName || '-'}</td>
                              <td className={`py-4 px-4 font-mono ${t.textMuted}`}>{sup.email || '-'}</td>
                              <td className={`py-4 px-4 ${t.text}`}>{sup.phone || '-'}</td>
                              <td className={`py-4 px-4 text-xs ${t.textMuted}`}>{sup.address || '-'}</td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSupplier(sup);
                                      setSupplierForm({
                                        name: sup.name,
                                        contactName: sup.contactName || '',
                                        email: sup.email || '',
                                        phone: sup.phone || '',
                                        address: sup.address || ''
                                      });
                                      setShowSupplierModal(true);
                                    }}
                                    className={`p-1.5 rounded-lg border ${t.border} text-sky-400 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center`}
                                  >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmTarget({ type: 'supplier', id: sup.id, name: sup.name })}
                                    className={`p-1.5 rounded-lg border ${t.border} text-rose-400 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center`}
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {suppliersList.length === 0 && (
                          <tr>
                            <td colSpan={6} className={`py-12 text-center text-xs ${t.textMuted}`}>
                              No suppliers registered yet. Click "+ Add Supplier" to register one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8.4: PURCHASE ORDERS */}
              {inventorySubTab === 'orders' && (
                <div className={`${t.cardBgOpaque} rounded-2xl border shadow-xl overflow-hidden`}>
                  <div className="p-6 border-b border-white/5 flex items-center justify-between select-none">
                    <h3 className={`${t.text} font-bold text-sm tracking-wide`}>Procurement Orders</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setPoSupplierId(suppliersList.length > 0 ? suppliersList[0].id : '');
                        setPoItems([]);
                        setShowPoModal(true);
                      }}
                      className={`px-4 py-2 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow`}
                    >
                      + Create Purchase Order
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className={`border-b ${t.borderStrong} text-[9.5px] uppercase tracking-wider font-bold ${t.textMuted} select-none`}>
                          <th className="py-4 px-6">PO ID</th>
                          <th className="py-4 px-4">Supplier</th>
                          <th className="py-4 px-4 text-right">Order Cost</th>
                          <th className="py-4 px-4">Ordered Date</th>
                          <th className="py-4 px-4">Received Date</th>
                          <th className="py-4 px-4 text-center">Status</th>
                          <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${t.divider}`}>
                        {purchaseOrdersList.map(po => {
                          const sup = suppliersList.find(s => s.id === po.supplierId);
                          const isPending = po.status === 'PENDING';
                          const isReceived = po.status === 'RECEIVED';
                          const statusColor = isReceived 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : po.status === 'CANCELLED' 
                              ? 'bg-white/5 text-[#A69984]/50 border border-white/10' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                          return (
                            <tr key={po.id} className={`hover:${t.cardHover} transition-colors`}>
                              <td className={`py-4 px-6 font-mono font-bold uppercase ${t.text}`}>{po.id}</td>
                              <td className={`py-4 px-4 ${t.text}`}>{sup ? sup.name : 'Direct Purchase'}</td>
                              <td className={`py-4 px-4 text-right font-semibold ${t.text}`}>${po.totalCost.toFixed(2)}</td>
                              <td className={`py-4 px-4 ${t.textMuted}`}>{new Date(po.orderedAt || po.createdAt).toLocaleDateString()}</td>
                              <td className={`py-4 px-4 ${t.textMuted}`}>{po.receivedAt ? new Date(po.receivedAt).toLocaleDateString() : '-'}</td>
                              <td className="py-4 px-4 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-black ${statusColor}`}>
                                  {po.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {isPending && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleReceivePO(po.id)}
                                        className={`px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-black text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer`}
                                      >
                                        Receive
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleCancelPO(po.id)}
                                        className={`px-3 py-1 bg-white/5 border ${t.border} hover:bg-white/10 text-rose-400 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer`}
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                  {!isPending && <span className={`text-[10px] ${t.textMuted}`}>Fulfillment Done</span>}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {purchaseOrdersList.length === 0 && (
                          <tr>
                            <td colSpan={7} className={`py-12 text-center text-xs ${t.textMuted}`}>
                              No purchase orders generated. Click "+ Create Purchase Order" to generate one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8.5: WASTE LOGS */}
              {inventorySubTab === 'waste' && (
                <div className={`${t.cardBgOpaque} rounded-2xl border shadow-xl overflow-hidden`}>
                  <div className="p-6 border-b border-white/5 flex items-center justify-between select-none">
                    <h3 className={`${t.text} font-bold text-sm tracking-wide`}>Spoilage & Waste Logs</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setWasteIngId(ingredientsList.length > 0 ? ingredientsList[0].id : '');
                        setWasteQty(0);
                        setWasteReason('SPOILAGE');
                        setWasteNotes('');
                        setShowWasteModal(true);
                      }}
                      className={`px-4 py-2 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow`}
                    >
                      Report Spoilage / Waste
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className={`border-b ${t.borderStrong} text-[9.5px] uppercase tracking-wider font-bold ${t.textMuted} select-none`}>
                          <th className="py-4 px-6">Timestamp</th>
                          <th className="py-4 px-4">Ingredient</th>
                          <th className="py-4 px-4 text-right">Wasted Quantity</th>
                          <th className="py-4 px-4">Reason Category</th>
                          <th className="py-4 px-4">Reported By</th>
                          <th className="py-4 px-6">Staff Explanatory Notes</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${t.divider}`}>
                        {wasteLogsList.map(log => {
                          const ing = ingredientsList.find(i => i.id === log.ingredientId);
                          return (
                            <tr key={log.id} className={`hover:${t.cardHover} transition-colors`}>
                              <td className={`py-4 px-6 font-mono text-[10.5px] ${t.textMuted}`}>{new Date(log.createdAt).toLocaleString()}</td>
                              <td className={`py-4 px-4 font-semibold ${t.text}`}>{ing ? ing.name : 'Unknown Ingredient'}</td>
                              <td className={`py-4 px-4 text-right font-mono font-bold text-rose-400`}>-{log.quantity.toFixed(2)} {ing ? ing.unit : ''}</td>
                              <td className="py-4 px-4">
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] uppercase tracking-wide font-black">
                                  {log.reason}
                                </span>
                              </td>
                              <td className={`py-4 px-4 ${t.text}`}>{log.reportedBy || 'Kitchen Staff'}</td>
                              <td className={`py-4 px-6 text-xs ${t.textMuted}`}>{log.notes || 'No description recorded.'}</td>
                            </tr>
                          );
                        })}
                        {wasteLogsList.length === 0 && (
                          <tr>
                            <td colSpan={6} className={`py-12 text-center text-xs ${t.textMuted}`}>
                              No waste events reported yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8.6: STOCK LEDGER */}
              {inventorySubTab === 'ledger' && (
                <div className={`${t.cardBgOpaque} rounded-2xl border shadow-xl overflow-hidden`}>
                  <div className="p-6 border-b border-white/5 select-none">
                    <h3 className={`${t.text} font-bold text-sm tracking-wide`}>Audit Ledger (Stock History)</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className={`border-b ${t.borderStrong} text-[9.5px] uppercase tracking-wider font-bold ${t.textMuted} select-none`}>
                          <th className="py-4 px-6">Timestamp</th>
                          <th className="py-4 px-4">Ingredient</th>
                          <th className="py-4 px-4">Movement Type</th>
                          <th className="py-4 px-4 text-right">Adjustment Amount</th>
                          <th className="py-4 px-6">Ledger Description Notes</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${t.divider}`}>
                        {transactionsList
                          .filter(tx => {
                            const ing = ingredientsList.find(i => i.id === tx.ingredientId);
                            const nameMatch = ing ? ing.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
                            return nameMatch || tx.type.toLowerCase().includes(searchQuery.toLowerCase()) || (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));
                          })
                          .map(tx => {
                            const ing = ingredientsList.find(i => i.id === tx.ingredientId);
                            const isPositive = tx.quantity > 0;
                            const qtyColor = isPositive ? 'text-emerald-400' : 'text-rose-400';
                            const qtyPrefix = isPositive ? '+' : '';
                            
                            let typeBadge = '';
                            if (tx.type === 'PURCHASE') typeBadge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                            else if (tx.type === 'SALE_DEDUCTION') typeBadge = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                            else if (tx.type === 'WASTE') typeBadge = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                            else typeBadge = 'bg-white/5 text-[#A69984]/50 border border-white/10';

                            return (
                              <tr key={tx.id} className={`hover:${t.cardHover} transition-colors`}>
                                <td className={`py-4 px-6 font-mono text-[10px] ${t.textMuted}`}>{new Date(tx.createdAt).toLocaleString()}</td>
                                <td className={`py-4 px-4 font-semibold ${t.text}`}>{ing ? ing.name : 'Unknown Ingredient'}</td>
                                <td className="py-4 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] uppercase tracking-wide font-black ${typeBadge}`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className={`py-4 px-4 text-right font-mono font-bold ${qtyColor}`}>{qtyPrefix}{tx.quantity.toFixed(2)} {ing ? ing.unit : ''}</td>
                                <td className={`py-4 px-6 text-xs ${t.textMuted}`}>{tx.notes || 'Manual stock adjustment ledger input.'}</td>
                              </tr>
                            );
                          })}
                        {transactionsList.length === 0 && (
                          <tr>
                            <td colSpan={5} className={`py-12 text-center text-xs ${t.textMuted}`}>
                              No transaction ledger history recorded.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

      {/* INVENTORY MODALS JSX */}
            {showIngModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[420px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-base ${t.accent} font-bold tracking-wide`}>
                {editingIng ? 'Edit Ingredient' : 'Add New Ingredient'}
              </h3>
              <button
                type="button"
                onClick={() => { setShowIngModal(false); setEditingIng(null); }}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className="space-y-4">
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Ingredient Name</label>
                <input
                  type="text"
                  required
                  value={ingForm.name}
                  onChange={(e) => setIngForm({ ...ingForm, name: e.target.value })}
                  placeholder="e.g. Miyazaki A5 Beef"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>SKU / Code</label>
                  <input
                    type="text"
                    value={ingForm.sku}
                    onChange={(e) => setIngForm({ ...ingForm, sku: e.target.value })}
                    placeholder="ING-WAG-01"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                  />
                </div>
                <div>
                  <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Stock Unit</label>
                  <select
                    value={ingForm.unit}
                    onChange={(e) => setIngForm({ ...ingForm, unit: e.target.value })}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium cursor-pointer`}
                  >
                    <option value="kg">kilograms (kg)</option>
                    <option value="g">grams (g)</option>
                    <option value="liter">liters (l)</option>
                    <option value="ml">milliliters (ml)</option>
                    <option value="pcs">pieces (pcs)</option>
                    <option value="packs">packs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Cost/Unit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ingForm.costPerUnit || ''}
                    onChange={(e) => setIngForm({ ...ingForm, costPerUnit: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                  />
                </div>
                <div>
                  <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Stock Qty</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    disabled={!!editingIng}
                    value={ingForm.stockLevel || ''}
                    onChange={(e) => setIngForm({ ...ingForm, stockLevel: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                </div>
                <div>
                  <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Min Alert Qty</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={ingForm.minStockLevel || ''}
                    onChange={(e) => setIngForm({ ...ingForm, minStockLevel: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => { setShowIngModal(false); setEditingIng(null); }}
                  className={`w-1/2 px-5 py-3 border ${t.buttonOutline} text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-1/2 px-5 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer`}
                >
                  {editingIng ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. QUICK STOCK ADJUST MODAL */}
      {showAdjustModal && adjustingIng && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[380px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-base ${t.accent} font-bold tracking-wide`}>Adjust Stock Level</h3>
              <button
                type="button"
                onClick={() => { setShowAdjustModal(false); setAdjustingIng(null); }}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>Ingredient Name</p>
                <p className={`${t.text} font-bold mt-1 text-sm select-all`}>{adjustingIng.name}</p>
              </div>
              
              <div>
                <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>Current Stock Level</p>
                <p className={`${t.text} font-semibold mt-1 text-xs`}>{adjustingIng.stockLevel.toFixed(3)} {adjustingIng.unit}</p>
              </div>

              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>New Stock Level ({adjustingIng.unit})</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={adjustQty || ''}
                  onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                  placeholder="0.000"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                />
              </div>

              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Adjustment Reason / Notes</label>
                <textarea
                  required
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Physical inventory audit recount corrections."
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium h-20 resize-none`}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => { setShowAdjustModal(false); setAdjustingIng(null); }}
                  className={`w-1/2 px-5 py-3 border ${t.buttonOutline} text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-1/2 px-5 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer`}
                >
                  Adjust Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DISH RECIPE EDITOR MODAL */}
      {showRecipeModal && recipeMenuItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[550px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <div>
                <h3 className={`font-serif text-base ${t.accent} font-bold tracking-wide`}>Configure Dish Recipe</h3>
                <p className={`text-[10px] ${t.textMuted} font-semibold mt-1`}>{recipeMenuItem.name}</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowRecipeModal(false); setRecipeMenuItem(null); }}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center select-none">
                  <span className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>Recipe Ingredients</span>
                  <button
                    type="button"
                    onClick={addRecipeRow}
                    disabled={ingredientsList.length === 0}
                    className={`px-3 py-1 bg-white/5 border ${t.border} hover:bg-white/10 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    + Add Row
                  </button>
                </div>

                {recipeIngs.length === 0 ? (
                  <div className={`p-8 border border-dashed ${t.border} rounded-xl text-center text-xs ${t.textMuted} select-none`}>
                    No ingredients linked to this dish. Stock will not deduct automatically on sale.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    {recipeIngs.map((ri, index) => {
                      const selectedIng = ingredientsList.find(i => i.id === ri.ingredientId);
                      return (
                        <div key={index} className="flex gap-3 items-center">
                          <select
                            value={ri.ingredientId}
                            onChange={(e) => updateRecipeRow(index, 'ingredientId', e.target.value)}
                            className={`w-[60%] ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2 text-xs ${t.text} focus:outline-none cursor-pointer font-medium`}
                          >
                            {ingredientsList.map(ing => (
                              <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            step="0.001"
                            required
                            value={ri.quantity || ''}
                            onChange={(e) => updateRecipeRow(index, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="Qty"
                            className={`w-[30%] ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2 text-xs ${t.text} text-right focus:outline-none font-medium`}
                          />
                          <span className={`w-10 text-[11px] ${t.textMuted} font-semibold truncate`}>
                            {selectedIng ? selectedIng.unit : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeRecipeRow(index)}
                            className={`p-1.5 border border-white/5 hover:border-rose-500/20 text-rose-400 hover:bg-white/5 rounded-lg transition-all cursor-pointer flex items-center justify-center`}
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => { setShowRecipeModal(false); setRecipeMenuItem(null); }}
                  className={`w-1/2 px-5 py-3 border ${t.buttonOutline} text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-1/2 px-5 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer`}
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. SUPPLIER ADD/EDIT MODAL */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[420px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-base ${t.accent} font-bold tracking-wide`}>
                {editingSupplier ? 'Edit Supplier' : 'Register Supplier'}
              </h3>
              <button
                type="button"
                onClick={() => { setShowSupplierModal(false); setEditingSupplier(null); }}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4">
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Supplier Business Name</label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="e.g. Toyosu Seafood Distributors"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                />
              </div>

              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Contact Person Name</label>
                <input
                  type="text"
                  value={supplierForm.contactName}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
                  placeholder="Kenji Sato"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Email Address</label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    placeholder="sales@toyosu.co.jp"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                  />
                </div>
                <div>
                  <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Phone Number</label>
                  <input
                    type="text"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="+81-90-1234-5678"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                  />
                </div>
              </div>

              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Physical Address / Warehouse Location</label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="Koto-ku, Tokyo, Japan"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => { setShowSupplierModal(false); setEditingSupplier(null); }}
                  className={`w-1/2 px-5 py-3 border ${t.buttonOutline} text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-1/2 px-5 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer`}
                >
                  {editingSupplier ? 'Update' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CREATE PURCHASE ORDER MODAL */}
      {showPoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[580px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <div>
                <h3 className={`font-serif text-base ${t.accent} font-bold tracking-wide`}>Generate Purchase Order</h3>
                <p className={`text-[10px] ${t.textMuted} font-semibold mt-1`}>Procure ingredients from suppliers to restock inventory.</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowPoModal(false); setPoSupplierId(''); setPoItems([]); }}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePurchaseOrder} className="space-y-6">
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Select Supplier</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none cursor-pointer font-medium`}
                >
                  <option value="">Direct Purchase / No Supplier</option>
                  {suppliersList.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center select-none">
                  <span className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>Order Line Items</span>
                  <button
                    type="button"
                    onClick={addPoRow}
                    disabled={ingredientsList.length === 0}
                    className={`px-3 py-1 bg-white/5 border ${t.border} hover:bg-white/10 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    + Add Item Row
                  </button>
                </div>

                {poItems.length === 0 ? (
                  <div className={`p-8 border border-dashed ${t.border} rounded-xl text-center text-xs ${t.textMuted} select-none`}>
                    No items added to this purchase order. Click "+ Add Item Row" to add ingredients.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {poItems.map((item, index) => {
                      const selectedIng = ingredientsList.find(i => i.id === item.ingredientId);
                      return (
                        <div key={index} className="flex gap-3 items-center">
                          <select
                            value={item.ingredientId}
                            onChange={(e) => updatePoRow(index, 'ingredientId', e.target.value)}
                            className={`w-[45%] ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2 text-xs ${t.text} focus:outline-none cursor-pointer font-medium`}
                          >
                            {ingredientsList.map(ing => (
                              <option key={ing.id} value={ing.id}>{ing.name}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            step="0.001"
                            required
                            value={item.quantity || ''}
                            onChange={(e) => updatePoRow(index, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="Qty"
                            className={`w-[20%] ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2 text-xs ${t.text} text-right focus:outline-none font-medium`}
                          />
                          <span className={`w-8 text-[11px] ${t.textMuted} font-semibold truncate`}>
                            {selectedIng ? selectedIng.unit : ''}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={item.unitCost || ''}
                            onChange={(e) => updatePoRow(index, 'unitCost', parseFloat(e.target.value) || 0)}
                            placeholder="Cost"
                            className={`w-[20%] ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2 text-xs ${t.text} text-right focus:outline-none font-medium`}
                          />
                          <button
                            type="button"
                            onClick={() => removePoRow(index)}
                            className={`p-1.5 border border-white/5 hover:border-rose-500/20 text-rose-400 hover:bg-white/5 rounded-lg transition-all cursor-pointer flex items-center justify-center`}
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Total order cost display */}
              <div className="flex justify-between items-center select-none pt-4 border-t border-white/5">
                <span className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>Estimated Total Cost</span>
                <span className={`text-lg font-serif font-black ${t.accent}`}>
                  ${poItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0).toFixed(2)}
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { setShowPoModal(false); setPoSupplierId(''); setPoItems([]); }}
                  className={`w-1/2 px-5 py-3 border ${t.buttonOutline} text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-1/2 px-5 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer`}
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. REPORT FOOD WASTE MODAL */}
      {showWasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[400px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <div>
                <h3 className={`font-serif text-base ${t.accent} font-bold tracking-wide`}>Report Food Spoilage / Waste</h3>
                <p className={`text-[10px] ${t.textMuted} font-semibold mt-1`}>Deduct ruined ingredients from inventory stock.</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowWasteModal(false); setWasteIngId(''); setWasteQty(0); setWasteNotes(''); }}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleRecordWaste} className="space-y-4">
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Select Ingredient</label>
                <select
                  value={wasteIngId}
                  onChange={(e) => setWasteIngId(e.target.value)}
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none cursor-pointer font-medium`}
                >
                  {ingredientsList.map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Wasted Qty</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={wasteQty || ''}
                    onChange={(e) => setWasteQty(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none font-medium`}
                  />
                </div>
                <div>
                  <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Reason Category</label>
                  <select
                    value={wasteReason}
                    onChange={(e) => setWasteReason(e.target.value as WasteReason)}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none cursor-pointer font-medium`}
                  >
                    <option value="SPOILAGE">Spoilage / Expired</option>
                    <option value="ACCIDENT">Kitchen Accident / Spill</option>
                    <option value="EXPIRED">Shelf life expired</option>
                    <option value="QUALITY_CONTROL">QC Inspection Reject</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5 select-none`}>Explanatory Notes</label>
                <textarea
                  value={wasteNotes}
                  onChange={(e) => setWasteNotes(e.target.value)}
                  placeholder="e.g. Temperature fluctuation in cold room caused spoilage."
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium h-20 resize-none`}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => { setShowWasteModal(false); setWasteIngId(''); setWasteQty(0); setWasteNotes(''); }}
                  className={`w-1/2 px-5 py-3 border ${t.buttonOutline} text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-1/2 px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer`}
                >
                  Report Waste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHIFT EDITING MODAL */}

      {/* Universal Delete Confirmation Popup */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirmTarget}
        onClose={() => setDeleteConfirmTarget(null)}
        onConfirm={async () => {
          if (!deleteConfirmTarget) return;
          if (deleteConfirmTarget.type === 'ingredient') {
            await handleDeleteIngredient(deleteConfirmTarget.id);
          } else if (deleteConfirmTarget.type === 'supplier') {
            await handleDeleteSupplier(deleteConfirmTarget.id);
          }
          setDeleteConfirmTarget(null);
        }}
        title={`Delete ${deleteConfirmTarget?.type === 'ingredient' ? 'Ingredient' : 'Supplier'}`}
        description={`Do you want to delete ${deleteConfirmTarget?.type === 'ingredient' ? 'ingredient' : 'supplier'} "${deleteConfirmTarget?.name}"?`}
      />
    </>
  );
}
