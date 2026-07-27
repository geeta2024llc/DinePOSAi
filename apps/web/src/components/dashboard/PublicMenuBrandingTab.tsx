'use client';

import React, { useState, useEffect } from 'react';

interface PublicMenuBrandingTabProps {
  t: any;
  triggerToast: (msg: string, type: 'success' | 'info') => void;
}

export default function PublicMenuBrandingTab({ t, triggerToast }: PublicMenuBrandingTabProps) {
  const [restaurantName, setRestaurantName] = useState('DinePOS AI Fine Dining');
  const [welcomeSubtitle, setWelcomeSubtitle] = useState('Exquisite Culinary Offerings & Signature Dishes');
  const [bannerUrl, setBannerUrl] = useState('/images/wagyu_ribeye.png');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [address, setAddress] = useState('100 Culinary Boulevard, Suite 400');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com');
  const [tenantId, setTenantId] = useState('tenant-primary');

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('dinepos_user_account');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user?.tenantId) setTenantId(user.tenantId);
          if (user?.name) setRestaurantName(user.name);
        } catch { /* ignore */ }
      }

      const saved = localStorage.getItem(`dinepos_public_branding_${tenantId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.restaurantName) setRestaurantName(parsed.restaurantName);
          if (parsed.welcomeSubtitle) setWelcomeSubtitle(parsed.welcomeSubtitle);
          if (parsed.bannerUrl) setBannerUrl(parsed.bannerUrl);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.address) setAddress(parsed.address);
          if (parsed.instagramUrl) setInstagramUrl(parsed.instagramUrl);
          if (parsed.facebookUrl) setFacebookUrl(parsed.facebookUrl);
        } catch { /* ignore */ }
      }
    }
  }, [tenantId]);

  const publicMenuUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/menu/public?tenant=${tenantId}`
    : `https://www.dineposai.com/menu/public?tenant=${tenantId}`;

  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(publicMenuUrl)}&color=1a1200&bgcolor=ffc53d`;

  const handleSaveBranding = () => {
    if (typeof window !== 'undefined') {
      const payload = {
        restaurantName,
        welcomeSubtitle,
        bannerUrl,
        phone,
        address,
        instagramUrl,
        facebookUrl
      };
      localStorage.setItem(`dinepos_public_branding_${tenantId}`, JSON.stringify(payload));
      triggerToast('Public Digital Menu branding saved successfully!', 'success');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(publicMenuUrl);
      setCopiedLink(true);
      triggerToast('Public Menu URL copied to clipboard!', 'info');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-8 font-sans text-xs animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="px-2.5 py-1 bg-[#ffc53d]/15 border border-[#ffc53d]/30 text-[#ffc53d] text-[10px] font-extrabold uppercase tracking-widest rounded-lg">
            Module 2: Standalone Public Menu
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-wide mt-1.5">
            Public Digital Menu & Branding Controls
          </h2>
          <p className="text-[#A69984]/70 text-xs mt-1">
            Customize your restaurant's web menu page for social media, website, Google Maps, and standalone QR displays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={publicMenuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-[#ffc53d]">open_in_new</span>
            Preview Public Menu
          </a>
          <button
            type="button"
            onClick={handleSaveBranding}
            className="px-5 py-2.5 bg-[#ffc53d] hover:bg-[#ffb014] text-[#1a1200] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-sm font-bold">save</span>
            Save Branding
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Branding Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161513] border border-white/5 rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffc53d]">palette</span>
              Branding & Text Customizations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#A69984]/70 uppercase tracking-wider block mb-1.5">
                  Establishment Display Name
                </label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ffc53d]/40"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A69984]/70 uppercase tracking-wider block mb-1.5">
                  Welcome Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={welcomeSubtitle}
                  onChange={(e) => setWelcomeSubtitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ffc53d]/40"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A69984]/70 uppercase tracking-wider block mb-1.5">
                Header Hero Banner Image URL
              </label>
              <input
                type="text"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ffc53d]/40"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[10px] font-bold text-[#A69984]/70 uppercase tracking-wider block mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ffc53d]/40"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A69984]/70 uppercase tracking-wider block mb-1.5">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ffc53d]/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Shareable Link & Standalone QR Generator */}
        <div className="space-y-6">
          {/* Shareable Link Card */}
          <div className="bg-[#161513] border border-white/5 rounded-2xl p-6 space-y-4 shadow-lg">
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffc53d]">link</span>
              Shareable Web Menu Link
            </h3>
            <p className="text-[11px] text-[#A69984]/70 leading-relaxed">
              Share this direct public URL on your Instagram bio, Facebook page, or Google Business profile.
            </p>

            <div className="p-3 bg-black/40 border border-white/10 rounded-xl break-all font-mono text-[11px] text-amber-300">
              {publicMenuUrl}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className={`w-full py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {copiedLink ? 'check' : 'content_copy'}
              </span>
              {copiedLink ? 'Link Copied!' : 'Copy Shareable Link'}
            </button>
          </div>

          {/* Standalone QR Code Generator Card */}
          <div className="bg-[#161513] border border-white/5 rounded-2xl p-6 space-y-4 shadow-lg flex flex-col items-center text-center">
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffc53d]">qr_code_2</span>
              Standalone Printable QR Code
            </h3>
            <p className="text-[11px] text-[#A69984]/70">
              Print this QR code on posters, brochures, or takeaway bags for table-free menu browsing.
            </p>

            <div className="p-4 bg-[#ffc53d] rounded-2xl border-4 border-white/10 shadow-xl">
              <img src={qrCodeImageUrl} alt="Public Menu QR Code" className="w-44 h-44 rounded-lg" />
            </div>

            <a
              href={qrCodeImageUrl}
              download={`DinePOS_Public_Menu_QR_${tenantId}.png`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-[#ffc53d] hover:bg-[#ffb014] text-[#1a1200] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">download</span>
              Download QR Code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
