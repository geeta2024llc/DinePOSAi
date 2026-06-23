'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { SidebarToggleButton } from '@/components/ui/SidebarToggleButton';

interface CartItem {
  itemId: string;
  quantity: number;
  modifiers: string[];
  course: 'starter' | 'main' | 'dessert' | 'drinks';
  notes?: string;
}

interface ChatMessage {
  id: string;
  sender: 'aura' | 'user';
  text: string;
  suggestions?: string[];
  recommendations?: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
    isSommelierPick?: boolean;
  }>;
}

export default function ConciergePage() {
  const { sidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [currency, setCurrency] = useState<'USD' | 'JPY' | 'EUR' | 'GBP' | 'CNY' | 'KRW'>('USD');
  
  const [tableNumber, setTableNumber] = useState(12);
  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [exclusionsConfig, setExclusionsConfig] = useState({
    maxPrice: 40,
    excludedTags: ['Seafood'],
    showAIConcierge: true,
    enableSelfCheckout: true
  });

  const formatCurrency = (val: number) => {
    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CNY: '¥',
      KRW: '₩',
      JPY: '¥'
    };
    const rateMap: Record<string, number> = {
      USD: 1,
      JPY: 150,
      EUR: 0.92,
      GBP: 0.79,
      CNY: 7.24,
      KRW: 1340
    };
    const symbol = symbolMap[currency] || '$';
    const rate = rateMap[currency] || 1;
    const converted = (parseFloat(val as any) || 0) * rate;
    if (currency === 'JPY' || currency === 'KRW') {
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    const savedTable = localStorage.getItem('dinepos_table_number');
    const tableNum = savedTable ? (parseInt(savedTable, 10) || 12) : 12;
    setTableNumber(tableNum);
    
    setMessages([
      {
        id: 'msg-1',
        sender: 'aura',
        text: `Good evening. Welcome to Table ${tableNum}. I am Aura, your personal dining concierge. \n\nI see you previously enjoyed the Truffle Risotto. We have a new variation tonight featuring seasonal chanterelles. Would you like to explore the menu or order drinks to start?`,
        suggestions: ['Show me the Risotto', 'Cocktail Menu']
      },
      {
        id: 'msg-2',
        sender: 'user',
        text: "What are the sommelier's recommendations for red wine tonight? I prefer something full-bodied."
      },
      {
        id: 'msg-3',
        sender: 'aura',
        text: "For a full-bodied red, our sommelier highly recommends these two selections from our reserve cellar. They pair exceptionally well with our current seasonal entrees.",
        recommendations: [
          {
            id: 'rec-1',
            name: 'Château Margaux',
            price: 320,
            description: '2015 Bordeaux Blend. Rich, opulent, with notes of dark plum and cedar.'
          },
          {
            id: 'rec-2',
            name: 'Opus One',
            price: 450,
            description: '2018 Napa Valley. Elegant structure, cassis, and refined tannins.',
            isSommelierPick: true
          }
        ]
      }
    ]);

    const savedExclusions = localStorage.getItem('dinepos_exclusions_config');
    if (savedExclusions) {
      try {
        const parsed = JSON.parse(savedExclusions);
        setExclusionsConfig(prev => ({
          ...prev,
          ...parsed
        }));
      } catch (e) {
        console.error('Failed to parse exclusions config:', e);
      }
    }

    const savedCurrency = localStorage.getItem('dinepos_currency');
    if (['USD', 'JPY', 'EUR', 'GBP', 'CNY', 'KRW'].includes(savedCurrency || '')) {
      setCurrency(savedCurrency as any);
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dinepos_exclusions_config' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setExclusionsConfig(prev => ({
            ...prev,
            ...parsed
          }));
        } catch (err) {
          console.error('Failed to parse storage exclusions config updates:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Simulate typing delay on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Display feedback toast
  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Add recommendation item to order cart
  const handleAddToOrder = (itemId: string, itemName: string, price: number) => {
    const savedCart = localStorage.getItem('dinepos_cart');
    let cart: { [key: string]: CartItem } = {};
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Migrate legacy/number structure to structured CartItem mapping
        Object.entries(parsed).forEach(([key, value]) => {
          if (typeof value === 'number') {
            const course = key.startsWith('start-') ? 'starter' : key.startsWith('dess-') ? 'dessert' : key.startsWith('drink-') ? 'drinks' : 'main';
            const newKey = `${key}--${course}`;
            cart[newKey] = {
              itemId: key,
              quantity: value,
              modifiers: [],
              course: course
            };
          } else if (value && typeof value === 'object' && 'itemId' in (value as any)) {
            cart[key] = value as CartItem;
          }
        });
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }

    const course = itemId.startsWith('start-') ? 'starter' : itemId.startsWith('dess-') ? 'dessert' : (itemId.startsWith('drink-') || itemId.startsWith('rec-')) ? 'drinks' : 'main';
    const cartKey = `${itemId}--${course}`;
    if (cart[cartKey]) {
      cart[cartKey].quantity += 1;
    } else {
      cart[cartKey] = {
        itemId,
        quantity: 1,
        modifiers: [],
        course
      };
    }

    localStorage.setItem('dinepos_cart', JSON.stringify(cart));
    triggerToast(`Added ${itemName} (${formatCurrency(price)}) to Table ${tableNumber} order!`);
  };

  // Call Server Bell action
  const handleCallServer = () => {
    triggerToast(`Server dispatched to Table ${tableNumber}. Assistance is on the way.`);
  };

  // Submit suggestion button click
  const handleSuggestionClick = (suggestionText: string) => {
    submitUserMessage(suggestionText);
  };

  // Submit User Message and respond dynamically
  const submitUserMessage = (userText: string) => {
    if (!userText.trim()) return;

    // Append user message
    const newUserMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userText
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI Chef reasoning and response
    setTimeout(() => {
      let replyText = "Aura Concierge is analyzing your request. We recommend exploring our chef's signature seasonal entrees or pairing your selections with our reserve wine collection.";
      let suggestions: string[] = [];
      let recommendations: ChatMessage['recommendations'] = [];

      const query = userText.toLowerCase();

      if (query.includes('risotto') || query.includes('truffle')) {
        replyText = `Our Acquerello Mushroom Risotto (${formatCurrency(32)}) features Carnaroli rice, foraged forest mushrooms, and fresh black winter truffle shavings. It pairs beautifully with a glass of decanted red wine.`;
        suggestions = ['Order Risotto', 'Wine Pairings'];
      } else if (query.includes('cocktail') || query.includes('drink') || query.includes('menu')) {
        replyText = "Here are our signature house cocktails. I highly recommend the Royal Gold Old Fashioned, prepared with 12-year bourbon and smoked with cherrywood chips.";
        suggestions = ['Show Royal Gold', 'Emerald Gimlet'];
      } else if (query.includes('wagyu') || query.includes('meat') || query.includes('steak')) {
        replyText = `Our Gold Leaf A5 Wagyu Ribeye (${formatCurrency(185)}) features Miyazaki Wagyu seared over binchotan charcoal and brushed with a truffle glaze. It is our premier steak offering.`;
        suggestions = ['Order Wagyu', 'Recommend Pairings'];
      } else if (query.includes('sommelier') || query.includes('wine') || query.includes('red')) {
        replyText = `For cellared full-bodied reds, the sommelier recommends our 2015 Château Margaux (${formatCurrency(320)}) or our sommelier pick, the 2018 Opus One (${formatCurrency(450)}). Both pair exceptionally well with prime steak.`;
        recommendations = [
          { id: 'rec-1', name: 'Château Margaux', price: 320, description: '2015 Bordeaux Blend. Rich, opulent, with notes of dark plum and cedar.' },
          { id: 'rec-2', name: 'Opus One', price: 450, description: '2018 Napa Valley. Elegant structure, cassis, and refined tannins.', isSommelierPick: true }
        ];
      } else if (query.includes('gluten') || query.includes('gf')) {
        replyText = "We offer excellent gluten-free options, including the Gold Leaf Wagyu Ribeye, Truffle Burrata, and the Saffron Crème Brûlée dessert. Please let us know of any severe allergies.";
        suggestions = ['Burrata details', 'Dessert menu'];
      }

      const newAuraMsg: ChatMessage = {
        id: `msg-aura-${Date.now()}`,
        sender: 'aura',
        text: replyText,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined
      };

      setMessages(prev => [...prev, newAuraMsg]);
      setIsTyping(false);
    }, 1500);
  };

  // Chat Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitUserMessage(input);
  };

  // Simulated Voice mic command
  const handleVoiceClick = () => {
    setIsListening(true);
    triggerToast("Concierge listening... speak your inquiry.");

    setTimeout(() => {
      setIsListening(false);
      setInput("What are the sommelier's recommendations for red wine tonight?");
    }, 2000);
  };

  if (isLoaded && !exclusionsConfig.showAIConcierge) {
    return (
      <div className="min-h-screen bg-[#0e0e0d] text-[#e5e2e1] font-sans flex flex-col items-center justify-center p-8 select-none">
        <div className="bg-[#161513] border border-[#ffe2ab]/20 rounded-2xl max-w-md w-full p-8 text-center shadow-[0_0_50px_rgba(255,226,171,0.15)] space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
            <span className="material-symbols-outlined text-3xl font-black">smart_toy</span>
          </div>
          <h2 className="font-serif text-2xl text-white font-medium">AI Concierge Disabled</h2>
          <p className="text-xs text-[#A69984]/80 leading-relaxed">
            The administrator has disabled the AI Dining Concierge. Please refer to our digital menu or speak with your server for recommendations.
          </p>
          <Link
            href="/menu"
            className="inline-block px-8 py-3.5 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(255,226,171,0.1)]"
          >
            Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen bg-[#0e0e0e] text-[#f5f5f5] font-sans overflow-hidden antialiased select-none relative">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`h-full flex flex-col justify-between border-r border-white/5 bg-[#0a0a09] flex-shrink-0 z-20 transition-all duration-300 ${
        sidebarCollapsed 
          ? 'w-0 opacity-0 pointer-events-none border-r-0' 
          : 'w-[280px]'
      }`}>
        <div>
          {/* Brand header */}
          <div className="p-8 pb-4">
            <Link href="/" className="font-serif font-bold text-[#ffe2ab] text-2xl tracking-wide select-none block hover:opacity-85 transition-opacity mb-2">
              DinePosAi
            </Link>
            <div className="font-sans font-bold text-[10px] text-[#ffe2ab]/75 uppercase tracking-[0.2em] mb-1 select-none">
              Aura Intelligence
            </div>
          </div>
          
          {/* Sidebar options */}
          <nav className="px-5 space-y-2 mt-6">
            <Link 
              href="/menu" 
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">menu_book</span>
              Menu
            </Link>
            
            <button 
              className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider bg-[#ffe2ab]/10 border-l-[3px] border-[#ffe2ab] text-white transition-all duration-300"
              style={{
                backgroundColor: 'rgba(255, 226, 171, 0.08)',
                borderRadius: '0 12px 12px 0',
                marginLeft: '-4px'
              }}
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-lg leading-none text-[#ffe2ab]">smart_toy</span>
                Concierge
              </div>
            </button>

            <Link 
              href="/menu/order-status"
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider text-[#A69984]/80 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg leading-none">hourglass_empty</span>
              Order Status
            </Link>
          </nav>
        </div>

        {/* Bottom Current Table Details & Bell Call trigger */}
        <div className="px-5 pb-8 space-y-4">
          <div className="bg-[#161513]/80 border border-white/5 rounded-xl p-4 flex justify-between items-center select-none font-sans">
            <div>
              <span className="text-[8px] uppercase font-bold text-[#A69984]/50 tracking-wider">Current Table</span>
              <div className="text-white text-sm font-bold mt-0.5">Table {isLoaded ? tableNumber : 12}</div>
            </div>
            <span className="w-2.5 h-2.5 bg-[#ffe2ab] rounded-full shadow-[0_0_12px_rgba(255,226,171,0.5)] animate-pulse"></span>
          </div>

          <button 
            onClick={handleCallServer}
            className="flex items-center justify-center gap-3 w-full py-3.5 border border-[#A69984]/25 hover:border-[#ffe2ab]/40 hover:bg-white/[0.02] text-white font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">notifications</span>
            Call Server
          </button>
        </div>
      </aside>

      <SidebarToggleButton sidebarCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* MAIN CHAT CONSOLE AREA */}
      <main className="flex-1 flex flex-col h-full bg-[#11100e] relative overflow-hidden">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-10 py-6 flex-shrink-0 bg-[#0e0e0d] border-b border-white/5 sticky top-0 z-40 select-none">
          <div>
            <h1 className="font-serif text-[19px] font-medium text-[#ffe2ab] tracking-wide leading-none">
              Aura Concierge
            </h1>
            <p className="font-sans text-[11px] text-[#A69984]/60 mt-2 select-none font-semibold">
              Intelligent dining assistant for Table {isLoaded ? tableNumber : 12}
            </p>
          </div>
          
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffe2ab]/10 border border-[#ffe2ab]/25 rounded-full text-[11px] text-[#ffe2ab] font-sans font-bold select-none">
            <span className="w-1.5 h-1.5 bg-[#ffe2ab] rounded-full animate-ping"></span>
            AI Active
          </span>
        </header>

        {/* Chat Messages Log */}
        <div className="flex-grow overflow-y-auto px-10 pt-8 pb-32 space-y-6 scrollbar-hide flex flex-col">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
            >
              
              {/* Message Sender label */}
              <span className="text-[10px] text-[#A69984]/50 font-sans font-bold uppercase tracking-widest mb-1.5 px-1 select-none">
                {msg.sender === 'user' ? 'You' : 'Aura'}
              </span>

              {/* Message Bubble */}
              <div className="flex items-start gap-4">
                
                {/* Aura Icon or Avatar */}
                {msg.sender === 'aura' && (
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#ffe2ab] flex-shrink-0 mt-0.5 select-none">
                    <span className="material-symbols-outlined text-base leading-none">smart_toy</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Chat bubble body */}
                  <div 
                    className={`rounded-2xl p-5 font-sans text-xs leading-relaxed border whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/20 text-[#ffe2ab] rounded-tr-none' : 'bg-white/5 border-white/5 text-white/95 rounded-tl-none'}`}
                  >
                    {msg.text}
                  </div>

                  {/* Suggestion Chips Option */}
                  {msg.suggestions && (
                    <div className="flex gap-2.5 flex-wrap pt-1 select-none">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(sug)}
                          className="px-4 py-2 bg-transparent border border-[#ffe2ab]/20 hover:border-[#ffe2ab]/50 text-[#ffe2ab] text-[10px] font-bold rounded-full transition-colors cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Somers Pick Recommendations Grid (matching wine block in screenshot) */}
                  {msg.recommendations && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 max-w-2xl select-none">
                      {msg.recommendations.map((rec) => (
                        <div 
                          key={rec.id}
                          className="bg-[#161513] border border-white/5 rounded-xl p-5 shadow-lg relative flex flex-col justify-between"
                        >
                          {rec.isSommelierPick && (
                            <span className="absolute -top-2.5 right-4 bg-[#ffe2ab] text-[#402d00] font-sans font-bold text-[8.5px] uppercase tracking-widest px-2.5 py-0.5 rounded shadow">
                              Sommelier Pick
                            </span>
                          )}

                          <div className="mb-4">
                            <div className="flex justify-between items-baseline mb-1">
                              <h4 className="font-serif text-sm font-bold text-white tracking-wide">{rec.name}</h4>
                              <span className="font-sans font-bold text-xs text-[#ffe2ab]">{formatCurrency(rec.price)}</span>
                            </div>
                            <p className="font-sans text-[#A69984]/70 text-[10.5px] leading-relaxed">
                              {rec.description}
                            </p>
                          </div>

                          <button
                            onClick={() => handleAddToOrder(rec.id, rec.name, rec.price)}
                            className="w-full py-2 bg-transparent border border-white/10 hover:border-[#ffe2ab]/30 hover:bg-[#ffe2ab]/5 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Add to Order
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* User avatar on right side */}
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#ffe2ab] flex-shrink-0 mt-0.5 select-none">
                    <span className="material-symbols-outlined text-base leading-none">account_circle</span>
                  </div>
                )}

              </div>

            </div>
          ))}

          {/* Typing state bubble */}
          {isTyping && (
            <div className="flex flex-col max-w-[85%] self-start items-start">
              <span className="text-[10px] text-[#A69984]/50 font-sans font-bold uppercase tracking-widest mb-1.5 px-1 select-none">Aura</span>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#ffe2ab] flex-shrink-0 select-none">
                  <span className="material-symbols-outlined text-base leading-none">smart_toy</span>
                </div>
                <div className="bg-white/5 border border-white/5 text-[#A69984]/60 rounded-2xl rounded-tl-none p-4 px-5 text-xs font-sans flex items-center gap-1.5 select-none shadow">
                  <span className="w-1.5 h-1.5 bg-[#ffe2ab] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-[#ffe2ab] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-[#ffe2ab] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM MESSAGE INPUT BAR */}
        <div className="absolute bottom-0 left-0 w-full bg-[#161513]/90 border-t border-white/5 px-10 py-5 flex flex-col items-center gap-2.5 z-30 shadow-[0_-12px_40px_rgba(0,0,0,0.8)]">
          <form onSubmit={handleSubmit} className="flex gap-4 w-full max-w-4xl select-none">
            
            {/* Mic query toggle */}
            <button 
              type="button"
              onClick={handleVoiceClick}
              className={`w-12 h-12 flex items-center justify-center bg-transparent border rounded-xl transition-all cursor-pointer ${isListening ? 'border-[#ffe2ab] bg-[#ffe2ab]/10 text-[#ffe2ab]' : 'border-[#A69984]/25 text-[#A69984]/70 hover:border-white/20 hover:text-white'}`}
            >
              <span className={`material-symbols-outlined text-lg leading-none ${isListening ? 'animate-pulse text-[#ffe2ab]' : ''}`}>mic</span>
            </button>

            {/* Input field */}
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aura anything..."
              className="flex-1 bg-[#11100e] border border-white/10 rounded-xl px-5 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors"
            />

            {/* Send button (gold arrow square matching mockup) */}
            <button 
              type="submit"
              className="w-12 h-12 bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] rounded-xl flex items-center justify-center transition-colors shadow-lg cursor-pointer flex-shrink-0"
            >
              <span className="material-symbols-outlined text-lg leading-none font-bold">send</span>
            </button>
          </form>
          
          <div className="text-[10px] text-[#A69984]/45 font-sans font-semibold text-center select-none leading-none">
            Aura AI may produce inaccurate information about menu items. Please verify allergies with staff.
          </div>
        </div>

      </main>

      {/* FEEDBACK TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-50 animate-slide-in duration-300">
          <div className="bg-[#161513] border border-[#ffe2ab]/20 text-[#ffe2ab] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-xl animate-bounce">check_circle</span>
            <div>
              <div className="font-sans font-bold text-xs uppercase tracking-wider text-white">Update</div>
              <div className="font-sans text-[11px] text-[#A69984]/80 mt-0.5">{toast.message}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
