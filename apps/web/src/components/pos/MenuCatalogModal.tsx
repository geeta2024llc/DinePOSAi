'use client';

import React from 'react';

interface MenuCatalogModalProps {
  t: any;
  currency: string;
  menuModalOpen: boolean;
  setMenuModalOpen: (val: boolean) => void;
  selectedTicket: any;
  
  // catalog data
  categories: any[];
  activeCategory: string;
  setActiveCategory: (val: string) => void;
  menuSearchQuery: string;
  setMenuSearchQuery: (val: string) => void;
  filteredMenuItems: any[];
  menuItems: any[];
  
  // item click handlers
  handleAddItemToTicket: (ticketId: string, item: any, note?: string, selectedOptions?: any[]) => void;
  handleUpdateItemQty: (ticketId: string, itemName: string, change: number, note?: string) => void;
  handleToggleCatalogModifier: (itemId: string, modifierName: string, type: 'single' | 'multiple', groupTitle: string) => void;
  itemModifiersConfig: Record<string, any[]>;
  catalogModifiers: Record<string, string[]>;
  setCatalogModifiers: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  itemNotes: Record<string, string>;
  setItemNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function MenuCatalogModal({
  t,
  currency,
  menuModalOpen,
  setMenuModalOpen,
  selectedTicket,
  categories,
  activeCategory,
  setActiveCategory,
  menuSearchQuery,
  setMenuSearchQuery,
  filteredMenuItems,
  menuItems,
  handleAddItemToTicket,
  handleUpdateItemQty,
  handleToggleCatalogModifier,
  itemModifiersConfig,
  catalogModifiers,
  setCatalogModifiers,
  itemNotes,
  setItemNotes
}: MenuCatalogModalProps) {

  const formatPrice = (val: number) => {
    if (currency === 'JPY' || currency === 'KRW') return `¥${Math.round(val).toLocaleString()}`;
    return `$${val.toFixed(2)}`;
  };

  const formatMoney = formatPrice;

  return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12110f] border border-[#ffe2ab]/20 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-fade-in flex flex-col h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none bg-[#0a0a09]">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">{t('Digital Menu Catalog', 'デジタルメニューカタログ')}</h3>
                <p className="text-[10px] text-[#ffe2ab]/75 font-bold uppercase tracking-wider mt-1">
                  {t('Add products to ', '商品を追加: ')}{selectedTicket.tableNumber}
                </p>
              </div>
              
              {/* Search Box */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#A69984]/40 text-sm">search</span>
                  <input
                    type="text"
                    placeholder={t('Search menu...', 'メニューを検索...')}
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    className="bg-[#161513] border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/30 w-[180px] sm:w-[220px] transition-colors"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => setMenuModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#A69984] hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="px-6 py-3 border-b border-white/5 bg-[#0e0e0d] flex gap-2 overflow-x-auto scrollbar-none select-none shrink-0 font-sans">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                  activeCategory === 'all'
                    ? 'bg-[#ffe2ab] text-[#402d00]'
                    : 'text-[#A69984]/80 bg-white/5 hover:text-white hover:bg-white/10'
                }`}
              >
                {t('All Items', '全商品')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1 shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-[#ffe2ab] text-[#402d00]'
                      : 'text-[#A69984]/80 bg-white/5 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.icon && (
                    <span className="material-symbols-outlined text-xs leading-none">{cat.icon}</span>
                  )}
                  {t(cat.name, cat.name === 'Our Special' ? 'おすすめ' : cat.name === 'Combo Set' ? 'コンボセット' : cat.name === 'Starters' ? '前菜' : cat.name === 'Main Course' ? 'メインコース' : cat.name === 'Desserts' ? 'デザート' : cat.name === 'Drinks' ? 'ドリンク' : cat.name)}
                </button>
              ))}
            </div>

            {/* Modal Body: Products Grid */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#12110f]">
              {(() => {
                const filtered = menuItems.filter(item => {
                  if (item.active === false) return false;
                  const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
                  const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                                       (item.description && item.description.toLowerCase().includes(menuSearchQuery.toLowerCase()));
                  return matchesCategory && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-[#A69984]/40 py-20 select-none">
                      <span className="material-symbols-outlined text-4xl mb-2 font-light">restaurant_menu</span>
                      <p className="text-xs">{t('No matching menu items found.', '該当するメニューが見つかりません。')}</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((item) => {
                      const imageSrc = item.image && item.image.startsWith('/images/')
                        ? `/images/${item.image.split('/').pop()}`
                        : item.image || '/images/placeholder.png';

                      const getTicketItemQty = (ticket: any, itemName: string): number => {
                        if (!ticket || !ticket.items) return 0;
                        return ticket.items
                          .filter((i: any) => i.name === itemName)
                          .reduce((sum: number, i: any) => sum + i.qty, 0);
                      };
                      const itemQtyInTicket = getTicketItemQty(selectedTicket, item.name);

                      return (
                        <div
                          key={item.id}
                          className={`border rounded-xl p-4 flex flex-col justify-between hover:border-white/10 transition-all group ${
                            itemQtyInTicket > 0
                              ? 'border-[#ffe2ab]/30 bg-[#ffe2ab]/5 shadow-[0_0_15px_rgba(254,226,171,0.03)]'
                              : 'border-white/5 bg-[#161513]/40'
                          }`}
                        >
                          <div>
                            {/* Image Header */}
                            <div className="w-full h-32 rounded-lg overflow-hidden bg-black/40 border border-white/5 relative mb-3 select-none">
                              <img
                                src={imageSrc}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop';
                                }}
                              />
                              <div className="absolute top-2 right-2 flex gap-1">
                                {item.tags && item.tags.map((tag: string) => (
                                  <span
                                    key={tag}
                                    className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded select-none ${
                                      tag === 'Veg' || tag === 'GF'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                              <h4 className="font-serif font-bold text-sm text-white group-hover:text-[#ffe2ab] transition-colors line-clamp-1">{item.name}</h4>
                              <span className="font-sans font-bold text-sm text-[#ffe2ab] shrink-0">{formatMoney(item.price)}</span>
                            </div>
                            
                            <p className="text-[11px] text-[#A69984]/70 line-clamp-2 mb-3 h-[32px] overflow-hidden leading-relaxed select-text">
                              {item.description || 'No description available.'}
                            </p>

                            {/* Modifiers / Options selection in card */}
                            {itemModifiersConfig[item.id] && (
                              <div className="space-y-3 mt-1.5 mb-3 border-t border-white/5 pt-2">
                                {itemModifiersConfig[item.id].map((group) => {
                                  const selectedList = catalogModifiers[item.id] || [];
                                  return (
                                    <div key={group.title} className="space-y-1">
                                      <span className="text-[9px] text-[#A69984]/50 font-bold uppercase tracking-wider block">{group.title}</span>
                                      <div className="flex flex-wrap gap-1">
                                        {group.options.map((opt: any) => {
                                          const isSelected = selectedList.includes(opt.name);
                                          return (
                                            <button
                                              key={opt.name}
                                              type="button"
                                              onClick={() => handleToggleCatalogModifier(item.id, opt.name, group.type, group.title)}
                                              className={`text-[8.5px] font-bold px-2 py-1 rounded transition-all cursor-pointer border ${
                                                isSelected
                                                  ? 'bg-[#ffe2ab]/15 border-[#ffe2ab]/40 text-[#ffe2ab]'
                                                  : 'bg-black/20 border-white/5 text-[#A69984]/70 hover:text-white hover:border-white/10'
                                              }`}
                                            >
                                              {opt.name}
                                              {opt.price ? ` (+${formatMoney(opt.price)})` : ''}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Notes input & add action */}
                          <div className="space-y-2.5 pt-2 border-t border-white/5">
                            <input
                              type="text"
                              placeholder={t('Add kitchen note (e.g. Rare, No onions)', '厨房へのメモを追加 (例: レア、玉ねぎ抜き)')}
                              value={itemNotes[item.id] || ''}
                              onChange={(e) => setItemNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-white placeholder-white/25 focus:outline-none focus:border-[#ffe2ab]/25 transition-colors"
                            />
                            
                            {itemQtyInTicket > 0 ? (
                              <div className="flex items-center justify-between gap-2 w-full pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItemQty(selectedTicket.id, item.name, -1)}
                                  className="flex-1 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg font-sans font-bold text-[9px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-0.5 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[10px]">remove</span>
                                  {t('Remove 1', '1つ減らす')}
                                </button>
                                <span className="px-2.5 py-1 bg-[#ffe2ab]/5 border border-[#ffe2ab]/25 text-[#ffe2ab] rounded-lg font-mono font-bold text-xs select-none">
                                  x{itemQtyInTicket}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const selectedModsNames = catalogModifiers[item.id] || [];
                                    const selectedModsObjects = selectedModsNames.map(name => {
                                      const isAllergy = name.toUpperCase().includes('ALLERGY') || name.toUpperCase().includes('NO GARLIC') || name.toUpperCase().includes('NO NUTS');
                                      const isHighlight = name.toUpperCase().startsWith('NO ') || name.toUpperCase().includes('EXTRA');
                                      return {
                                        text: name,
                                        type: isAllergy ? 'allergy' as const : isHighlight ? 'highlight' as const : 'default' as const
                                      };
                                    });
                                    handleAddItemToTicket(selectedTicket.id, item, itemNotes[item.id], selectedModsObjects);
                                    setItemNotes(prev => ({ ...prev, [item.id]: '' }));
                                  }}
                                  className="flex-1 py-1.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-lg font-sans font-bold text-[9px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-0.5 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[10px]">add</span>
                                  {t('Add More', 'さらに追加')}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const selectedModsNames = catalogModifiers[item.id] || [];
                                  const selectedModsObjects = selectedModsNames.map(name => {
                                    const isAllergy = name.toUpperCase().includes('ALLERGY') || name.toUpperCase().includes('NO GARLIC') || name.toUpperCase().includes('NO NUTS');
                                    const isHighlight = name.toUpperCase().startsWith('NO ') || name.toUpperCase().includes('EXTRA');
                                    return {
                                      text: name,
                                      type: isAllergy ? 'allergy' as const : isHighlight ? 'highlight' as const : 'default' as const
                                    };
                                  });
                                  handleAddItemToTicket(selectedTicket.id, item, itemNotes[item.id], selectedModsObjects);
                                  setItemNotes(prev => ({ ...prev, [item.id]: '' }));
                                }}
                                className="w-full py-2 bg-white/5 hover:bg-[#ffe2ab] hover:text-[#402d00] text-[#ffe2ab] border border-white/10 hover:border-transparent rounded-lg font-sans font-bold text-[10px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">add_circle</span>
                                {t('Add to Order', '注文に追加')}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#0a0a09] border-t border-white/5 flex justify-end select-none shrink-0">
              <button
                type="button"
                onClick={() => setMenuModalOpen(false)}
                className="px-6 py-2.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Done Adding
              </button>
            </div>
          </div>
        </div>
  );
}
