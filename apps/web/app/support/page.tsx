'use client';

import React, { useState } from 'react';
import TopNavBar from '@/components/layouts/TopNavBar';
import Link from 'next/link';

export default function SupportPage() {
  const [establishment, setEstablishment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('Technical Support');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  const triggerToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      triggerToast('Please fill out all required fields.');
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
      const tickets = existing ? JSON.parse(existing) : [];
      tickets.unshift(newTicket);
      localStorage.setItem('dinepos_support_tickets', JSON.stringify(tickets));
    } catch (err) {
      console.error(err);
    }
    
    // Simulate submission success
    triggerToast(`Thank you, ${name}! Your ${inquiryType} request has been logged. Our concierge team will reach out shortly.`);
    // Reset form
    setEstablishment('');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface flex flex-col antialiased min-h-screen pt-24 pb-8">
      <TopNavBar />
      
      <main className="flex-grow max-w-6xl mx-auto px-margin-desktop w-full pb-24">
        
        {/* Header */}
        <div className="text-center mb-16 mt-8">
          <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface mb-4">Premium Support Concierge</h1>
          <p className="font-body-md text-on-surface-variant text-lg max-w-2xl mx-auto">
            Intelligent assistance for high-end hospitality environments. Reach out to our dedicated specialists or explore our knowledge resources.
          </p>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Form Side */}
          <div className="lg:col-span-2 glass-panel rounded-xl p-8 border-outline/10">
            <h2 className="font-display-lg text-2xl text-on-surface mb-8">Direct Inquiry</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest font-bold">Establishment Name</label>
                  <input 
                    type="text" 
                    value={establishment}
                    onChange={(e) => setEstablishment(e.target.value)}
                    placeholder="e.g. The French Laundry" 
                    className="bg-surface border border-outline/20 rounded p-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest font-bold">Contact Name *</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name" 
                    className="bg-surface border border-outline/20 rounded p-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest font-bold">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@restaurant.com" 
                    className="bg-surface border border-outline/20 rounded p-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest font-bold">Inquiry Type</label>
                  <div className="relative">
                    <select 
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="bg-surface border border-outline/20 rounded p-3 text-on-surface w-full appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    >
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing">Billing</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest font-bold">Message *</label>
                <textarea 
                  rows={5} 
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you today?" 
                  className="bg-surface border border-outline/20 rounded p-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-primary text-on-primary font-title-md px-8 py-3 rounded hover:bg-primary/90 transition-colors font-semibold flex items-center gap-2 cursor-pointer shadow-lg active:scale-95">
                  Submit Request <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>

          {/* Contact Info Side */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel rounded-xl p-8 border-outline/10 h-full flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">support_agent</span>
                <h3 className="font-label-sm text-sm text-primary uppercase tracking-widest font-bold">Global Concierge</h3>
              </div>
              <p className="font-body-md text-on-surface-variant text-sm mb-8 leading-relaxed">
                For immediate assistance during service hours.
              </p>
              
              <div className="space-y-4 font-body-md">
                <a href="tel:+18005553463" className="flex items-center gap-4 text-on-surface hover:text-primary transition-colors text-lg font-bold">
                  <span className="material-symbols-outlined text-on-surface-variant">call</span>
                  +1 (800) 555-DINE
                </a>
                <a href="mailto:concierge@dinepos.ai" className="flex items-center gap-4 text-on-surface hover:text-primary transition-colors text-lg font-bold">
                  <span className="material-symbols-outlined text-on-surface-variant">mail</span>
                  concierge@dinepos.ai
                </a>
              </div>
            </div>

            <div 
              onClick={() => triggerToast('Accessing ticket management portal...')}
              className="glass-panel rounded-xl p-6 border-outline/10 group cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-primary font-label-sm text-sm uppercase tracking-widest font-bold">
                  <span className="material-symbols-outlined text-lg">confirmation_number</span>
                  Ticket Portal
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
              </div>
              <p className="font-body-md text-on-surface-variant text-sm">
                Track existing requests or view resolution history for your venue.
              </p>
            </div>
          </div>
        </div>

        {/* Knowledge Base Section */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="font-display-lg text-3xl text-on-surface mb-2">Knowledge Base</h2>
              <p className="font-body-md text-on-surface-variant text-sm">Quick solutions for common operational queries.</p>
            </div>
            <button 
              onClick={() => triggerToast('Loading complete operational knowledge database...')}
              className="font-label-sm text-primary text-sm uppercase tracking-widest flex items-center gap-1 hover:text-primary-fixed transition-colors font-bold cursor-pointer"
            >
              View All Articles <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={() => triggerToast('Opening "Menu Engineering Guide"...')}
              className="glass-panel rounded-xl p-6 border-outline/10 hover-glow cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-xl">restaurant_menu</span>
                <h4 className="font-title-md text-on-surface font-semibold">Menu Engineering Guide</h4>
              </div>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                How to update pricing and modifier groups during active service safely.
              </p>
            </div>

            <div 
              onClick={() => triggerToast('Opening "Offline Mode Operations"...')}
              className="glass-panel rounded-xl p-6 border-outline/10 hover-glow cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-xl">wifi_off</span>
                <h4 className="font-title-md text-on-surface font-semibold">Offline Mode Operations</h4>
              </div>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                Best practices for maintaining order flow during temporary network interruptions.
              </p>
            </div>

            <div 
              onClick={() => triggerToast('Opening "Staff Permissions Management"...')}
              className="glass-panel rounded-xl p-6 border-outline/10 hover-glow cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-xl">manage_accounts</span>
                <h4 className="font-title-md text-on-surface font-semibold">Staff Permissions Management</h4>
              </div>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                Configuring access levels for management, servers, and kitchen staff.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full border-t border-outline-variant/30 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop py-lg gap-gutter max-w-7xl mx-auto">
          <div className="font-body-md text-on-surface-variant text-xs opacity-80 max-w-[200px] leading-relaxed">
            © 2026 DinePOS AI. Intelligent Hospitality Systems.
          </div>
          <div className="flex flex-wrap justify-center gap-md font-label-sm text-on-surface-variant text-xs font-medium">
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/terms">Terms of Service</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/privacy">Privacy Policy</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100 text-primary opacity-100 font-bold" href="/support">Contact Support</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/experience">Experience</Link>
            <Link className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="/solutions">Solutions</Link>
          </div>
        </div>
      </footer>

      {/* Toast Alert */}
      {toast.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1e1c19] border border-[#ffe2ab]/20 text-[#ffe2ab] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold font-sans max-w-md text-center">
          <span className="material-symbols-outlined text-[#ffe2ab] text-lg">info</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
