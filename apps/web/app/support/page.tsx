'use client';

import React, { useState, useEffect } from 'react';
import TopNavBar from '@/components/layouts/TopNavBar';
import Link from 'next/link';
import { getCmsConfig, defaultCmsConfig } from '@/components/cms/CmsHelper';

export default function SupportPage() {
  const [cmsConfig, setCmsConfig] = useState(defaultCmsConfig);

  useEffect(() => {
    setCmsConfig(getCmsConfig());
    const handleUpdate = () => setCmsConfig(getCmsConfig());
    window.addEventListener('dinepos_cms_update', handleUpdate);
    return () => window.removeEventListener('dinepos_cms_update', handleUpdate);
  }, []);

  const [establishment, setEstablishment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('Technical Support');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  
  // Ticket Portal State
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    // Load tickets from local storage on mount
    try {
      const existing = localStorage.getItem('dinepos_support_tickets');
      if (existing) {
        setTickets(JSON.parse(existing));
      }
    } catch (err) {
      console.error(err);
    }
  }, [ticketModalOpen]); // Reload when modal opens

  const triggerToast = (msg: string, type = 'info') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      triggerToast('Please fill out all required fields.', 'error');
      return;
    }
    
    // Save to local storage
    const newTicket = {
      id: `TCK-${Math.floor(100000 + Math.random() * 900000)}`,
      establishment: establishment || 'Independent Guest',
      name,
      email,
      inquiryType,
      message,
      status: 'OPEN',
      submittedAt: new Date().toISOString()
    };
    
    try {
      const existing = localStorage.getItem('dinepos_support_tickets');
      const savedTickets = existing ? JSON.parse(existing) : [];
      savedTickets.unshift(newTicket);
      localStorage.setItem('dinepos_support_tickets', JSON.stringify(savedTickets));
      setTickets(savedTickets);
    } catch (err) {
      console.error(err);
    }
    
    // Simulate submission success
    triggerToast(`Thank you, ${name}! Your ${inquiryType} request has been logged.`, 'success');
    
    // Reset form
    setEstablishment('');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="bg-[#0e0e0e] text-[#e5e2e1] flex flex-col antialiased min-h-screen pt-24 pb-8 font-sans selection:bg-[#ffe2ab]/30">
      <TopNavBar />
      
      <main className="flex-grow max-w-6xl mx-auto px-6 md:px-12 w-full pb-24 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 mt-8 animate-fade-in">
          <h1 className="font-serif text-[42px] md:text-[56px] text-white tracking-wide leading-none mb-6 font-medium">
            {cmsConfig.support.title}
          </h1>
          <p className="font-sans text-[13px] md:text-[14px] text-[#A69984] max-w-2xl mx-auto leading-relaxed font-medium tracking-wide">
            {cmsConfig.support.subtitle}
          </p>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 items-start">
          
          {/* Form Side */}
          <div className="lg:col-span-8 bg-[#12110f] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffe2ab]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>
            
            <div className="flex items-center gap-3 mb-8 relative z-10 border-b border-white/5 pb-6">
              <span className="material-symbols-outlined text-[#ffe2ab] text-xl font-light">mail</span>
              <h2 className="font-serif text-xl md:text-2xl text-white tracking-wide font-bold">Direct Inquiry</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] text-[#A69984] uppercase tracking-widest font-bold ml-1">Establishment Name</label>
                  <input 
                    type="text" 
                    value={establishment}
                    onChange={(e) => setEstablishment(e.target.value)}
                    placeholder="e.g. The French Laundry" 
                    className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-all font-medium shadow-inner" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] text-[#A69984] uppercase tracking-widest font-bold ml-1">Contact Name <span className="text-[#ffe2ab]">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name" 
                    className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-all font-medium shadow-inner" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] text-[#A69984] uppercase tracking-widest font-bold ml-1">Email Address <span className="text-[#ffe2ab]">*</span></label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@restaurant.com" 
                    className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-all font-medium shadow-inner" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] text-[#A69984] uppercase tracking-widest font-bold ml-1">Inquiry Type</label>
                  <div className="relative">
                    <select 
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white appearance-none focus:outline-none focus:border-[#ffe2ab]/40 transition-all font-medium shadow-inner cursor-pointer"
                    >
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing">Billing & Subscriptions</option>
                      <option value="Hardware">Hardware Setup</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#A69984] text-sm">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-[10px] text-[#A69984] uppercase tracking-widest font-bold ml-1">Message <span className="text-[#ffe2ab]">*</span></label>
                <textarea 
                  rows={5} 
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our concierge assist you today?" 
                  className="w-full bg-[#0a0a09] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-all font-medium shadow-inner resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] font-sans font-bold text-[11px] uppercase tracking-wider px-8 py-4 rounded-xl transition-all duration-300 shadow-lg flex items-center gap-2 cursor-pointer active:scale-95">
                  Submit Request <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>

          {/* Contact Info & Portal Side */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Global Concierge Card */}
            <div className="bg-[#12110f] border border-white/5 rounded-3xl p-8 shadow-xl flex flex-col justify-center min-h-[280px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#A69984]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#ffe2ab] text-xl font-light">support_agent</span>
                <h3 className="font-sans text-[11px] text-[#ffe2ab] uppercase tracking-widest font-bold">Global Concierge</h3>
              </div>
              <p className="font-sans text-[12px] text-[#A69984] mb-8 leading-relaxed font-medium">
                For immediate assistance or critical outages during active service hours.
              </p>
              
              <div className="space-y-4 font-sans">
                <a href={`tel:${cmsConfig.support.phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-4 text-white hover:text-[#ffe2ab] transition-colors text-sm font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-[#A69984] text-lg">call</span>
                  {cmsConfig.support.phone}
                </a>
                <a href={`mailto:${cmsConfig.support.email}`} className="flex items-center gap-4 text-white hover:text-[#ffe2ab] transition-colors text-sm font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-[#A69984] text-lg">mail</span>
                  {cmsConfig.support.email}
                </a>
                <div className="flex items-center gap-4 text-white text-sm font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-[#A69984] text-lg">schedule</span>
                  {cmsConfig.support.hours}
                </div>
              </div>
            </div>

            {/* Ticket Portal Card */}
            <div 
              onClick={() => setTicketModalOpen(true)}
              className="bg-[#12110f] border border-[#ffe2ab]/20 hover:bg-[#ffe2ab]/5 rounded-3xl p-8 shadow-xl group cursor-pointer transition-all duration-300 h-[140px] flex flex-col justify-center"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-[#ffe2ab] font-sans text-[11px] uppercase tracking-widest font-bold">
                  <span className="material-symbols-outlined text-lg">confirmation_number</span>
                  Ticket Portal
                </div>
                <div className="w-8 h-8 rounded-full bg-[#ffe2ab]/10 flex items-center justify-center group-hover:bg-[#ffe2ab]/20 transition-colors">
                  <span className="material-symbols-outlined text-[#ffe2ab] text-sm">arrow_forward</span>
                </div>
              </div>
              <p className="font-sans text-[12px] text-[#A69984] font-medium leading-relaxed">
                Track your submitted requests and view resolution history.
              </p>
            </div>

          </div>
        </div>

        {/* Knowledge Base Section */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="font-serif text-[26px] md:text-[32px] text-white mb-2 font-bold tracking-wide">Knowledge Base</h2>
              <p className="font-sans text-[13px] text-[#A69984] font-medium">Detailed guides and solutions for common operational queries.</p>
            </div>
            <button 
              onClick={() => triggerToast('Opening full knowledge directory...')}
              className="font-sans text-[#ffe2ab] text-[10px] uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors font-bold cursor-pointer bg-[#ffe2ab]/10 px-4 py-2 rounded-lg"
            >
              View All Articles <span className="material-symbols-outlined text-sm">menu_book</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={() => triggerToast('Opening "Menu Engineering Guide"...')}
              className="bg-[#12110f] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.02] cursor-pointer transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                <span className="material-symbols-outlined text-[#ffe2ab] text-xl font-light">restaurant_menu</span>
              </div>
              <h4 className="font-serif text-lg text-white font-bold mb-3 tracking-wide">Menu Engineering</h4>
              <p className="font-sans text-[#A69984] text-[12.5px] leading-relaxed font-medium">
                Best practices for updating pricing and modifier groups during active service safely without disrupting open tickets.
              </p>
            </div>

            <div 
              onClick={() => triggerToast('Opening "Offline Mode Operations"...')}
              className="bg-[#12110f] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.02] cursor-pointer transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                <span className="material-symbols-outlined text-[#ffe2ab] text-xl font-light">wifi_off</span>
              </div>
              <h4 className="font-serif text-lg text-white font-bold mb-3 tracking-wide">Offline Operations</h4>
              <p className="font-sans text-[#A69984] text-[12.5px] leading-relaxed font-medium">
                Maintaining seamless order flow and local print routing during temporary network interruptions or ISP outages.
              </p>
            </div>

            <div 
              onClick={() => triggerToast('Opening "Staff Permissions Management"...')}
              className="bg-[#12110f] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.02] cursor-pointer transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                <span className="material-symbols-outlined text-[#ffe2ab] text-xl font-light">manage_accounts</span>
              </div>
              <h4 className="font-serif text-lg text-white font-bold mb-3 tracking-wide">Access Permissions</h4>
              <p className="font-sans text-[#A69984] text-[12.5px] leading-relaxed font-medium">
                Configuring granular access levels for management, servers, and kitchen staff across all POS terminals.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="pt-16 mt-16 border-t border-white/5">
          <div className="text-center md:text-left mb-10">
            <h2 className="font-serif text-[26px] md:text-[32px] text-white mb-2 font-bold tracking-wide">Frequently Asked Questions</h2>
            <p className="font-sans text-[13px] text-[#A69984] font-medium">Common questions about DinePOS AI services and network replication.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
            <div className="bg-[#12110f] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
              <h4 className="font-serif text-lg text-[#ffe2ab] font-bold mb-3 tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffe2ab] text-lg">help_outline</span>
                {cmsConfig.support.faq1Title}
              </h4>
              <p className="text-[#A69984] text-[13px] leading-relaxed font-medium mt-3">
                {cmsConfig.support.faq1Desc}
              </p>
            </div>

            <div className="bg-[#12110f] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
              <h4 className="font-serif text-lg text-[#ffe2ab] font-bold mb-3 tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffe2ab] text-lg">help_outline</span>
                {cmsConfig.support.faq2Title}
              </h4>
              <p className="text-[#A69984] text-[13px] leading-relaxed font-medium mt-3">
                {cmsConfig.support.faq2Desc}
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 mt-auto bg-[#0a0a09] relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-8 gap-6 max-w-7xl mx-auto">
          <div className="font-sans text-[#A69984]/50 text-[10px] font-bold tracking-widest uppercase text-center md:text-left">
            © 2026 DinePOS AI. All Rights Reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-sans text-[11px] text-[#A69984] font-bold uppercase tracking-wider">
            <Link className="hover:text-white transition-colors" href="/terms">Terms of Service</Link>
            <Link className="hover:text-white transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="text-[#ffe2ab] hover:text-white transition-colors" href="/support">Contact Support</Link>
          </div>
        </div>
      </footer>

      {/* Ticket Portal Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="bg-[#12110f] border border-white/10 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a09]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffe2ab]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ffe2ab]">confirmation_number</span>
                </div>
                <div>
                  <h3 className="font-serif text-xl text-white font-bold tracking-wide">Your Support Tickets</h3>
                  <p className="text-[10px] text-[#A69984] font-bold uppercase tracking-widest mt-1">Status & Resolution History</p>
                </div>
              </div>
              <button 
                onClick={() => setTicketModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-[#A69984] hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-grow bg-[#12110f]">
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((t, idx) => (
                    <div key={idx} className="bg-[#161513] border border-white/5 rounded-2xl p-6 relative">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-[11px] text-[#A69984] tracking-wider">{t.id}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded ${
                              t.status === 'OPEN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                              t.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                              'bg-white/5 text-[#A69984] border border-white/10'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-base">{t.inquiryType}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#A69984] font-semibold">{new Date(t.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                        <p className="text-[13px] text-[#A69984] leading-relaxed break-words">{t.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-[#A69984]/30 mb-4 font-light">inbox</span>
                  <h4 className="font-serif text-lg text-white font-bold mb-2 tracking-wide">No Tickets Found</h4>
                  <p className="text-[12px] text-[#A69984] max-w-sm mx-auto leading-relaxed">
                    You haven't submitted any support requests yet. Use the Direct Inquiry form to contact our concierge.
                  </p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-white/5 bg-[#0a0a09] flex justify-end">
              <button 
                onClick={() => setTicketModalOpen(false)}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#12110f] border border-white/10 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold font-sans max-w-md text-center animate-fade-in">
          <span className={`material-symbols-outlined text-lg ${
            toast.type === 'success' ? 'text-emerald-400' : 
            toast.type === 'error' ? 'text-rose-400' : 'text-[#ffe2ab]'
          }`}>
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
