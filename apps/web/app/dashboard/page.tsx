'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const themes = {
  'Midnight Black': {
    name: 'Midnight Black',
    bg: 'bg-[#0e0e0d]',
    bgSecondary: 'bg-[#161513]',
    cardBg: 'bg-[#161513]/90 border-white/5',
    cardBgOpaque: 'bg-[#161513] border-white/5',
    sidebarBg: 'bg-[#0a0a09] border-white/5',
    border: 'border-white/5',
    borderStrong: 'border-white/10',
    text: 'text-[#e5e2e1]',
    textMuted: 'text-[#A69984]/65',
    textMutedLight: 'text-[#A69984]/50',
    textMutedDark: 'text-[#A69984]/40',
    accent: 'text-[#ffc53d]',
    accentBg: 'bg-[#ffc53d]',
    accentHoverBg: 'hover:bg-[#ffb014]',
    accentText: 'text-[#2c1a00]',
    accentLight: 'text-[#ffe2ab]',
    accentLightBg: 'bg-[#ffe2ab]/10',
    accentLightBorder: 'border-[#ffe2ab]/20',
    cardHover: 'hover:bg-white/[0.01]',
    inputBg: 'bg-[#0e0e0d]',
    inputBorder: 'border-white/10',
    buttonOutline: 'border-white/10 hover:border-white/20 text-white',
    divider: 'divide-white/5',
    tagAdmin: 'bg-white/5 border border-white/10 text-[#A69984]/50',
    tagManager: 'bg-[#ffe2ab]/10 border border-[#ffe2ab]/20 text-[#ffe2ab]',
    tagStaff: 'bg-sky-500/10 border border-sky-500/20 text-sky-400',
    scrollbarThumb: 'scrollbar-thumb-white/10'
  },
  'Pristine White': {
    name: 'Pristine White',
    bg: 'bg-[#f4f3f0]',
    bgSecondary: 'bg-[#ffffff]',
    cardBg: 'bg-white/95 border-[#e2ddd5] shadow-[0_4px_16px_rgba(142,130,111,0.06)]',
    cardBgOpaque: 'bg-white border-[#e2ddd5] shadow-[0_4px_16px_rgba(142,130,111,0.06)]',
    sidebarBg: 'bg-[#edeae5] border-[#dfdad0]',
    border: 'border-[#e2ddd5]',
    borderStrong: 'border-[#cdc7bc]',
    text: 'text-[#292825]',
    textMuted: 'text-[#6e6b63]',
    textMutedLight: 'text-[#8b877f]',
    textMutedDark: 'text-[#a29e95]',
    accent: 'text-[#cfa426]',
    accentBg: 'bg-[#cfa426]',
    accentHoverBg: 'hover:bg-[#b08b1f]',
    accentText: 'text-white',
    accentLight: 'text-[#8c6f17]',
    accentLightBg: 'bg-[#cfa426]/10',
    accentLightBorder: 'border-[#cfa426]/20',
    cardHover: 'hover:bg-black/[0.01]',
    inputBg: 'bg-[#fafaf9]',
    inputBorder: 'border-[#e2ddd5]',
    buttonOutline: 'border-[#cdc7bc] hover:border-[#b0a99c] text-[#292825]',
    divider: 'divide-[#e2ddd5]',
    tagAdmin: 'bg-[#6e6b63]/5 border border-[#6e6b63]/15 text-[#6e6b63]',
    tagManager: 'bg-[#cfa426]/10 border border-[#cfa426]/20 text-[#8c6f17]',
    tagStaff: 'bg-sky-600/10 border border-sky-600/20 text-sky-700',
    scrollbarThumb: 'scrollbar-thumb-black/10'
  },
  'Bordeaux Reserve': {
    name: 'Bordeaux Reserve',
    bg: 'bg-[#180a0c]',
    bgSecondary: 'bg-[#221013]',
    cardBg: 'bg-[#221013]/90 border-[#4a1c24]',
    cardBgOpaque: 'bg-[#221013] border-[#4a1c24]',
    sidebarBg: 'bg-[#100305] border-[#4a1c24]',
    border: 'border-[#4a1c24]',
    borderStrong: 'border-[#6b2c37]',
    text: 'text-[#f0e2e0]',
    textMuted: 'text-[#cca5a1]',
    textMutedLight: 'text-[#b88c87]',
    textMutedDark: 'text-[#9e6f6a]',
    accent: 'text-[#f5aca4]',
    accentBg: 'bg-[#f5aca4]',
    accentHoverBg: 'hover:bg-[#e0928b]',
    accentText: 'text-[#380d12]',
    accentLight: 'text-[#fad2ce]',
    accentLightBg: 'bg-[#f5aca4]/15',
    accentLightBorder: 'border-[#f5aca4]/30',
    cardHover: 'hover:bg-white/[0.01]',
    inputBg: 'bg-[#160608]',
    inputBorder: 'border-[#4a1c24]',
    buttonOutline: 'border-[#6b2c37] hover:border-[#8c3d4b] text-[#f0e2e0]',
    divider: 'divide-[#4a1c24]',
    tagAdmin: 'bg-white/5 border border-white/10 text-[#cca5a1]/50',
    tagManager: 'bg-[#f5aca4]/10 border border-[#f5aca4]/20 text-[#f5aca4]',
    tagStaff: 'bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffe2ab]',
    scrollbarThumb: 'scrollbar-thumb-white/10'
  },
  'Deep Teal': {
    name: 'Deep Teal',
    bg: 'bg-[#051112]',
    bgSecondary: 'bg-[#0c1c1e]',
    cardBg: 'bg-[#0c1c1e]/90 border-[#1a383b]',
    cardBgOpaque: 'bg-[#0c1c1e] border-[#1a383b]',
    sidebarBg: 'bg-[#02090a] border-[#1a383b]',
    border: 'border-[#1a383b]',
    borderStrong: 'border-[#285357]',
    text: 'text-[#d6ebec]',
    textMuted: 'text-[#9fb9bb]',
    textMutedLight: 'text-[#84a3a5]',
    textMutedDark: 'text-[#698a8c]',
    accent: 'text-[#48e5ec]',
    accentBg: 'bg-[#48e5ec]',
    accentHoverBg: 'hover:bg-[#34c9cf]',
    accentText: 'text-[#032426]',
    accentLight: 'text-[#9ef7fa]',
    accentLightBg: 'bg-[#48e5ec]/15',
    accentLightBorder: 'border-[#48e5ec]/30',
    cardHover: 'hover:bg-white/[0.01]',
    inputBg: 'bg-[#030d0e]',
    inputBorder: 'border-[#1a383b]',
    buttonOutline: 'border-[#285357] hover:border-[#387277] text-[#d6ebec]',
    divider: 'divide-[#1a383b]',
    tagAdmin: 'bg-white/5 border border-white/10 text-[#9fb9bb]/50',
    tagManager: 'bg-[#48e5ec]/10 border border-[#48e5ec]/20 text-[#48e5ec]',
    tagStaff: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
    scrollbarThumb: 'scrollbar-thumb-white/10'
  },
  'Custom Palette': {
    name: 'Custom Palette',
    bg: 'bg-[var(--custom-bg)]',
    bgSecondary: 'bg-[var(--custom-card-bg)]',
    cardBg: 'bg-[var(--custom-card-bg)]/90 border-[var(--custom-accent)]/10',
    cardBgOpaque: 'bg-[var(--custom-card-bg)] border-[var(--custom-accent)]/10',
    sidebarBg: 'bg-[var(--custom-bg)] border-[var(--custom-accent)]/10',
    border: 'border-[var(--custom-accent)]/5',
    borderStrong: 'border-[var(--custom-accent)]/15',
    text: 'text-[var(--custom-text)]',
    textMuted: 'text-[var(--custom-text-muted)]',
    textMutedLight: 'text-[var(--custom-text-muted)]/75',
    textMutedDark: 'text-[var(--custom-text-muted)]/50',
    accent: 'text-[var(--custom-accent)]',
    accentBg: 'bg-[var(--custom-accent)]',
    accentHoverBg: 'hover:opacity-90',
    accentText: 'text-black',
    accentLight: 'text-[var(--custom-accent)]',
    accentLightBg: 'bg-[var(--custom-accent)]/15',
    accentLightBorder: 'border-[var(--custom-accent)]/20',
    cardHover: 'hover:bg-white/[0.01]',
    inputBg: 'bg-[var(--custom-bg)]',
    inputBorder: 'border-[var(--custom-accent)]/20',
    buttonOutline: 'border-[var(--custom-accent)]/20 text-[var(--custom-text)]',
    divider: 'divide-[var(--custom-accent)]/10',
    tagAdmin: 'bg-white/5 border border-white/10 text-[var(--custom-text-muted)]/60',
    tagManager: 'bg-[var(--custom-accent)]/10 border border-[var(--custom-accent)]/20 text-[var(--custom-accent)]',
    tagStaff: 'bg-sky-500/10 border border-sky-500/20 text-sky-400',
    scrollbarThumb: 'scrollbar-thumb-white/10'
  }
};

const translations: Record<string, Record<string, string>> = {
  en: {
    adminConsole: "Admin Console",
    general: "General Settings",
    payments: "Payments & Billing",
    hardware: "Hardware Ecosystem",
    staff: "Staff Management",
    security: "Security Controls",
    menuEditor: "Food Menu Editor",
    saveChanges: "Save Changes",
    signOut: "Sign Out",
    searchPlaceholder: "Search parameters...",
    administrator: "Administrator",
    generalTitle: "General Settings",
    generalDesc: "Configure basic information, customize receipt design templates, and select layout color themes.",
    restaurantInfo: "Restaurant Information",
    restaurantName: "Restaurant Name",
    contactEmail: "Primary Contact Email",
    taxIdLabel: "Tax Identifier / VAT Number",
    businessAddress: "Physical Address",
    saveProfile: "Save Profile",
    globalThemeTitle: "Global Aesthetic Theme",
    customThemeConfig: "Custom Theme Configuration",
    customThemeDesc: "Design your own bespoke dashboard aesthetic",
    receiptOptionsTitle: "Invoice & Receipt Layout Options",
    showLogo: "Show Restaurant Logo",
    showLogoDesc: "Include brand logo mark",
    showTaxId: "Show Tax ID / VAT Number",
    showTaxIdDesc: "Include legal tax identifiers",
    showServer: "Show Server Name",
    showServerDesc: "Print name of assigned cashier",
    showTable: "Show Table Number",
    showTableDesc: "Display dining table IDs",
    showTimestamp: "Show Order Timestamp",
    showTimestampDesc: "Include date/time details",
    showFeedbackQr: "Show Feedback QR Code",
    showFeedbackQrDesc: "Link customers to web review",
    showSocial: "Show Social Handles",
    showSocialDesc: "Display digital links",
    includeServiceCharge: "Include Service Charge",
    includeServiceChargeDesc: "Add auto 10% gratuity line",
    showCustomFooter: "Show Custom Footer Message",
    showCustomFooterDesc: "Append custom text to ticket bottom",
    livePreview: "Live Preview",
    realtimeSync: "Real-time Sync",
    currentTable: "TABLE: T-14",
    serverLabel: "SERVER: JULIAN B.",
    orderLabel: "Order #2345",
    subtotal: "Subtotal",
    tax: "Tax",
    serviceCharge: "Service Charge (10%)",
    gratuity: "Gratuity (Suggested 20%)",
    grandTotal: "Grand Total",
    regionalSettings: "Regional & Currency Settings",
    languageSelect: "Dashboard Language",
    langEn: "English (US)",
    langJa: "日本語 (Japanese)",
    langZh: "中文（简体）",
    langKo: "한국어 (Korean)",
    digitalMenuPrefs: "Digital Menu Preferences & Exclusions",
    maxDisplayPrice: "Maximum Display Price",
    maxDisplayPriceDesc: "Items priced above this amount will be hidden from the customer-facing menu.",
    excludedFoodTags: "Excluded Food Tags",
    excludedFoodTagsDesc: "Hide menu items tagged with these categories (e.g. GF, Veg, Non-Veg, Seafood).",
    digitalMenuFeatures: "Digital Menu Features",
    enableAIConcierge: "Enable AI Concierge",
    enableAIConciergeDesc: "Allow customers to ask the AI concierge about menu recommendations and pairings.",
    enableSelfCheckout: "Enable Customer Self-Checkout",
    enableSelfCheckoutDesc: "Permit customers to place orders directly from their tables using self-checkout.",
    subAndBilling: "Subscription & Billing",
    subDesc: "Manage your enterprise plan, payment methods, and review upcoming invoices for seamless operations.",
    downloadStatements: "Download Statements",
    currentPlan: "Current Plan",
    planName: "Enterprise Growth",
    planBilling: "Billed Annually • Renews on Nov 15, 2026",
    activeTerminals: "Active Terminals",
    cloudStorage: "Cloud Storage",
    changePlan: "Change Plan",
    manageAddons: "Manage Addons",
    paymentMethod: "Payment Method",
    editBtn: "Edit",
    defaultMethod: "Default",
    addBackupMethod: "Add Backup Method",
    invoiceLedger: "Upcoming & Recent Invoices",
    dateCol: "Date",
    descCol: "Description",
    amountCol: "Amount",
    statusCol: "Status",
    actionCol: "Action",
    upcomingStatus: "Upcoming",
    paidStatus: "Paid",
    failedStatus: "Failed",
    menuWelcome: "Food Menu Editor",
    menuDesc: "Create, edit, categorize, and manage your restaurant's digital menu items and special recommendations.",
    avgProfit: "AVG. PROFIT MARGIN",
    totalItems: "TOTAL MENU ITEMS",
    specDishes: "SPECIAL DISHES",
    manageCats: "Manage Categories",
    addMenuItem: "Add Menu Item",
    editMenuItem: "Edit Menu Item",
    itemCol: "ITEM",
    categoryCol: "CATEGORY",
    costCol: "COST",
    priceCol: "PRICE",
    marginCol: "MARGIN",
    actionsCol: "ACTIONS",
    categoryManager: "Category Manager",
    addCategory: "Add Category",
    editCategory: "Edit Category",
    categoryName: "Category Name",
    categoryIcon: "Category Icon",
    activeCategories: "Active Categories",
    hardwareFleet: "Hardware Fleet",
    hardwareDesc: "Monitor your connected terminal fleet, printers, Expo screens, and open/test cash drawer integrations.",
    pairNewDevice: "Pair New Device",
    globalPreferences: "Global Preferences",
    autoReconnect: "Auto-Reconnect Devices",
    defaultGateway: "Default Network Gateway",
    btDiscovery: "Bluetooth Beacon Discovery",
    statusIndicators: "Active Status Alerts",
    testDrawerKick: "Test Drawer Kick",
    cashDrawers: "Cash Drawers",
    openOnCash: "Open automatically on Cash checkout",
    requireManager: "Require manager authorization code (PIN) for manual opening",
    staffDirectory: "Staff Directory",
    staffDesc: "Monitor employee statuses, track roster shifts, and review customer satisfaction ratings.",
    onShift: "ON SHIFT",
    offDuty: "OFF DUTY",
    overtime: "OVERTIME",
    weeklyRoster: "Weekly Shift Roster",
    securityConsole: "Security Console",
    securityDesc: "Modify role access controls, review system audit records, and set session timeout configurations.",
    timeoutLabel: "Session Idle Timeout (Minutes)",
    passcodeLabel: "Default Staff Passcode Length (Digits)",
    roleAccess: "Role Access Privileges",
    auditTrail: "System Audit Trail",
    taxBasisLabel: "Tax Calculation Basis",
    preTaxLabel: "Pre-tax (Exclusive)",
    postTaxLabel: "Post-tax (Inclusive)",
    taxBasisDesc: "Choose whether tax is calculated on top of subtotal (Pre-tax) or included in pricing (Post-tax).",
    subtotalInclusive: "Subtotal (Tax Incl.)",
    includedTax: "Included Tax (8%)",
    analyticsTitle: "Business Analytics",
    analyticsDesc: "Revenue, orders, staff performance and menu insights for your establishment.",
    analyticsRange: "Date Range",
    analyticsToday: "Today",
    analyticsWeek: "This Week",
    analyticsMonth: "This Month",
    analytics30: "Last 30 Days",
    analyticsRevenue: "Gross Revenue",
    analyticsOrders: "Total Orders",
    analyticsAvgCheck: "Avg. Check",
    analyticsCovers: "Covers Served",
    analyticsRevTrend: "Revenue Trend",
    analyticsOrderTypes: "Orders by Type",
    analyticsPeakHours: "Peak Hour Distribution",
    analyticsTopItems: "Top Menu Items by Revenue",
    analyticsStaffPerf: "Staff Performance",
    analyticsPayMethods: "Payment Method Breakdown",
    analyticsDineIn: "Dine-in",
    analyticsTakeaway: "Takeaway",
    analyticsDelivery: "Delivery",
    analyticsExport: "Export Report",
    timeBasedMenu: "Time-Based Menu Schedule",
    timeBasedMenuDesc: "Enable lunch and dinner menu service windows. When enabled, customer digital menu filters menu items dynamically according to the current local time.",
    lunchMenuTime: "Lunch Service Hours",
    dinnerMenuTime: "Dinner Service Hours",
    mealPeriodLabel: "Meal Period",
    lunchOnly: "Lunch Only",
    dinnerOnly: "Dinner Only",
    bothMeals: "Both (All Day)",
    timeBasedMenuInfoNote: "Items not assigned to a specific period (All Day) will appear during all service windows.",
    timeBasedMenuDisabledNote: "Note: When Time-Based Menu is disabled, all menu items are visible all day regardless of their meal period assignment.",
  },
  ja: {
    adminConsole: "管理コンソール",
    general: "一般設定",
    payments: "売上・請求",
    hardware: "周辺機器設定",
    staff: "従業員管理",
    security: "セキュリティ",
    menuEditor: "メニュー編集",
    saveChanges: "設定を保存",
    signOut: "サインアウト",
    searchPlaceholder: "パラメータを検索...",
    administrator: "管理者",
    generalTitle: "一般設定",
    generalDesc: "店舗の基本情報、レシート用デザインテンプレート、および画面表示テーマを設定します。",
    restaurantInfo: "店舗情報",
    restaurantName: "店舗名",
    contactEmail: "連絡先メールアドレス",
    taxIdLabel: "税金登録番号 / VAT",
    businessAddress: "店舗所在地",
    saveProfile: "店舗情報を保存",
    globalThemeTitle: "表示テーマ設定",
    customThemeConfig: "カスタムテーマ設定",
    customThemeDesc: "お好みのカラーでダッシュボードをカスタマイズします",
    receiptOptionsTitle: "レシート・請求書レイアウト設定",
    showLogo: "店舗ロゴを表示する",
    showLogoDesc: "レシート上部にロゴマークを印刷します",
    showTaxId: "税登録番号を表示する",
    showTaxIdDesc: "レシートに税登録番号（VAT）を含めます",
    showServer: "担当スタッフ名を表示する",
    showServerDesc: "レシートにレジ担当者名を印刷します",
    showTable: "テーブル番号を表示する",
    showTableDesc: "客席テーブルIDを表示します",
    showTimestamp: "注文日時を表示する",
    showTimestampDesc: "レシートに会計日時を含めます",
    showFeedbackQr: "評価用QRコードを表示する",
    showFeedbackQrDesc: "お客様評価ページへのQRコードを印刷します",
    showSocial: "SNSリンクを表示する",
    showSocialDesc: "公式SNSアカウントのリンクを表示します",
    includeServiceCharge: "サービス料を含める",
    includeServiceChargeDesc: "自動で10%のサービス料を加算します",
    showCustomFooter: "フッターメッセージを表示する",
    showCustomFooterDesc: "レシート下部に任意のテキストを追加します",
    livePreview: "リアルタイムプレビュー",
    realtimeSync: "同期中",
    currentTable: "テーブル: T-14",
    serverLabel: "担当: ジュリアン B.",
    orderLabel: "注文番号 #2345",
    subtotal: "小計",
    tax: "消費税",
    serviceCharge: "サービス料 (10%)",
    gratuity: "チップ (推奨20%)",
    grandTotal: "総合計",
    regionalSettings: "地域および通貨の設定",
    languageSelect: "表示言語",
    langEn: "English (US)",
    langJa: "日本語 (Japanese)",
    langZh: "中文（简体）",
    langKo: "한국어 (Korean)",
    digitalMenuPrefs: "デジタルメニューの表示・機能設定",
    maxDisplayPrice: "メニュー表示の最大価格",
    maxDisplayPriceDesc: "この設定金額を超えるメニュー項目は、顧客向けデジタルメニューには非表示になります。",
    excludedFoodTags: "非表示にするタグの選択",
    excludedFoodTagsDesc: "選択したタグが含まれるメニュー項目を顧客メニューから除外します。",
    digitalMenuFeatures: "デジタルメニュー of 機能制御",
    enableAIConcierge: "AIコンシェルジュ機能を有効にする",
    enableAIConciergeDesc: "お客様がメニューの推奨事項やペアリングについてAIに質問できるようにします。",
    enableSelfCheckout: "顧客セルフチェックアウトを有効にする",
    enableSelfCheckoutDesc: "お客様が自分の席からセルフチェックアウトで直接注文できるようにします。",
    subAndBilling: "購読と請求管理",
    subDesc: "現在のプラン、決済用クレジットカード、および請求書の履歴を管理します。",
    downloadStatements: "請求明細書のダウンロード",
    currentPlan: "現在のプラン",
    planName: "エンタープライズ・グロース",
    planBilling: "年間契約 • 次回更新日：2026年11月15日",
    activeTerminals: "接続端末数",
    cloudStorage: "クラウド容量",
    changePlan: "プランの変更",
    manageAddons: "アドオン管理",
    paymentMethod: "支払用カード情報",
    editBtn: "編集",
    defaultMethod: "メイン",
    addBackupMethod: "バックアップ用カードの追加",
    invoiceLedger: "請求明細書履歴",
    dateCol: "日付",
    descCol: "内容",
    amountCol: "金額",
    statusCol: "状態",
    actionCol: "操作",
    upcomingStatus: "支払予定",
    paidStatus: "支払済",
    failedStatus: "支払失敗",
    menuWelcome: "メニューエディタ",
    menuDesc: "デジタルメニューやおすすめ料理の追加、編集、削除、およびカテゴリーの管理を行います。",
    avgProfit: "平均利益率",
    totalItems: "メニュー総数",
    specDishes: "おすすめ料理数",
    manageCats: "カテゴリー管理",
    addMenuItem: "メニュー項目を追加",
    editMenuItem: "メニュー項目を編集",
    itemCol: "メニュー項目",
    categoryCol: "カテゴリー",
    costCol: "原価",
    priceCol: "価格",
    marginCol: "利益率",
    actionsCol: "操作",
    categoryManager: "カテゴリー管理",
    addCategory: "カテゴリーを追加",
    editCategory: "カテゴリーを編集",
    categoryName: "カテゴリー名",
    categoryIcon: "アイコン",
    activeCategories: "登録中のカテゴリー",
    hardwareFleet: "周辺機器管理",
    hardwareDesc: "接続されている決済端末、プリンター、キッチンディスプレイ（KDS）、およびキャッシュドロワーの設定を行います。",
    pairNewDevice: "新しい機器をペアリング",
    globalPreferences: "基本接続設定",
    autoReconnect: "デバイスの自動再接続",
    defaultGateway: "デフォルトネットワークゲートウェイ",
    btDiscovery: "Bluetoothビーコンの検出",
    statusIndicators: "デバイスのアラート警告",
    testDrawerKick: "テストドロワー開閉",
    cashDrawers: "キャッシュドロワー設定",
    openOnCash: "現金支払いの完了時に自動でドロワーを開く",
    requireManager: "手動開閉時にマネージャー承認PINコードを要求する",
    staffDirectory: "従業員名簿",
    staffDesc: "スタッフの勤務状況の確認、シフト表の作成、および顧客評価を確認します。",
    onShift: "シフト中",
    offDuty: "勤務外",
    overtime: "残業中",
    weeklyRoster: "週間シフト予定表",
    securityConsole: "セキュリティ設定",
    securityDesc: "役職ごとの操作権限、アクセスログの監視、およびタイムアウト時間を管理します。",
    timeoutLabel: "セッションの有効時間 (分)",
    passcodeLabel: "スタッフ暗証番号の桁数 (桁)",
    roleAccess: "権限管理 (役割ごと)",
    auditTrail: "システム監査アクセスログ",
    taxBasisLabel: "税金計算方法",
    preTaxLabel: "外税 (税抜)",
    postTaxLabel: "内税 (税込)",
    taxBasisDesc: "消費税を小計に追加加算する（外税）か、商品の販売価格に含める（内税）かを選択します。",
    subtotalInclusive: "小計 (税込)",
    includedTax: "内消費税 (8%)",
    analyticsTitle: "ビジネス分析",
    analyticsDesc: "売上・注文・スタッフパフォーマンスとメニューのインサイト。",
    analyticsRange: "期間",
    analyticsToday: "本日",
    analyticsWeek: "今週",
    analyticsMonth: "今月",
    analytics30: "過去30日",
    analyticsRevenue: "総売上",
    analyticsOrders: "総注文数",
    analyticsAvgCheck: "平均客単価",
    analyticsCovers: "来客数",
    analyticsRevTrend: "売上推移",
    analyticsOrderTypes: "注文タイプ別",
    analyticsPeakHours: "ピーク時間帯",
    analyticsTopItems: "売上上位メニュー",
    analyticsStaffPerf: "スタッフ別パフォーマンス",
    analyticsPayMethods: "決済方法の内訳",
    analyticsDineIn: "店内",
    analyticsTakeaway: "テイクアウト",
    analyticsDelivery: "デリバリー",
    analyticsExport: "レポート出力",
    timeBasedMenu: "時間帯別メニュー設定",
    timeBasedMenuDesc: "ランチおよびディナーの提供時間帯を設定します。有効にすると、デジタルメニューの表示内容が現在の時刻に合わせて自動的に切り替わります。",
    lunchMenuTime: "ランチ提供時間帯",
    dinnerMenuTime: "ディナー提供時間帯",
    mealPeriodLabel: "提供時間帯",
    lunchOnly: "ランチのみ",
    dinnerOnly: "ディナーのみ",
    bothMeals: "終日 (両方)",
    timeBasedMenuInfoNote: "提供時間帯が「終日」に指定されているメニューは、すべての時間帯で表示されます。",
    timeBasedMenuDisabledNote: "※時間帯別メニュー設定が無効の場合、提供時間帯の設定に関わらず、すべてのメニュー項目が終日表示されます。",
  },
  zh: {
    adminConsole: "管理控制台",
    general: "基本设置",
    payments: "收入与账单",
    hardware: "设备管理",
    staff: "员工管理",
    security: "安全设置",
    menuEditor: "菜单编辑",
    saveChanges: "保存设置",
    signOut: "退出登录",
    searchPlaceholder: "搜索设置...",
    administrator: "管理员",
    generalTitle: "基本设置",
    generalDesc: "配置餐厅信息、收据模板和界面主题。",
    restaurantInfo: "餐厅信息",
    restaurantName: "餐厅名称",
    contactEmail: "联系邮箱",
    taxIdLabel: "税号 / VAT",
    businessAddress: "营业地址",
    saveProfile: "保存资料",
    globalThemeTitle: "界面主题设置",
    customThemeConfig: "自定义主题配置",
    customThemeDesc: "用您喜欢的颜色定制仪表板",
    receiptOptionsTitle: "收据与账单布局设置",
    showLogo: "显示店铺标志",
    showLogoDesc: "在收据顶部打印徽标",
    showTaxId: "显示税号",
    showTaxIdDesc: "在收据中包含税号（VAT）",
    showServer: "显示服务员姓名",
    showServerDesc: "在收据上打印收银员姓名",
    showTable: "显示桌号",
    showTableDesc: "显示餐桌编号",
    showTimestamp: "显示订单时间",
    showTimestampDesc: "在收据中包含结账日期时间",
    showFeedbackQr: "显示评价二维码",
    showFeedbackQrDesc: "打印客户评价页面的二维码",
    showSocial: "显示社交媒体链接",
    showSocialDesc: "显示官方社交账号链接",
    includeServiceCharge: "包含服务费",
    includeServiceChargeDesc: "自动添加10%服务费",
    showCustomFooter: "显示自定义页脚",
    showCustomFooterDesc: "在收据底部添加自定义文字",
    livePreview: "实时预览",
    realtimeSync: "同步中",
    currentTable: "餐桌: T-14",
    serverLabel: "服务员: JULIAN B.",
    orderLabel: "订单 #2345",
    subtotal: "小计",
    tax: "税费",
    serviceCharge: "服务费 (10%)",
    gratuity: "小费 (建议20%)",
    grandTotal: "总计",
    regionalSettings: "地区与货币设置",
    languageSelect: "界面语言",
    langEn: "English (US)",
    langJa: "日本語 (Japanese)",
    langZh: "中文（简体）",
    langKo: "한국어 (Korean)",
    digitalMenuPrefs: "数字菜单偏好设置",
    maxDisplayPrice: "最高显示价格",
    maxDisplayPriceDesc: "价格超过此金额的菜品将在顾客菜单中隐藏。",
    excludedFoodTags: "排除的食品标签",
    excludedFoodTagsDesc: "在顾客菜单中隐藏带有这些标签的菜品。",
    digitalMenuFeatures: "数字菜单功能开关",
    enableAIConcierge: "启用AI礼宾服务",
    enableAIConciergeDesc: "允许顾客通过AI咨询菜品推荐和搭配建议。",
    enableSelfCheckout: "启用顾客自助结账",
    enableSelfCheckoutDesc: "允许顾客在餐桌上直接自助点单。",
    subAndBilling: "订阅与账单管理",
    subDesc: "管理企业套餐、支付方式和查看即将到期的账单。",
    downloadStatements: "下载账单明细",
    currentPlan: "当前套餐",
    planName: "企业成长版",
    planBilling: "按年计费 • 到期时间：2026年11月15日",
    activeTerminals: "在线终端数",
    cloudStorage: "云存储空间",
    changePlan: "更改套餐",
    manageAddons: "管理附加功能",
    paymentMethod: "支付方式",
    editBtn: "编辑",
    defaultMethod: "默认",
    addBackupMethod: "添加备用支付方式",
    invoiceLedger: "近期账单记录",
    dateCol: "日期",
    descCol: "说明",
    amountCol: "金额",
    statusCol: "状态",
    actionCol: "操作",
    upcomingStatus: "待付款",
    paidStatus: "已付款",
    failedStatus: "付款失败",
    menuWelcome: "菜单编辑器",
    menuDesc: "创建、编辑、分类和管理餐厅数字菜单。",
    avgProfit: "平均利润率",
    totalItems: "菜品总数",
    specDishes: "特色菜品",
    manageCats: "管理分类",
    addMenuItem: "添加菜品",
    editMenuItem: "编辑菜品",
    itemCol: "菜品",
    categoryCol: "分类",
    costCol: "成本",
    priceCol: "售价",
    marginCol: "利润率",
    actionsCol: "操作",
    categoryManager: "分类管理",
    addCategory: "添加分类",
    editCategory: "编辑分类",
    categoryName: "分类名称",
    categoryIcon: "分类图标",
    activeCategories: "已启用分类",
    hardwareFleet: "硬件设备",
    hardwareDesc: "监控连接的终端设备、打印机、展示屏及收银抽屉。",
    pairNewDevice: "配对新设备",
    globalPreferences: "全局偏好设置",
    autoReconnect: "自动重新连接设备",
    defaultGateway: "默认网关",
    btDiscovery: "蓝牙信标发现",
    statusIndicators: "状态告警",
    testDrawerKick: "测试收银抽屉",
    cashDrawers: "收银抽屉",
    openOnCash: "现金结账时自动打开",
    requireManager: "手动开启需要管理员PIN授权",
    staffDirectory: "员工目录",
    staffDesc: "监控员工状态、排班情况和客户满意度评分。",
    onShift: "在班",
    offDuty: "休息",
    overtime: "加班",
    weeklyRoster: "每周排班表",
    securityConsole: "安全控制台",
    securityDesc: "修改权限控制、查看系统审计记录及设置会话超时。",
    timeoutLabel: "会话空闲超时（分钟）",
    passcodeLabel: "默认员工密码长度（位数）",
    roleAccess: "角色访问权限",
    auditTrail: "系统审计日志",
    taxBasisLabel: "税金计算方式",
    preTaxLabel: "税前（不含税）",
    postTaxLabel: "税后（含税）",
    taxBasisDesc: "选择税金是在小计之外加收（税前）还是已包含在价格中（税后）。",
    subtotalInclusive: "小计（含税）",
    includedTax: "含税额 (8%)",
    analyticsTitle: "业务分析",
    analyticsDesc: "餐厅的收入、订单、员工绩效和菜单洞察。",
    analyticsRange: "日期范围",
    analyticsToday: "今天",
    analyticsWeek: "本周",
    analyticsMonth: "本月",
    analytics30: "过去30天",
    analyticsRevenue: "总收入",
    analyticsOrders: "总订单数",
    analyticsAvgCheck: "平均消费",
    analyticsCovers: "接待人数",
    analyticsRevTrend: "收入趋势",
    analyticsOrderTypes: "订单类型",
    analyticsPeakHours: "高峰时段分布",
    analyticsTopItems: "热销菜品",
    analyticsStaffPerf: "员工绩效",
    analyticsPayMethods: "支付方式分布",
    analyticsDineIn: "堂食",
    analyticsTakeaway: "外带",
    analyticsDelivery: "外卖",
    analyticsExport: "导出报告",
    timeBasedMenu: "分时段菜单设置",
    timeBasedMenuDesc: "启用午餐和晚餐菜单服务时段。启用后，顾客数字菜单将根据当前本地时间动态过滤菜单项。",
    lunchMenuTime: "午餐服务时间",
    dinnerMenuTime: "晚餐服务时间",
    mealPeriodLabel: "适用时段",
    lunchOnly: "仅限午餐",
    dinnerOnly: "仅限晚餐",
    bothMeals: "全天（两者皆可）",
    timeBasedMenuInfoNote: "提供时段为“全天”的菜品将在所有服务时段显示。",
    timeBasedMenuDisabledNote: "注：分时段菜单关闭时，所有菜单项将全天显示，不受适用时段设置的影响。",
  },
  ko: {
    adminConsole: "관리 콘솔",
    general: "일반 설정",
    payments: "매출 및 청구",
    hardware: "하드웨어 설정",
    staff: "직원 관리",
    security: "보안 설정",
    menuEditor: "메뉴 편집",
    saveChanges: "설정 저장",
    signOut: "로그아웃",
    searchPlaceholder: "설정 검색...",
    administrator: "관리자",
    generalTitle: "일반 설정",
    generalDesc: "레스토랑 정보, 영수증 템플릿 및 화면 테마를 구성합니다.",
    restaurantInfo: "레스토랑 정보",
    restaurantName: "레스토랑 이름",
    contactEmail: "연락처 이메일",
    taxIdLabel: "사업자 번호 / VAT",
    businessAddress: "사업장 주소",
    saveProfile: "정보 저장",
    globalThemeTitle: "테마 설정",
    customThemeConfig: "커스텀 테마 구성",
    customThemeDesc: "원하는 색상으로 대시보드를 커스터마이즈하세요",
    receiptOptionsTitle: "영수증 및 청구서 레이아웃 설정",
    showLogo: "매장 로고 표시",
    showLogoDesc: "영수증 상단에 로고를 인쇄합니다",
    showTaxId: "사업자 번호 표시",
    showTaxIdDesc: "영수증에 사업자 번호(VAT)를 포함합니다",
    showServer: "담당 직원 이름 표시",
    showServerDesc: "영수증에 계산원 이름을 인쇄합니다",
    showTable: "테이블 번호 표시",
    showTableDesc: "테이블 ID를 표시합니다",
    showTimestamp: "주문 일시 표시",
    showTimestampDesc: "영수증에 결제 날짜와 시간을 포함합니다",
    showFeedbackQr: "고객 평가 QR 표시",
    showFeedbackQrDesc: "고객 평가 페이지의 QR 코드를 인쇄합니다",
    showSocial: "SNS 링크 표시",
    showSocialDesc: "공식 SNS 계정 링크를 표시합니다",
    includeServiceCharge: "서비스 요금 포함",
    includeServiceChargeDesc: "자동으로 10% 서비스 요금을 추가합니다",
    showCustomFooter: "사용자 지정 푸터 메시지 표시",
    showCustomFooterDesc: "영수증 하단에 사용자 지정 텍스트를 추가합니다",
    livePreview: "실시간 미리보기",
    realtimeSync: "동기화 중",
    currentTable: "테이블: T-14",
    serverLabel: "담당: JULIAN B.",
    orderLabel: "주문 #2345",
    subtotal: "소계",
    tax: "세금",
    serviceCharge: "서비스 요금 (10%)",
    gratuity: "팁 (권장 20%)",
    grandTotal: "합계",
    regionalSettings: "지역 및 통화 설정",
    languageSelect: "대시보드 언어",
    langEn: "English (US)",
    langJa: "日本語 (Japanese)",
    langZh: "中文（简体）",
    langKo: "한국어 (Korean)",
    digitalMenuPrefs: "디지털 메뉴 환경설정",
    maxDisplayPrice: "최대 표시 가격",
    maxDisplayPriceDesc: "이 금액을 초과하는 메뉴 항목은 고객용 메뉴에서 숨겨집니다.",
    excludedFoodTags: "제외할 음식 태그",
    excludedFoodTagsDesc: "이 태그가 포함된 메뉴 항목을 고객 메뉴에서 숨깁니다.",
    digitalMenuFeatures: "디지털 메뉴 기능 설정",
    enableAIConcierge: "AI 컨시어지 활성화",
    enableAIConciergeDesc: "고객이 AI에게 메뉴 추천 및 페어링에 대해 질문할 수 있도록 합니다.",
    enableSelfCheckout: "고객 셀프 체크아웃 활성화",
    enableSelfCheckoutDesc: "고객이 테이블에서 직접 셀프 체크아웃으로 주문할 수 있도록 합니다.",
    subAndBilling: "구독 및 청구 관리",
    subDesc: "현재 플랜, 결제 방법 및 청구서 내역을 관리합니다.",
    downloadStatements: "청구서 명세서 다운로드",
    currentPlan: "현재 플랜",
    planName: "엔터프라이즈 성장 플랜",
    planBilling: "연간 결제 • 갱신일: 2026년 11월 15일",
    activeTerminals: "활성 단말기",
    cloudStorage: "클라우드 저장소",
    changePlan: "플랜 변경",
    manageAddons: "부가 기능 관리",
    paymentMethod: "결제 방법",
    editBtn: "편집",
    defaultMethod: "기본",
    addBackupMethod: "백업 결제 방법 추가",
    invoiceLedger: "청구서 내역",
    dateCol: "날짜",
    descCol: "설명",
    amountCol: "금액",
    statusCol: "상태",
    actionCol: "작업",
    upcomingStatus: "예정",
    paidStatus: "결제 완료",
    failedStatus: "결제 실패",
    menuWelcome: "메뉴 편집기",
    menuDesc: "디지털 메뉴 항목을 생성, 편집, 분류 및 관리합니다.",
    avgProfit: "평균 이익률",
    totalItems: "전체 메뉴 수",
    specDishes: "특선 요리",
    manageCats: "카테고리 관리",
    addMenuItem: "메뉴 항목 추가",
    editMenuItem: "메뉴 항목 편집",
    itemCol: "메뉴 항목",
    categoryCol: "카테고리",
    costCol: "원가",
    priceCol: "판매가",
    marginCol: "마진",
    actionsCol: "작업",
    categoryManager: "카테고리 관리자",
    addCategory: "카테고리 추가",
    editCategory: "카테고리 편집",
    categoryName: "카테고리 이름",
    categoryIcon: "카테고리 아이콘",
    activeCategories: "활성 카테고리",
    hardwareFleet: "하드웨어 기기",
    hardwareDesc: "연결된 단말기, 프린터, 전시 화면 및 계산기 서랍을 모니터링합니다.",
    pairNewDevice: "새 기기 페어링",
    globalPreferences: "전역 환경설정",
    autoReconnect: "기기 자동 재연결",
    defaultGateway: "기본 네트워크 게이트웨이",
    btDiscovery: "블루투스 비콘 검색",
    statusIndicators: "상태 알림",
    testDrawerKick: "계산기 서랍 테스트",
    cashDrawers: "계산기 서랍",
    openOnCash: "현금 결제 시 자동 열기",
    requireManager: "수동 개방 시 관리자 PIN 인증 필요",
    staffDirectory: "직원 목록",
    staffDesc: "직원 상태, 교대 일정 및 고객 만족도를 모니터링합니다.",
    onShift: "근무 중",
    offDuty: "휴무",
    overtime: "초과 근무",
    weeklyRoster: "주간 근무 일정",
    securityConsole: "보안 콘솔",
    securityDesc: "역할 접근 권한 수정, 시스템 감사 기록 검토 및 세션 타임아웃 설정.",
    timeoutLabel: "세션 유휴 타임아웃 (분)",
    passcodeLabel: "기본 직원 비밀번호 길이 (자리)",
    roleAccess: "역할별 접근 권한",
    auditTrail: "시스템 감사 로그",
    taxBasisLabel: "세금 계산 방식",
    preTaxLabel: "세전 (외세)",
    postTaxLabel: "세후 (내세)",
    taxBasisDesc: "세금을 소계에 추가 적용할지(세전) 가격에 포함할지(세후) 선택합니다.",
    subtotalInclusive: "소계 (세금 포함)",
    includedTax: "포함 세금 (8%)",
    analyticsTitle: "비즈니스 분석",
    analyticsDesc: "매출, 주문, 직원 성과 및 메뉴 인사이트.",
    analyticsRange: "기간",
    analyticsToday: "오늘",
    analyticsWeek: "이번 주",
    analyticsMonth: "이번 달",
    analytics30: "최근 30일",
    analyticsRevenue: "총 매출",
    analyticsOrders: "총 주문 수",
    analyticsAvgCheck: "평균 결제액",
    analyticsCovers: "방문 고객 수",
    analyticsRevTrend: "매출 추이",
    analyticsOrderTypes: "주문 유형별",
    analyticsPeakHours: "피크 시간대",
    analyticsTopItems: "인기 메뉴",
    analyticsStaffPerf: "직원별 성과",
    analyticsPayMethods: "결제 수단 현황",
    analyticsDineIn: "매장",
    analyticsTakeaway: "포장",
    analyticsDelivery: "배달",
    analyticsExport: "보고서 내보내기",
    timeBasedMenu: "시간대별 메뉴 설정",
    timeBasedMenuDesc: "점심 및 저녁 메뉴 서비스 시간대를 설정합니다. 활성화하면 고객용 디지털 메뉴가 현재 현지 시간에 따라 메뉴 항목을 동적으로 필터링합니다.",
    lunchMenuTime: "점심 서비스 시간",
    dinnerMenuTime: "저녁 서비스 시간",
    mealPeriodLabel: "제공 시간대",
    lunchOnly: "점심 전용",
    dinnerOnly: "저녁 전용",
    bothMeals: "종일 (모두)",
    timeBasedMenuInfoNote: "제공 시간대가 '종일'로 설정된 메뉴는 모든 시간대에 표시됩니다.",
    timeBasedMenuDisabledNote: "참고: 시간대별 메뉴 설정이 비활성화된 경우, 지정된 시간대와 관계없이 모든 메뉴 항목이 종일 표시됩니다.",
  }
};

export default function DashboardPage() {
  // Localization States
  const [language, setLanguage] = useState<'en' | 'ja' | 'zh' | 'ko'>('en');
  const [currency, setCurrency] = useState<'USD' | 'JPY' | 'EUR' | 'GBP' | 'CNY' | 'KRW'>('USD');
  const [taxType, setTaxType] = useState<'pre-tax' | 'post-tax'>('pre-tax');

  // Sidebar tab selection state - defaults to operations (Operations Console) matching target mockup
  const [activeTab, setActiveTab] = useState<'general' | 'operations' | 'receipts' | 'invoices' | 'payments' | 'hardware' | 'staff' | 'security' | 'menu' | 'analytics'>('general');
  const [analyticsRange, setAnalyticsRange] = useState<'today' | 'week' | 'month' | '30days'>('week');
  const [dashAuditSearch, setDashAuditSearch] = useState('');
  const [dashAuditPage, setDashAuditPage] = useState(1);

  // Staff Directory States
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState<'all' | 'foh' | 'kitchen'>('all');
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [timelineTab, setTimelineTab] = useState<'timeline' | 'month'>('timeline');
  const [staffMembers, setStaffMembers] = useState([
    {
      id: 'EMP-010',
      name: 'Elena Rodriguez',
      role: 'Head Sommelier',
      status: 'ON_SHIFT',
      performance: 4.8,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop'
    },
    {
      id: 'EMP-014',
      name: 'Marcus Chen',
      role: 'Executive Sous Chef',
      status: 'OFF_DUTY',
      performance: 4.8,
      avatar: ''
    },
    {
      id: 'EMP-048',
      name: 'Sarah Jenkins',
      role: "Maitre D'",
      status: 'OVERTIME',
      performance: 5.0,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop'
    }
  ]);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: 'Server',
    status: 'OFF_DUTY',
    performance: 5.0
  });

  // Hardware Fleet States
  const [showPairDeviceModal, setShowPairDeviceModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    type: 'POS',
    name: '',
    ipAddress: '',
    status: 'ONLINE',
    details: ''
  });
  const [devicesList, setDevicesList] = useState([
    {
      id: 'DEV-001',
      type: 'POS',
      name: 'Terminal 01',
      subtitle: "Maitre D' Stand",
      ipAddress: '192.168.1.101',
      battery: '95%',
      uptime: '14d 2h',
      status: 'ONLINE',
      details: ''
    },
    {
      id: 'DEV-002',
      type: 'POS',
      name: 'Terminal 02',
      subtitle: 'Bar Left',
      ipAddress: '192.168.1.102',
      battery: '100% (Wired)',
      uptime: '6d 12h',
      status: 'ONLINE',
      details: ''
    },
    {
      id: 'DEV-003',
      type: 'PRINTER',
      name: 'Kitchen Hot',
      subtitle: 'Ethernet Impact',
      status: 'ONLINE',
      details: 'Routing: Grill, Sauté, Expo'
    },
    {
      id: 'DEV-004',
      type: 'PRINTER',
      name: 'Bar Receipt',
      subtitle: 'BT-80mm Thermal',
      status: 'WARNING_LOW_PAPER',
      details: 'Warning: Low Paper'
    },
    {
      id: 'DEV-005',
      type: 'KDS',
      name: 'Expo Screen 1',
      ipAddress: '192.168.1.201',
      status: 'ONLINE',
      details: 'Syncing: Real-time'
    }
  ]);

  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 'ALERT-001',
      title: 'Bar Printer (BT-80mm)',
      text: 'Low paper warning. Estimated 10 receipts remaining.',
      time: '2m ago',
      type: 'warning'
    },
    {
      id: 'ALERT-002',
      title: 'Main Dining Router',
      text: 'Firmware update available (v2.4.1).',
      time: '1h ago',
      type: 'info',
      updateBtn: true
    }
  ]);

  // Hardware Global Settings States
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [defaultGateway, setDefaultGateway] = useState('192.168.1.1');
  const [bluetoothDiscovery, setBluetoothDiscovery] = useState(false);

  // Payments Configuration States
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(true);
  const [cashEnabled, setCashEnabled] = useState(true);

  // Stripe Account Linking States
  const [activeAdminEmail, setActiveAdminEmail] = useState('admin@dinepos.ai');
  const [stripeAccountIdInput, setStripeAccountIdInput] = useState('');
  const [linkedStripeAccount, setLinkedStripeAccount] = useState<string | null>(null);

  const linkStripeAccount = () => {
    if (!stripeAccountIdInput.trim()) {
      triggerToast('Please enter a valid Stripe Account ID.', 'info');
      return;
    }
    const connectionsStr = localStorage.getItem('dinepos_stripe_connections');
    let connections: Record<string, { stripeAccountId: string; linkedAt: string }> = {};
    if (connectionsStr) {
      try {
        connections = JSON.parse(connectionsStr);
      } catch (e) {
        console.error(e);
      }
    }
    connections[activeAdminEmail] = {
      stripeAccountId: stripeAccountIdInput.trim(),
      linkedAt: new Date().toISOString()
    };
    localStorage.setItem('dinepos_stripe_connections', JSON.stringify(connections));
    setLinkedStripeAccount(stripeAccountIdInput.trim());
    triggerToast(`Successfully linked Stripe account ${stripeAccountIdInput.trim()}`, 'success');
  };

  const disconnectStripeAccount = () => {
    const connectionsStr = localStorage.getItem('dinepos_stripe_connections');
    let connections: Record<string, { stripeAccountId: string; linkedAt: string }> = {};
    if (connectionsStr) {
      try {
        connections = JSON.parse(connectionsStr);
      } catch (e) {
        console.error(e);
      }
    }
    delete connections[activeAdminEmail];
    localStorage.setItem('dinepos_stripe_connections', JSON.stringify(connections));
    setLinkedStripeAccount(null);
    setStripeAccountIdInput('');
    triggerToast('Stripe account disconnected.', 'info');
  };

  // KDS Configuration States (preserved for KDS tab)
  const [currentStation, setCurrentStation] = useState('Grill & Sauté');
  const [relaxedThreshold, setRelaxedThreshold] = useState(10);
  const [warningThreshold, setWarningThreshold] = useState(15);
  const [urgentThreshold, setUrgentThreshold] = useState(20);
  const [ticketDensity, setTicketDensity] = useState<'compact' | 'standard' | 'relaxed'>('standard');
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [gridColumns, setGridColumns] = useState(4);
  const [autoHideOrders, setAutoHideOrders] = useState(true);
  const [showVipProminently, setShowVipProminently] = useState(true);
  const [courseBasedFiring, setCourseBasedFiring] = useState(false);
  const [autoPrintOnFire, setAutoPrintOnFire] = useState(false);
  const [alertChime, setAlertChime] = useState('Boutique Bell');
  const [alertVolume, setAlertVolume] = useState(85);
  const [audibleAlertsEnabled, setAudibleAlertsEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [pairedStar, setPairedStar] = useState(false);
  const [pairedEpson, setPairedEpson] = useState(false);

  // Receipt Configuration States (linked to live preview)
  const [establishmentName, setEstablishmentName] = useState('The Midnight Lounge');
  const [businessAddress, setBusinessAddress] = useState('101 Executive Blvd, Suite 400, Metro City');
  const [contactEmail, setContactEmail] = useState('admin@midnightlounge.com');

  // Routing Toggles States
  const [endOfDaySummary, setEndOfDaySummary] = useState(true);
  const [criticalVoidAlerts, setCriticalVoidAlerts] = useState(true);
  const [itemBroadcast86, setItemBroadcast86] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [showTableNumber, setShowTableNumber] = useState(true);
  const [showServerName, setShowServerName] = useState(true);
  const [showOrderTimestamp, setShowOrderTimestamp] = useState(true);
  const [taxId, setTaxId] = useState('GB123456789');
  const [taxRateDineIn, setTaxRateDineIn] = useState(10.0);
  const [taxRateTakeaway, setTaxRateTakeaway] = useState(8.0);
  const [taxRateDelivery, setTaxRateDelivery] = useState(8.0);
  const [showServiceCharge, setShowServiceCharge] = useState(true);
  const [thankYouMessage, setThankYouMessage] = useState('Thank you for dining with us at DinePosAi! We hope to see you again soon.');
  const [showQrCode, setShowQrCode] = useState(true);
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const [showCustomFooter, setShowCustomFooter] = useState(false);
  const [globalAesthetic, setGlobalAesthetic] = useState('Midnight Black');
  const [customBg, setCustomBg] = useState('#0e0e0d');
  const [customCardBg, setCustomCardBg] = useState('#161513');
  const [customAccent, setCustomAccent] = useState('#ffe2ab');
  const [customText, setCustomText] = useState('#e5e2e1');
  const [customTextMuted, setCustomTextMuted] = useState('#a69984');

  // Digital Menu settings and feature toggles state
  const [digitalMenuConfig, setDigitalMenuConfig] = useState({
    maxPrice: 40,
    excludedTags: ['Seafood'],
    showAIConcierge: true,
    enableSelfCheckout: true,
    customerTableNumber: 12,
    enableTimeBasedMenu: false,
    lunchStart: '11:00',
    lunchEnd: '15:00',
    dinnerStart: '18:00',
    dinnerEnd: '23:00'
  });

  // Load custom theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBg = localStorage.getItem('dinepos_custom_bg');
      const savedCardBg = localStorage.getItem('dinepos_custom_card_bg');
      const savedAccent = localStorage.getItem('dinepos_custom_accent');
      const savedText = localStorage.getItem('dinepos_custom_text');
      const savedTextMuted = localStorage.getItem('dinepos_custom_text_muted');
      const savedAesthetic = localStorage.getItem('dinepos_global_aesthetic');
      const savedLang = localStorage.getItem('dinepos_language');
      const savedTaxType = localStorage.getItem('dinepos_tax_type');
      const savedExclusions = localStorage.getItem('dinepos_exclusions_config');
      const savedTaxRateDineIn = localStorage.getItem('dinepos_tax_rate_dine_in');
      const savedTaxRateTakeaway = localStorage.getItem('dinepos_tax_rate_takeaway');
      const savedTaxRateDelivery = localStorage.getItem('dinepos_tax_rate_delivery');

      if (savedBg) setCustomBg(savedBg);
      if (savedCardBg) setCustomCardBg(savedCardBg);
      if (savedAccent) setCustomAccent(savedAccent);
      if (savedText) setCustomText(savedText);
      if (savedTextMuted) setCustomTextMuted(savedTextMuted);
      if (savedAesthetic) setGlobalAesthetic(savedAesthetic);
      if (['en', 'ja', 'zh', 'ko'].includes(savedLang || '')) setLanguage(savedLang as 'en' | 'ja' | 'zh' | 'ko');
      const savedCurrency = localStorage.getItem('dinepos_currency');
      if (['USD', 'JPY', 'EUR', 'GBP', 'CNY', 'KRW'].includes(savedCurrency || '')) setCurrency(savedCurrency as 'USD' | 'JPY' | 'EUR' | 'GBP' | 'CNY' | 'KRW');
      if (savedTaxType === 'pre-tax' || savedTaxType === 'post-tax') {
        setTaxType(savedTaxType as 'pre-tax' | 'post-tax');
      }
      if (savedTaxRateDineIn) setTaxRateDineIn(parseFloat(savedTaxRateDineIn));
      if (savedTaxRateTakeaway) setTaxRateTakeaway(parseFloat(savedTaxRateTakeaway));
      if (savedTaxRateDelivery) setTaxRateDelivery(parseFloat(savedTaxRateDelivery));
      if (savedExclusions) {
        try {
          const parsed = JSON.parse(savedExclusions);
          setDigitalMenuConfig(prev => ({
            ...prev,
            ...parsed
          }));
        } catch (e) {
          console.error('Failed to parse exclusions config:', e);
        }
      }

      // Load active admin info and Stripe connection
      const activeEmail = localStorage.getItem('dinepos_logged_in_email') || 'admin@dinepos.ai';
      setActiveAdminEmail(activeEmail);
      
      const connectionsStr = localStorage.getItem('dinepos_stripe_connections');
      let connections: Record<string, { stripeAccountId: string; linkedAt: string }> = {};
      if (connectionsStr) {
        try {
          connections = JSON.parse(connectionsStr);
        } catch (e) {
          console.error(e);
        }
      }

      // Pre-link default admin account for out-of-the-box functionality
      if (!connections['admin@dinepos.ai']) {
        connections['admin@dinepos.ai'] = {
          stripeAccountId: 'acct_1x9u82HfdK72',
          linkedAt: new Date().toISOString()
        };
        localStorage.setItem('dinepos_stripe_connections', JSON.stringify(connections));
      }

      if (connections[activeEmail]) {
        setLinkedStripeAccount(connections[activeEmail].stripeAccountId);
        setStripeAccountIdInput(connections[activeEmail].stripeAccountId);
      } else {
        setLinkedStripeAccount(null);
        setStripeAccountIdInput('');
      }
    }
  }, []);

  const updateDigitalMenuConfig = (newConfig: Partial<typeof digitalMenuConfig>) => {
    const updated = { ...digitalMenuConfig, ...newConfig };
    setDigitalMenuConfig(updated);
    localStorage.setItem('dinepos_exclusions_config', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'dinepos_exclusions_config',
        newValue: JSON.stringify(updated)
      }));
    }
  };

  const handleGlobalAestheticChange = (aesthetic: string) => {
    setGlobalAesthetic(aesthetic);
    localStorage.setItem('dinepos_global_aesthetic', aesthetic);
  };

  const updateCustomBg = (val: string) => {
    setCustomBg(val);
    localStorage.setItem('dinepos_custom_bg', val);
  };
  const updateCustomCardBg = (val: string) => {
    setCustomCardBg(val);
    localStorage.setItem('dinepos_custom_card_bg', val);
  };
  const updateCustomAccent = (val: string) => {
    setCustomAccent(val);
    localStorage.setItem('dinepos_custom_accent', val);
  };
  const updateCustomText = (val: string) => {
    setCustomText(val);
    localStorage.setItem('dinepos_custom_text', val);
  };
  const updateCustomTextMuted = (val: string) => {
    setCustomTextMuted(val);
    localStorage.setItem('dinepos_custom_text_muted', val);
  };
  const [showTaxId, setShowTaxId] = useState(true);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Roster Shift Management States
  const [editingShift, setEditingShift] = useState<{ employee: string; day: string } | null>(null);
  const [rosterShifts, setRosterShifts] = useState<Record<string, Record<string, string>>>({
    'Marco R.': { 'MON 13': '09:00 - 17:00', 'TUE 14': '09:00 - 17:00', 'WED 15': '09:00 - 22:00', 'THU 16': 'OFF', 'FRI 17': '10:00 - 18:00', 'SAT 18': '10:00 - 18:00', 'SUN 19': '10:00 - 18:00' },
    'Sarah J.': { 'MON 13': 'OFF', 'TUE 14': '14:00 - 22:00', 'WED 15': '14:00 - 22:00', 'THU 16': '14:00 - 22:00', 'FRI 17': '14:00 - 22:00', 'SAT 18': '14:00 - 22:00', 'SUN 19': 'OFF' }
  });

  // Interactive Router Update & Test Printing states
  const [routerUpdateProgress, setRouterUpdateProgress] = useState<number | null>(null);
  const [printingDevices, setPrintingDevices] = useState<Record<string, boolean>>({});

  // Security Panel States
  const [sessionTimeout, setSessionTimeout] = useState('15');
  const [passcodeLength, setPasscodeLength] = useState('4');
  const [securityPermissions, setSecurityPermissions] = useState<Record<string, Record<string, boolean>>>({
    'Manager': { 'refundOrders': true, 'compDishes': true, 'reopenDays': true, 'editMenu': true, 'voidItems': true },
    'Server': { 'refundOrders': false, 'compDishes': false, 'reopenDays': false, 'editMenu': false, 'voidItems': true },
    'Bartender': { 'refundOrders': false, 'compDishes': true, 'reopenDays': false, 'editMenu': false, 'voidItems': true },
    'Cook': { 'refundOrders': false, 'compDishes': false, 'reopenDays': false, 'editMenu': false, 'voidItems': false },
  });
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, time: '10m ago', actor: 'Sarah Jenkins (Maitre D\')', action: 'Authorized $42.00 check void', type: 'warning' },
    { id: 2, time: '42m ago', actor: 'Elena Rodriguez (Sommelier)', action: 'Re-routed drink queue to Service Bar Printer', type: 'info' },
    { id: 3, time: '1h 15m ago', actor: 'System Auto-Daemon', action: 'Created night audit backup (db_dump_0603.sql)', type: 'success' },
    { id: 4, time: '3h ago', actor: 'Admin', action: 'Modified Stripe API keys', type: 'security' },
  ]);

  // Toast alert feedback states
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Cash Drawer Configuration States
  const [openOnCash, setOpenOnCash] = useState(true);
  const [requireManagerPin, setRequireManagerPin] = useState(false);

  // Menu Management States
  const [menuItemsList, setMenuItemsList] = useState<any[]>([]);
  const [showMenuAddEditModal, setShowMenuAddEditModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<any | null>(null);

  // Menu Editor Form States
  const [menuFormName, setMenuFormName] = useState('');
  const [menuFormCategory, setMenuFormCategory] = useState<string>('starters');
  const [menuFormPrice, setMenuFormPrice] = useState(0);
  const [menuFormCost, setMenuFormCost] = useState(0);
  const [menuFormDescription, setMenuFormDescription] = useState('');
  const [menuFormImage, setMenuFormImage] = useState('/images/wagyu_beef_tartare.png');
  const [menuFormTags, setMenuFormTags] = useState<string[]>([]);
  const [menuFormMealPeriod, setMenuFormMealPeriod] = useState<'lunch' | 'dinner' | 'both'>('both');

  // Category Manager States
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryManagerModal, setShowCategoryManagerModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryFormName, setCategoryFormName] = useState('');
  const [categoryFormIcon, setCategoryFormIcon] = useState('restaurant');

  // Drag and Drop States
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    const defaultMenuItems = [
      { id: 'spec-1', name: 'Gold Leaf A5 Wagyu Ribeye', category: 'special', price: 185, cost: 65, description: '300g Japanese A5 Miyazaki Wagyu, seared over binchotan charcoal, brushed with truffle glaze, adorned with 24k gold leaf.', image: '/images/wagyu_ribeye.png', tags: ['GF', 'Non-Veg'] },
      { id: 'spec-2', name: 'Beluga Caviar & Oysters', category: 'special', price: 95, cost: 35, description: 'Six freshly shucked Kumamoto oysters topped with Beluga caviar, champagne mignonette, and gold flakes.', image: '/images/caviar_oysters.png', tags: ['Seafood', 'Non-Veg'] },
      { id: 'combo-1', name: 'Imperial Signature Combo', category: 'combos', price: 120, cost: 40, description: 'A luxurious set featuring our Wagyu Beef Tartare starter, Truffle Glazed Filet Mignon main course, and Chocolate Soufflé dessert.', image: '/images/wagyu_ribeye.png', tags: ['Non-Veg'] },
      { id: 'combo-2', name: 'Royal Vegetarian Tasting Set', category: 'combos', price: 75, cost: 20, description: 'A curated vegetarian experience: Truffle Burrata Salad starter, Acquerello Mushroom Risotto main, and Saffron Crème Brûlée.', image: '/images/mushroom_risotto.png', tags: ['Veg', 'GF'] },
      { id: 'start-1', name: 'Wagyu Beef Tartare', category: 'starters', price: 38, cost: 12, description: 'Hand-cut A5 Wagyu, quail egg yolk, cornichons, shallots, Dijon emulsion, served with toasted brioche points.', image: '/images/wagyu_beef_tartare.png', tags: ['Non-Veg'] },
      { id: 'start-2', name: 'Truffle Burrata Salad', category: 'starters', price: 26, cost: 7, description: 'Creamy Italian burrata, heirloom cherry tomatoes, fresh basil, aged balsamic, shaved black winter truffle.', image: '/images/truffle_burrata_salad.png', tags: ['Veg', 'GF'] },
      { id: 'start-3', name: 'Pan-Seared Jumbo Scallops', category: 'starters', price: 42, cost: 14, description: 'Pan-seared jumbo scallops, sweet pea purée, crispy pancetta, meyer lemon beurre blanc.', image: '/images/pan_seared_scallops.png', tags: ['Seafood', 'Non-Veg'] },
      { id: 'main-1', name: 'Acquerello Mushroom Risotto', category: 'mains', price: 32, cost: 9, description: 'Acquerello carnaroli rice, foraged forest mushrooms, Parmigiano-Reggiano, fresh black truffle shavings.', image: '/images/mushroom_risotto.png', tags: ['Veg', 'GF'] },
      { id: 'main-2', name: 'Crispy Skin Sea Bass', category: 'mains', price: 45, cost: 15, description: 'Crispy skin Chilean sea bass served over creamy saffron risotto, topped with microgreens and citrus beurre blanc.', image: '/images/sea_bass.png', tags: ['Seafood', 'Non-Veg'] },
      { id: 'main-3', name: 'Truffle Glazed Filet Mignon', category: 'mains', price: 58, cost: 18, description: '8oz USDA Prime tenderloin, truffle potato purée, glazed organic heirloom carrots, rich bone marrow reduction.', image: '/images/filet_mignon.png', tags: ['GF', 'Non-Veg'] },
      { id: 'dess-1', name: 'Chocolate Soufflé', category: 'desserts', price: 18, cost: 5, description: '70% Valrhona dark chocolate soufflé, Tahitian vanilla bean gelato, warm salted caramel drizzle poured tableside.', image: '/images/chocolate_souffle.png', tags: ['Veg'] },
      { id: 'dess-2', name: 'Saffron Crème Brûlée', category: 'desserts', price: 16, cost: 4, description: 'Silky saffron-infused custard with a perfectly caramelized sugar crust, macerated wild berries.', image: '/images/saffron_creme_brulee.png', tags: ['Veg', 'GF'] },
      { id: 'drink-1', name: 'Royal Gold Old Fashioned', category: 'drinks', price: 28, cost: 8, description: 'Rare 12-year bourbon, demerara syrup, gold bitters, smoked with cherrywood chips, served with a gold-leaf ice sphere.', image: '/images/old_fashioned.png', tags: ['GF'] },
      { id: 'drink-2', name: 'Signature Emerald Gimlet', category: 'drinks', price: 22, cost: 6, description: 'Empress gin, fresh lime, botanical cucumber elixir, fresh mint essence, served in a chilled crystal coupette.', image: '/images/emerald_gimlet.png', tags: ['GF', 'Veg'] }
    ];

    const savedMenu = localStorage.getItem('dinepos_menu_items');
    if (savedMenu) {
      try {
        let loadedItems = JSON.parse(savedMenu);
        if (!loadedItems.some((item: any) => item.category === 'combos')) {
          const defaultCombos = [
            { id: 'combo-1', name: 'Imperial Signature Combo', category: 'combos', price: 120, cost: 40, description: 'A luxurious set featuring our Wagyu Beef Tartare starter, Truffle Glazed Filet Mignon main course, and Chocolate Soufflé dessert.', image: '/images/wagyu_ribeye.png', tags: ['Non-Veg'] },
            { id: 'combo-2', name: 'Royal Vegetarian Tasting Set', category: 'combos', price: 75, cost: 20, description: 'A curated vegetarian experience: Truffle Burrata Salad starter, Acquerello Mushroom Risotto main, and Saffron Crème Brûlée.', image: '/images/mushroom_risotto.png', tags: ['Veg', 'GF'] }
          ];
          loadedItems = [...loadedItems, ...defaultCombos];
          localStorage.setItem('dinepos_menu_items', JSON.stringify(loadedItems));
        }
        setMenuItemsList(loadedItems);
      } catch (e) {
        console.error('Failed to parse menu items:', e);
        setMenuItemsList(defaultMenuItems);
      }
    } else {
      setMenuItemsList(defaultMenuItems);
      localStorage.setItem('dinepos_menu_items', JSON.stringify(defaultMenuItems));
    }

    const defaultCategories = [
      { id: 'special', name: 'Our Special', icon: 'auto_awesome' },
      { id: 'combos', name: 'Combo Set', icon: 'lunch_dining' },
      { id: 'starters', name: 'Starters', icon: 'restaurant' },
      { id: 'mains', name: 'Main Course', icon: 'restaurant_menu' },
      { id: 'desserts', name: 'Desserts', icon: 'icecream' },
      { id: 'drinks', name: 'Drinks', icon: 'local_bar' }
    ];
    const savedCategories = localStorage.getItem('dinepos_menu_categories');
    if (savedCategories) {
      try {
        let loadedCategories = JSON.parse(savedCategories);
        loadedCategories = loadedCategories.map((c: any) => 
          c.id === 'combos' ? { ...c, name: 'Combo Set' } : c
        );
        if (!loadedCategories.some((c: any) => c.id === 'combos')) {
          const specIdx = loadedCategories.findIndex((c: any) => c.id === 'special');
          if (specIdx !== -1) {
            loadedCategories.splice(specIdx + 1, 0, { id: 'combos', name: 'Combo Set', icon: 'lunch_dining' });
          } else {
            loadedCategories.unshift({ id: 'combos', name: 'Combo Set', icon: 'lunch_dining' });
          }
        }
        localStorage.setItem('dinepos_menu_categories', JSON.stringify(loadedCategories));
        setCategories(loadedCategories);
      } catch (e) {
        console.error('Failed to parse saved categories:', e);
        setCategories(defaultCategories);
      }
    } else {
      setCategories(defaultCategories);
      localStorage.setItem('dinepos_menu_categories', JSON.stringify(defaultCategories));
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dinepos_menu_items' && e.newValue) {
        try {
          setMenuItemsList(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to parse storage menu updates:', err);
        }
      }
      if (e.key === 'dinepos_menu_categories' && e.newValue) {
        try {
          setCategories(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to parse storage categories updates:', err);
        }
      }
      if (e.key === 'dinepos_language' && e.newValue) {
        if (e.newValue === 'ja' || e.newValue === 'en') {
          setLanguage(e.newValue as 'en' | 'ja' | 'zh' | 'ko');
        }
      }
      if (e.key === 'dinepos_tax_type' && e.newValue) {
        if (e.newValue === 'pre-tax' || e.newValue === 'post-tax') {
          setTaxType(e.newValue as 'pre-tax' | 'post-tax');
        }
      }
      if (e.key === 'dinepos_tax_rate_dine_in' && e.newValue) {
        setTaxRateDineIn(parseFloat(e.newValue));
      }
      if (e.key === 'dinepos_tax_rate_takeaway' && e.newValue) {
        setTaxRateTakeaway(parseFloat(e.newValue));
      }
      if (e.key === 'dinepos_tax_rate_delivery' && e.newValue) {
        setTaxRateDelivery(parseFloat(e.newValue));
      }
      if (e.key === 'dinepos_exclusions_config' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setDigitalMenuConfig(prev => ({
            ...prev,
            ...parsed
          }));
        } catch (err) {
          console.error('Failed to parse storage exclusions updates:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = themes[globalAesthetic as keyof typeof themes] || themes['Midnight Black'];

  const currencySymbols: Record<string, string> = { USD: '$', JPY: '¥', EUR: '€', GBP: '£', CNY: '¥', KRW: '₩' };
  const currencyRates: Record<string, number> = { USD: 1, JPY: 150, EUR: 0.92, GBP: 0.79, CNY: 7.24, KRW: 1340 };
  const isJpy = currency === 'JPY' || currency === 'KRW';
  const formatCurrency = (val: number) => {
    const rate = currencyRates[currency] || 1;
    const sym = currencySymbols[currency] || '$';
    const converted = (parseFloat(val as any) || 0) * rate;
    if (currency === 'JPY' || currency === 'KRW') return `${sym}${Math.round(converted).toLocaleString()}`;
    return `${sym}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const tr = translations[language] || translations['en'];

  const handleLanguageChange = (newLang: 'en' | 'ja' | 'zh' | 'ko') => {
    setLanguage(newLang);
    localStorage.setItem('dinepos_language', newLang);
    const names: Record<string, string> = { en: 'English', ja: 'Japanese / 日本語', zh: 'Chinese / 中文', ko: 'Korean / 한국어' };
    triggerToast(`Dashboard language set to ${names[newLang]}.`, 'success');
  };

  const handleCurrencyChange = (newCurrency: 'USD' | 'JPY' | 'EUR' | 'GBP' | 'CNY' | 'KRW') => {
    setCurrency(newCurrency);
    localStorage.setItem('dinepos_currency', newCurrency);
    const cnames: Record<string, string> = { USD: 'USD ($)', JPY: 'JPY (¥)', EUR: 'EUR (€)', GBP: 'GBP (£)', CNY: 'CNY (¥)', KRW: 'KRW (₩)' };
    triggerToast(`Display currency changed to ${cnames[newCurrency]}.`, 'success');
  };

  const handleTaxRateDineInChange = (val: number) => {
    setTaxRateDineIn(val);
    localStorage.setItem('dinepos_tax_rate_dine_in', val.toString());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_tax_rate_dine_in', newValue: val.toString() }));
    }
  };

  const handleTaxRateTakeawayChange = (val: number) => {
    setTaxRateTakeaway(val);
    localStorage.setItem('dinepos_tax_rate_takeaway', val.toString());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_tax_rate_takeaway', newValue: val.toString() }));
    }
  };

  const handleTaxRateDeliveryChange = (val: number) => {
    setTaxRateDelivery(val);
    localStorage.setItem('dinepos_tax_rate_delivery', val.toString());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_tax_rate_delivery', newValue: val.toString() }));
    }
  };

  const handleTaxTypeChange = (newTaxType: 'pre-tax' | 'post-tax') => {
    setTaxType(newTaxType);
    localStorage.setItem('dinepos_tax_type', newTaxType);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', { key: 'dinepos_tax_type', newValue: newTaxType }));
    }
    triggerToast(newTaxType === 'pre-tax' ? 'Tax mode changed to Pre-tax (Exclusive).' : 'Tax mode changed to Post-tax (Inclusive).', 'success');
  };

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSaveChanges = () => {
    triggerToast('Configuration changes saved successfully!', 'success');
  };

  const togglePermission = (role: string, perm: string) => {
    setSecurityPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev[role][perm]
      }
    }));
    triggerToast(`Updated ${perm} privilege for ${role}s.`, 'success');
    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Admin',
        action: `Toggled ${perm} permission for ${role} role`,
        type: 'info'
      },
      ...prev
    ]);
  };

  const handleStartRouterUpdate = (alertId: string) => {
    if (routerUpdateProgress !== null) return;
    setRouterUpdateProgress(0);
    triggerToast('Starting Main Dining Router firmware update...', 'info');
    
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      if (current >= 100) {
        clearInterval(interval);
        setRouterUpdateProgress(null);
        setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
        triggerToast('Main Dining Router updated to v2.4.1!', 'success');
        setAuditLogs(prev => [
          {
            id: Date.now(),
            time: 'Just now',
            actor: 'System Auto-Daemon',
            action: 'Updated Main Dining Router firmware to v2.4.1',
            type: 'success'
          },
          ...prev
        ]);
      } else {
        setRouterUpdateProgress(current);
      }
    }, 400);
  };

  const handleRunPrinterTest = (devId: string, devName: string) => {
    setPrintingDevices(prev => ({ ...prev, [devId]: true }));
    triggerToast(`Sending 80mm test print job to ${devName}...`, 'info');
    setTimeout(() => {
      setPrintingDevices(prev => ({ ...prev, [devId]: false }));
      triggerToast(`Test print completed successfully on ${devName}!`, 'success');
      setAuditLogs(prev => [
        {
          id: Date.now(),
          time: 'Just now',
          actor: 'Admin',
          action: `Initiated thermal test print job on printer ${devName}`,
          type: 'info'
        },
        ...prev
      ]);
    }, 2000);
  };

  const handleApplyChanges = () => {
    triggerToast(`KDS configuration applied to '${currentStation}' station!`, 'success');
  };

  const handleResetDefaults = () => {
    setCurrentStation('Grill & Sauté');
    setRelaxedThreshold(10);
    setWarningThreshold(15);
    setUrgentThreshold(20);
    setTicketDensity('standard');
    setBaseFontSize(16);
    setGridColumns(4);
    setAutoHideOrders(true);
    setShowVipProminently(true);
    setCourseBasedFiring(false);
    setAutoPrintOnFire(false);
    setAlertChime('Boutique Bell');
    setAlertVolume(85);
    setAudibleAlertsEnabled(true);
    setPairedStar(false);
    setPairedEpson(false);
    triggerToast('KDS settings reset to defaults.', 'info');
  };

  const handleScanDevices = () => {
    setIsScanning(true);
    triggerToast('Scanning for nearby bluetooth thermal printers...', 'info');
    setTimeout(() => {
      setIsScanning(false);
      triggerToast('Scan completed. Printers discovered.', 'success');
    }, 2000);
  };

  const togglePairStar = () => {
    setPairedStar(prev => !prev);
    triggerToast(!pairedStar ? 'Star Micronics MCP31 paired!' : 'Star printer unpaired.', 'success');
  };

  const togglePairEpson = () => {
    setPairedEpson(prev => !prev);
    triggerToast(!pairedEpson ? 'Epson TM-m30II paired!' : 'Epson printer unpaired.', 'success');
  };

  const handleToggleSpecial = (item: any) => {
    const updatedCategory = item.category === 'special' ? 'mains' : 'special';
    const updatedList = menuItemsList.map(m => 
      m.id === item.id ? { ...m, category: updatedCategory } : m
    );
    setMenuItemsList(updatedList);
    localStorage.setItem('dinepos_menu_items', JSON.stringify(updatedList));
    triggerToast(item.category === 'special' ? `Removed ${item.name} from Specials.` : `Marked ${item.name} as Special Dish!`, 'success');
  };

  const handleDeleteMenuItem = (id: string) => {
    const updatedList = menuItemsList.filter(m => m.id !== id);
    setMenuItemsList(updatedList);
    localStorage.setItem('dinepos_menu_items', JSON.stringify(updatedList));
    triggerToast('Menu item deleted successfully.', 'success');
  };

  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuFormName.trim()) {
      triggerToast('Item name is required.', 'info');
      return;
    }
    if (menuFormPrice < 0 || menuFormCost < 0) {
      triggerToast('Price and Cost must be non-negative.', 'info');
      return;
    }

    let updatedList;
    if (editingMenuItem) {
      // Editing existing item
      updatedList = menuItemsList.map(m => 
        m.id === editingMenuItem.id 
          ? { 
              ...m, 
              name: menuFormName, 
              category: menuFormCategory, 
              price: menuFormPrice, 
              cost: menuFormCost, 
              description: menuFormDescription, 
              image: menuFormImage, 
              tags: menuFormTags,
              mealPeriod: menuFormMealPeriod
            }
          : m
      );
      triggerToast(`Successfully updated menu item: ${menuFormName}`, 'success');
    } else {
      // Adding new item
      const newId = `item-${Date.now()}`;
      const newItem = {
        id: newId,
        name: menuFormName,
        category: menuFormCategory,
        price: menuFormPrice,
        cost: menuFormCost,
        description: menuFormDescription,
        image: menuFormImage,
        tags: menuFormTags,
        mealPeriod: menuFormMealPeriod
      };
      updatedList = [...menuItemsList, newItem];
      triggerToast(`Successfully added menu item: ${menuFormName}`, 'success');
    }

    setMenuItemsList(updatedList);
    localStorage.setItem('dinepos_menu_items', JSON.stringify(updatedList));
    setShowMenuAddEditModal(false);
    setEditingMenuItem(null);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormName.trim()) {
      triggerToast('Category name is required.', 'info');
      return;
    }

    let updatedList;
    if (editingCategory) {
      updatedList = categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: categoryFormName, icon: categoryFormIcon }
          : cat
      );
      triggerToast(`Category updated: ${categoryFormName}`, 'success');
    } else {
      const generatedId = categoryFormName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || `cat-${Date.now()}`;
      if (categories.some(c => c.id === generatedId)) {
        triggerToast('A category with a similar name already exists.', 'info');
        return;
      }
      const newCategory = {
        id: generatedId,
        name: categoryFormName,
        icon: categoryFormIcon
      };
      updatedList = [...categories, newCategory];
      triggerToast(`Category added: ${categoryFormName}`, 'success');
    }

    setCategories(updatedList);
    localStorage.setItem('dinepos_menu_categories', JSON.stringify(updatedList));
    setEditingCategory(null);
    setCategoryFormName('');
    setCategoryFormIcon('restaurant');
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      triggerToast('Cannot delete the last category. At least one category must exist.', 'info');
      return;
    }

    const updatedCategories = categories.filter(c => c.id !== id);
    setCategories(updatedCategories);
    localStorage.setItem('dinepos_menu_categories', JSON.stringify(updatedCategories));

    const fallbackCategory = updatedCategories[0].id;
    const updatedItems = menuItemsList.map(item => 
      item.category === id ? { ...item, category: fallbackCategory } : item
    );
    setMenuItemsList(updatedItems);
    localStorage.setItem('dinepos_menu_items', JSON.stringify(updatedItems));

    triggerToast(`Category deleted. Items moved to ${updatedCategories[0].name}.`, 'success');
    if (editingCategory && editingCategory.id === id) {
      setEditingCategory(null);
      setCategoryFormName('');
      setCategoryFormIcon('restaurant');
    }
  };

  // Calculations for Receipt Live Preview
  const subtotalVal = 100.00;
  const taxVal = taxType === 'pre-tax' ? 8.00 : 100.00 - (100.00 / 1.08);
  const serviceChargeVal = showServiceCharge ? 10.00 : 0.00;
  const totalVal = taxType === 'pre-tax' ? subtotalVal + taxVal + serviceChargeVal : subtotalVal + serviceChargeVal;

  return (
    <div className={`flex w-full min-h-screen ${t.bg} ${t.text} font-sans antialiased overflow-x-hidden select-none`}>
      {/* Inject custom theme CSS variables dynamically — values are sanitized to hex only */}
      <style dangerouslySetInnerHTML={{ __html: (() => {
        const safeHex = (v: string) => /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : '#000000';
        return `:root {
          --custom-bg: ${safeHex(customBg)};
          --custom-card-bg: ${safeHex(customCardBg)};
          --custom-accent: ${safeHex(customAccent)};
          --custom-text: ${safeHex(customText)};
          --custom-text-muted: ${safeHex(customTextMuted)};
        }`;
      })() }} />
      
      {/* LEFT SIDEBAR PANEL (ADMIN CONSOLE CONTEXT) */}
      <aside className={`w-[280px] ${t.sidebarBg} flex flex-col justify-between p-8 flex-shrink-0 z-20`}>
        <div>
          {/* Brand/Admin Console Header */}
          <div className="mb-10 select-none flex items-center">
            <div className={`w-10 h-10 rounded-lg ${t.accentBg} flex items-center justify-center ${t.accentText} flex-shrink-0 select-none mr-3 shadow-lg`}>
              <span className="material-symbols-outlined font-black">restaurant</span>
            </div>
            <div>
              <Link href="/" className={`font-serif font-bold ${t.accent} text-[18px] tracking-wide block hover:opacity-85 transition-opacity leading-none`}>
                DinePosAi
              </Link>
              <span className="font-sans text-[10px] text-white/50 font-medium mt-1 block">
                {tr.adminConsole}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2 font-sans border-r-0">
            {/* General */}
            <button type="button"
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'general'
                  ? `${t.accentBg} ${t.accentText} rounded-xl`
                  : `${t.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">settings</span>
              <span>{tr.general}</span>
            </button>
            {/* Payments */}
            <button type="button"
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'payments'
                  ? `${t.accentBg} ${t.accentText} rounded-xl`
                  : `${t.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">payments</span>
              <span>{tr.payments}</span>
            </button>
            {/* Hardware */}
            <button type="button"
              onClick={() => setActiveTab('hardware')}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'hardware'
                  ? `${t.accentBg} ${t.accentText} rounded-xl`
                  : `${t.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">print</span>
              <span>{tr.hardware}</span>
            </button>
            {/* Staff */}
            <button type="button"
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'staff'
                  ? `${t.accentBg} ${t.accentText} rounded-xl`
                  : `${t.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">badge</span>
              <span>{tr.staff}</span>
            </button>
            {/* Security */}
            <button type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'security'
                  ? `${t.accentBg} ${t.accentText} rounded-xl`
                  : `${t.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">security</span>
              <span>{tr.security}</span>
            </button>
            {/* Menu Editor */}
            <button type="button"
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'menu'
                  ? `${t.accentBg} ${t.accentText} rounded-xl`
                  : `${t.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">restaurant_menu</span>
              <span>{tr.menuEditor}</span>
            </button>
            {/* Analytics */}
            <button type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-4 w-full px-4 py-3 font-bold text-[12.5px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'analytics'
                  ? `${t.accentBg} ${t.accentText} rounded-xl`
                  : `${t.textMuted} hover:text-white hover:bg-white/5 rounded-xl`
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">bar_chart</span>
              <span>Analytics</span>
            </button>
          </nav>
        </div>
        
        {/* Save Changes button */}
        <div className="pt-6 font-sans space-y-3">
          <button type="button" 
            onClick={() => handleSaveChanges()}
            className={`w-full ${t.accentBg} ${t.accentHoverBg} ${t.accentText} font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition-colors shadow-lg cursor-pointer`}
          >
            {tr.saveChanges}
          </button>

          <Link 
            href="/login"
            className={`w-full py-2.5 bg-white/5 hover:bg-white/10 ${t.text} rounded-xl font-bold uppercase tracking-wider text-[10px] transition-colors flex items-center justify-center gap-1.5`}
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            {tr.signOut}
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT WINDOW */}
      <div className={`flex-grow flex flex-col min-h-screen relative ${t.bg}`}>
        {/* Top Header Bar */}
        <header className={`h-[90px] border-b ${t.border} flex items-center justify-between px-12 flex-shrink-0 bg-transparent sticky top-0 z-10 select-none backdrop-blur-md`}>
          <div className="relative select-none">
            <span className={`material-symbols-outlined absolute left-4 top-3 ${t.textMutedDark} text-sm`}>search</span>
            <input
              type="text"
              placeholder={activeTab === 'operations' ? "Search settings..." : activeTab === 'payments' ? "Search transactions..." : activeTab === 'hardware' ? "Search devices..." : "Search parameters..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full max-w-[240px] bg-black/20 border ${t.border} rounded-xl pl-11 pr-4 py-2.5 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors font-medium`}
            />
          </div>
          
          {/* Quick config search and user actions */}
          <div className="flex items-center gap-5">
            <button type="button" 
              onClick={() => triggerToast('No new notifications.', 'info')}
              className={`w-[42px] h-[42px] flex items-center justify-center bg-transparent border ${t.border} hover:border-[#ffe2ab]/20 rounded-xl text-white transition-colors cursor-pointer select-none relative`}
            >
              <span className={`material-symbols-outlined text-lg ${t.textMuted}`}>notifications</span>
              <span className="absolute top-3.5 right-3.5 w-1 h-1 bg-rose-500 rounded-full"></span>
            </button>

            <button type="button" 
              onClick={() => setActiveTab('operations')}
              className={`w-[42px] h-[42px] flex items-center justify-center bg-transparent border rounded-xl transition-colors cursor-pointer select-none ${
                activeTab === 'operations' 
                  ? `${t.accentLightBorder} bg-[#ffe2ab]/5 ${t.accentLight}` 
                  : `${t.border} hover:border-white/10 ${t.text}`
              }`}
            >
              <span className={`material-symbols-outlined text-lg ${activeTab === 'operations' ? 'text-[#ffe2ab] font-black' : 'text-[#A69984]/60'}`}>settings</span>
            </button>

            {/* Language Toggle */}
            <div className={`flex items-center ${t.cardBgOpaque} border ${t.border} rounded-xl overflow-hidden select-none`}>
              {([
                { code: 'en', flag: '🇺🇸', label: 'EN', title: 'English' },
                { code: 'ja', flag: '🇯🇵', label: 'JA', title: '日本語' },
                { code: 'zh', flag: '🇨🇳', label: 'ZH', title: '中文' },
                { code: 'ko', flag: '🇰🇷', label: 'KO', title: '한국어' },
              ] as const).map((lang, i) => (
                <React.Fragment key={lang.code}>
                  {i > 0 && <div className={`w-px h-4 bg-white/10`}></div>}
                  <button type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`px-2.5 py-2.5 text-[9.5px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                      language === lang.code ? `${t.accentBg} ${t.accentText}` : `${t.textMuted} hover:text-white`
                    }`}
                    title={lang.title}
                  >
                    {lang.flag} {lang.label}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <button type="button" 
              onClick={() => triggerToast('Loading help documentation...', 'info')}
              className={`w-[42px] h-[42px] flex items-center justify-center bg-transparent border ${t.border} hover:border-white/10 rounded-xl text-white transition-colors cursor-pointer select-none`}
            >
              <span className={`material-symbols-outlined text-lg ${t.textMuted}`}>help</span>
            </button>

            <div className={`flex items-center gap-3 ${t.cardBgOpaque} rounded-xl pl-3 pr-4 py-1.5 select-none`}>
              <div className={`w-7 h-7 rounded-lg overflow-hidden border ${t.borderStrong} flex-shrink-0`}>
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=120&auto=format&fit=crop"
                  alt="Admin user avatar"
                  className="w-full h-full object-cover grayscale"
                />
              </div>
              <div className="text-left font-sans">
                <div className={`${t.text} font-bold text-[10px] tracking-wide uppercase leading-none`}>Admin</div>
                <div className={`text-[7.5px] ${t.accentLight} font-bold tracking-widest uppercase mt-0.5 leading-none`}>{tr.administrator}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Panels Scrollable Body */}
        <div className={`flex-grow p-12 overflow-y-auto w-full mx-auto pb-32 ${t.scrollbarThumb}`}>
          
          {/* TAB 1: OPERATIONS / GENERAL CONFIGURATION SCREEN */}
          {activeTab === 'operations' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Configuration welcome banner */}
              <div className="relative border border-white/5 rounded-3xl p-10 overflow-hidden bg-gradient-to-r from-purple-950/20 via-[#1c1221] to-[#120f26] shadow-2xl group select-none">
                <div className="relative z-10 max-w-2xl">
                  <h2 className="font-serif text-[44px] font-medium text-white tracking-wide leading-none mb-4">
                    Configuration
                  </h2>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 leading-relaxed font-semibold">
                    Manage your establishment's global preferences, notification routing, and hardware ecosystem.
                  </p>
                </div>
              </div>

              {/* Profile & Routing Dual Card Panel Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: General Profile (Span 8) */}
                <div className="lg:col-span-8">
                  <div className={`${t.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                    
                    <div className={`flex items-center gap-2 border-b ${t.border} pb-4 select-none`}>
                      <span className={`material-symbols-outlined ${t.accent} text-lg`}>settings</span>
                      <h3 className={`font-serif text-base ${t.text} font-bold tracking-wide`}>General Profile</h3>
                    </div>

                    <div className="space-y-5 font-sans">
                      
                      {/* Inputs Row 1: Name and Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>Establishment Name</label>
                          <input 
                            type="text" 
                            value={establishmentName}
                            onChange={(e) => setEstablishmentName(e.target.value)}
                            placeholder="Establishment Name..."
                            className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3.5 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                          />
                        </div>
                        <div>
                          <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>Primary Contact Email</label>
                          <input 
                            type="email" 
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="Email address..."
                            className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3.5 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                          />
                        </div>
                      </div>

                      {/* Input Row 2: Address */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>Physical Address</label>
                        <input 
                          type="text" 
                          aria-label="Business address"
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          placeholder="Physical Address..."
                          className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3.5 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                        />
                      </div>

                      {/* Save Profile button */}
                      <div className="flex justify-end pt-2 select-none">
                        <button type="button"
                          onClick={() => triggerToast('General Profile configurations saved successfully!', 'success')}
                          className={`px-5 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95`}
                        >
                          <span className="material-symbols-outlined text-sm font-bold">save</span>
                          Save Profile
                        </button>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Right Column: Routing Settings (Span 4) */}
                <div className="lg:col-span-4">
                  <div className={`${t.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                    
                    <div className={`flex items-center gap-2 border-b ${t.border} pb-4 select-none`}>
                      <span className={`material-symbols-outlined ${t.accent} text-lg font-light`}>notifications_active</span>
                      <h3 className={`font-serif text-base ${t.text} font-bold tracking-wide`}>Routing</h3>
                    </div>

                    <div className="space-y-4 font-sans select-none">
                      
                      {/* Toggle 1: EOD Summary */}
                      <div className={`flex justify-between items-center ${t.inputBg}/50 p-4 border ${t.border} rounded-xl`}>
                        <div className="max-w-[70%]">
                          <h4 className={`text-[11px] font-bold uppercase tracking-wider ${t.text}`}>End-of-Day Summary</h4>
                          <p className={`text-[9.5px] ${t.textMutedLight} font-semibold leading-relaxed mt-0.5`}>
                            Email report to managers
                          </p>
                        </div>
                        <button type="button"
                          onClick={() => {
                            setEndOfDaySummary(!endOfDaySummary);
                            triggerToast(`End-of-Day Summary email routing ${!endOfDaySummary ? 'activated' : 'deactivated'}.`, 'info');
                          }}
                          className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${endOfDaySummary ? t.accentBg : 'bg-white/20'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 transform ${endOfDaySummary ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Toggle 2: Critical Void Alerts */}
                      <div className={`flex justify-between items-center ${t.inputBg}/50 p-4 border ${t.border} rounded-xl`}>
                        <div className="max-w-[70%]">
                          <h4 className={`text-[11px] font-bold uppercase tracking-wider ${t.text}`}>Critical Void Alerts</h4>
                          <p className={`text-[9.5px] ${t.textMutedLight} font-semibold leading-relaxed mt-0.5`}>
                            Real-time terminal push
                          </p>
                        </div>
                        <button type="button"
                          onClick={() => {
                            setCriticalVoidAlerts(!criticalVoidAlerts);
                            triggerToast(`Critical void alert routing ${!criticalVoidAlerts ? 'activated' : 'deactivated'}.`, 'info');
                          }}
                          className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${criticalVoidAlerts ? t.accentBg : 'bg-white/20'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 transform ${criticalVoidAlerts ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Toggle 3: 86'd Item Broadcast */}
                      <div className={`flex justify-between items-center ${t.inputBg}/50 p-4 border ${t.border} rounded-xl`}>
                        <div className="max-w-[70%]">
                          <h4 className={`text-[11px] font-bold uppercase tracking-wider ${t.text}`}>86'd Item Broadcast</h4>
                          <p className={`text-[9.5px] ${t.textMutedLight} font-semibold leading-relaxed mt-0.5`}>
                            Alert all active stations
                          </p>
                        </div>
                        <button type="button"
                          onClick={() => {
                            setItemBroadcast86(!itemBroadcast86);
                            triggerToast(`86'd items real-time broadcasting ${!itemBroadcast86 ? 'activated' : 'deactivated'}.`, 'info');
                          }}
                          className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${itemBroadcast86 ? t.accentBg : 'bg-white/20'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 transform ${itemBroadcast86 ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                    </div>

                  </div>
                </div>

              </div>

              {/* Thermal Printer Hub Card Section */}
              <div className={`${t.cardBg} border rounded-2xl p-8 shadow-xl space-y-6`}>
                
                <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b ${t.border} pb-4 select-none`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined ${t.accent} text-lg`}>print</span>
                      <h3 className={`font-serif text-base ${t.text} font-bold tracking-wide`}>Thermal Printer Hub</h3>
                    </div>
                    <p className={`text-[10px] ${t.textMuted} font-semibold leading-relaxed mt-1`}>
                      Manage 80mm routing for Kitchen Display Systems and Front-of-House receipts.
                    </p>
                  </div>

                  <button type="button"
                    onClick={() => triggerToast('Opening Thermal Printer registration wizard...', 'info')}
                    className={`border ${t.accentLightBorder} hover:bg-[#ffe2ab]/5 ${t.accent} px-4 py-2 rounded-lg font-sans font-bold text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 select-none`}
                  >
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                    Add Device
                  </button>
                </div>

                {/* Printer Hub Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 select-none">
                  
                  {/* Printer 1: Kitchen */}
                  <div className={`${t.inputBg}/50 p-5 border ${t.accentLightBorder} rounded-xl flex justify-between items-center shadow-[0_0_15px_rgba(255,226,171,0.02)]`}>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span className="text-[10px] font-sans font-bold text-emerald-400 uppercase tracking-widest">ONLINE</span>
                    </div>
                    <span className={`px-2 py-0.5 ${t.tagAdmin} font-mono font-bold text-[8.5px] tracking-wider rounded`}>80mm</span>
                  </div>

                  {/* Printer 2: Cashier */}
                  <div className={`${t.inputBg}/50 p-5 border ${t.border} rounded-xl flex justify-between items-center`}>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span className="text-[10px] font-sans font-bold text-emerald-400 uppercase tracking-widest">ONLINE</span>
                    </div>
                    <span className={`px-2 py-0.5 ${t.tagAdmin} font-mono font-bold text-[8.5px] tracking-wider rounded`}>80mm</span>
                  </div>

                  {/* Printer 3: Bar */}
                  <div className={`${t.inputBg}/50 p-5 border border-red-500/20 rounded-xl flex justify-between items-center shadow-[0_0_15px_rgba(239,68,68,0.02)]`}>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      <span className="text-[10px] font-sans font-bold text-red-400 uppercase tracking-widest">OFFLINE</span>
                    </div>
                    <span className={`px-2 py-0.5 ${t.tagAdmin} font-mono font-bold text-[8.5px] tracking-wider rounded`}>80mm</span>
                  </div>

                </div>

              </div>

              {/* Operations panel copy footer */}
              <footer className="mt-16 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#A69984]/30 font-semibold tracking-wider uppercase select-none gap-4">
                <div>© 2026 DinePosAi. All rights reserved.</div>
                <div className="flex gap-6">
                  <Link href="/privacy" className="hover:text-[#A69984]/50 transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-[#A69984]/50 transition-colors">Terms of Service</Link>
                </div>
              </footer>

            </div>
          )}

          {/* TAB 2: RECEIPTS CONFIGURATION SCREEN */}
          {activeTab === 'receipts' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Live Preview Receipt simulation (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex justify-between items-center select-none pl-1">
                  <h3 className="font-serif text-base font-bold text-[#ffe2ab] uppercase tracking-wider">Live Preview</h3>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-[#ffe2ab] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffe2ab] motion-safe:animate-pulse"></span>
                    Sync Active
                  </div>
                </div>

                {/* Dark Simulated Receipt card wrapper */}
                <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-6 shadow-xl flex justify-center items-center min-h-[500px]">
                  <div className="w-full max-w-[280px] bg-[#1c1b1a] text-[#A69984] border border-white/5 rounded-xl p-6 shadow-lg flex flex-col justify-between font-mono text-[10px] leading-relaxed">
                    
                    {/* Brand & Logo Header */}
                    <div className="text-center space-y-2 mb-4">
                      {showLogo && (
                        <div className="flex justify-center select-none">
                          <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center text-[#ffe2ab]">
                            <span className="material-symbols-outlined text-sm font-black">flatware</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-white font-extrabold uppercase text-xs tracking-wider select-none">
                        {establishmentName || 'DinePosAi'}
                      </div>
                      
                      <div className="text-[8.5px] text-[#A69984]/60 font-semibold max-w-[180px] mx-auto break-words leading-tight">
                        {businessAddress || '72 Culinary Avenue, Gourmet District, Metropolis'}
                      </div>
                    </div>

                    {/* Metadata dotted block */}
                    {(showTableNumber || showServerName || showOrderTimestamp) && (
                      <div className="border-y border-dashed border-white/10 py-2.5 my-3 text-[9px] text-[#A69984]/70 select-none">
                        <div className="flex justify-between">
                          <div>
                            {showTableNumber && <div className="text-white font-bold">TABLE: T-14</div>}
                            {showOrderTimestamp && <div className="text-[8.5px] mt-0.5">06/03/2026 15:32</div>}
                          </div>
                          <div className="text-right">
                            {showServerName && <div>SERVER: JULIAN B.</div>}
                            <div className="text-[8.5px] text-white/55 mt-0.5">Order #2345</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Items check list */}
                    <div className="space-y-2.5 py-1 select-none">
                      <div className="flex justify-between items-baseline">
                        <span className="text-white/90">2 Truffle Wagyu Sliders</span>
                        <span className="text-white/95 font-bold">$48.00</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-white/90">1 Lobster Bisque</span>
                        <span className="text-white/95 font-bold">$18.00</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-white/90">2 Vintage Cabernet (G)</span>
                        <span className="text-white/95 font-bold">$34.00</span>
                      </div>
                    </div>

                    {/* Subtotal breakdowns */}
                    <div className="border-t border-white/5 pt-3 mt-3 space-y-1.5 text-[9px] text-[#A69984]/65 select-none">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>$100.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8%)</span>
                        <span>$8.00</span>
                      </div>
                      {showServiceCharge && (
                        <div className="flex justify-between">
                          <span>Service Charge (10%)</span>
                          <span>$10.00</span>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="border-t border-dashed border-white/10 pt-3 mt-2 flex justify-between items-baseline select-none">
                      <span className="text-white font-extrabold">TOTAL</span>
                      <span className="text-[#ffe2ab] text-[13px] font-bold font-mono">
                        ${totalVal.toFixed(2)}
                      </span>
                    </div>

                    {/* Footer barcode/QR/Text block */}
                    <div className="text-center mt-6 space-y-4">
                      {thankYouMessage && (
                        <div className="text-[8.5px] italic text-[#A69984]/60 break-words font-sans max-w-[200px] mx-auto">
                          "{thankYouMessage}"
                        </div>
                      )}

                      {showQrCode && (
                        <div className="flex flex-col items-center gap-1.5 select-none pt-1">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-[#A69984]/60">
                            <rect x="1" y="1" width="6" height="6" stroke="currentColor" rx="0.5"/>
                            <rect x="2.5" y="2.5" width="3" height="3" fill="currentColor"/>
                            <rect x="17" y="1" width="6" height="6" stroke="currentColor" rx="0.5"/>
                            <rect x="18.5" y="2.5" width="3" height="3" fill="currentColor"/>
                            <rect x="1" y="17" width="6" height="6" stroke="currentColor" rx="0.5"/>
                            <rect x="2.5" y="18.5" width="3" height="3" fill="currentColor"/>
                            <rect x="9" y="1" width="2" height="2" fill="currentColor"/>
                            <rect x="13" y="2" width="2" height="1" fill="currentColor"/>
                            <rect x="9" y="9" width="3" height="3" fill="currentColor"/>
                            <rect x="17" y="9" width="2" height="2" fill="currentColor"/>
                            <rect x="9" y="17" width="2" height="2" fill="currentColor"/>
                            <rect x="13" y="18" width="2" height="2" fill="currentColor"/>
                            <rect x="18" y="17" width="4" height="4" fill="currentColor"/>
                          </svg>
                          <span className="text-[7.5px] font-bold text-[#ffe2ab]/70 uppercase tracking-widest font-sans">Scan for Feedback</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* Right Column: Configuration Cards (Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Configuration 1: Brand & Header */}
                <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-7 shadow-xl space-y-6">
                  <h3 className="font-serif text-lg text-white font-medium tracking-wide border-b border-white/5 pb-4 select-none">Brand & Header</h3>
                  <div className="space-y-4 font-sans select-none">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#A69984]/70 text-[9.5px] font-bold uppercase tracking-wider mb-2">Establishment Name</label>
                        <input 
                          type="text" 
                          aria-label="Establishment name"
                          value={establishmentName}
                          onChange={(e) => setEstablishmentName(e.target.value)}
                          placeholder="DinePosAi"
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[#A69984]/70 text-[9.5px] font-bold uppercase tracking-wider mb-2">Business Address</label>
                        <input 
                          type="text" 
                          aria-label="Business address"
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          placeholder="Address..."
                          className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-[#0e0e0d]/50 p-4 border border-white/5 rounded-xl mt-2">
                      <div className="max-w-[70%]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Show Logo</h4>
                        <p className="text-[10.5px] text-[#A69984]/50 font-semibold leading-relaxed">
                          Include restaurant logo at the top
                        </p>
                      </div>
                      <button type="button"
                        onClick={() => setShowLogo(!showLogo)}
                        className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${showLogo ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${showLogo ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Configuration 2: Operational Details */}
                <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-7 shadow-xl space-y-6">
                  <h3 className="font-serif text-lg text-white font-medium tracking-wide border-b border-white/5 pb-4 select-none">Operational Details</h3>
                  <div className="space-y-4 font-sans select-none">
                    
                    {/* Table Number Toggle */}
                    <div className="flex justify-between items-center bg-[#0e0e0d]/50 p-4 border border-white/5 rounded-xl">
                      <div className="max-w-[75%]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Table Number</h4>
                      </div>
                      <button type="button"
                        onClick={() => setShowTableNumber(!showTableNumber)}
                        className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${showTableNumber ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${showTableNumber ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                    {/* Server Name Toggle */}
                    <div className="flex justify-between items-center bg-[#0e0e0d]/50 p-4 border border-white/5 rounded-xl">
                      <div className="max-w-[75%]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Server Name</h4>
                      </div>
                      <button type="button"
                        onClick={() => setShowServerName(!showServerName)}
                        className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${showServerName ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${showServerName ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                    {/* Timestamp Toggle */}
                    <div className="flex justify-between items-center bg-[#0e0e0d]/50 p-4 border border-white/5 rounded-xl">
                      <div className="max-w-[75%]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Order Timestamp</h4>
                      </div>
                      <button type="button"
                        onClick={() => setShowOrderTimestamp(!showOrderTimestamp)}
                        className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${showOrderTimestamp ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${showOrderTimestamp ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Configuration 3: Billing & Tax */}
                <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-7 shadow-xl space-y-6">
                  <h3 className="font-serif text-lg text-white font-medium tracking-wide border-b border-white/5 pb-4 select-none">Billing & Tax</h3>
                  <div className="space-y-4 font-sans select-none">
                    <div>
                      <label className="block text-[#A69984]/70 text-[9.5px] font-bold uppercase tracking-wider mb-2">Tax ID / VAT Number</label>
                      <input 
                        type="text" 
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="GB123456789"
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-mono uppercase"
                      />
                    </div>

                    <div className="flex justify-between items-center bg-[#0e0e0d]/50 p-4 border border-white/5 rounded-xl mt-2">
                      <div className="max-w-[70%]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Show Service Charge</h4>
                        <p className="text-[10.5px] text-[#A69984]/50 font-semibold leading-relaxed">
                          Include gratuity line automatically
                        </p>
                      </div>
                      <button type="button"
                        onClick={() => setShowServiceCharge(!showServiceCharge)}
                        className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${showServiceCharge ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${showServiceCharge ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Configuration 4: Footer Customization */}
                <div className="bg-[#161513]/90 border border-white/5 rounded-2xl p-7 shadow-xl space-y-6">
                  <h3 className="font-serif text-lg text-white font-medium tracking-wide border-b border-white/5 pb-4 select-none">Footer Customization</h3>
                  <div className="space-y-4 font-sans select-none">
                    <div>
                      <label className="block text-[#A69984]/70 text-[9.5px] font-bold uppercase tracking-wider mb-2">Custom Thank You Message</label>
                      <textarea 
                        rows={3}
                        value={thankYouMessage}
                        onChange={(e) => setThankYouMessage(e.target.value)}
                        placeholder="Type message..."
                        className="w-full bg-[#0e0e0d] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-between items-center bg-[#0e0e0d]/50 p-4 border border-white/5 rounded-xl mt-2">
                      <div className="max-w-[70%]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Feedback QR Code</h4>
                        <p className="text-[10.5px] text-[#A69984]/50 font-semibold leading-relaxed">
                          Link customers to digital survey
                        </p>
                      </div>
                      <button type="button"
                        onClick={() => setShowQrCode(!showQrCode)}
                        className={`w-[48px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${showQrCode ? 'bg-[#ffe2ab]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-[#0e0e0e] rounded-full shadow transition-transform duration-300 transform ${showQrCode ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}          

          {/* TAB 3: STAFF DIRECTORY */}
          {activeTab === 'staff' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Action Row & Page Headers */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-4">
                <div className="select-none">
                  <h2 className="font-serif text-[38px] font-bold text-white tracking-wide leading-none">
                    {tr.staffDirectory}
                  </h2>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 mt-3 leading-relaxed max-w-2xl font-semibold">
                    {tr.staffDesc}
                  </p>
                </div>

                <button type="button"
                  onClick={() => setShowAddEmployeeModal(true)}
                  className="bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] px-6 py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_4px_16px_rgba(255,226,171,0.15)] hover:scale-[1.01] cursor-pointer flex items-center gap-2 select-none"
                >
                  <span className="material-symbols-outlined text-sm font-bold">add</span>
                  Add employee
                </button>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Active Staff */}
                <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[130px]`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>TOTAL ACTIVE STAFF</p>
                      <h3 className={`text-2xl font-bold font-mono ${t.text} mt-1`}>142</h3>
                    </div>
                    <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                      <span className="material-symbols-outlined text-sm">work</span>
                    </div>
                  </div>
                </div>

                {/* On Shift Now */}
                <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[130px]`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>ON SHIFT NOW</p>
                      <h3 className={`text-2xl font-bold font-mono ${t.text} mt-1`}>38</h3>
                    </div>
                    <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                      <span className="material-symbols-outlined text-sm">schedule</span>
                    </div>
                  </div>
                </div>

                {/* Open Shifts */}
                <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[130px]`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>OPEN SHIFTS (NEXT 7 DAYS)</p>
                      <h3 className={`text-2xl font-bold font-mono ${t.text} mt-1`}>12</h3>
                    </div>
                    <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                      <span className="material-symbols-outlined text-sm">warning</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid: Employee Table + Shift Planner & Role Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Employee List Table (Span 8) */}
                <div className="lg:col-span-8 space-y-6">
                  <div className={`${t.cardBg} border rounded-2xl shadow-xl overflow-hidden`}>
                    {/* Table Filters & Search */}
                    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center select-none">
                      <div className="relative w-full md:w-[260px]">
                        <span className={`material-symbols-outlined absolute left-3 top-2.5 ${t.textMutedDark} text-sm`}>search</span>
                        <input
                          type="text"
                          placeholder="Search by name, role, or ID..."
                          value={staffSearchQuery}
                          onChange={(e) => setStaffSearchQuery(e.target.value)}
                          className={`bg-transparent border ${t.inputBorder} rounded-xl pl-9 pr-4 py-2 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/20 w-full transition-colors font-medium`}
                        />
                      </div>
                      
                      {/* Filter Tabs */}
                      <div className={`flex items-center gap-1.5 ${t.inputBg} p-1 rounded-xl border ${t.border}`}>
                        <button type="button"
                          onClick={() => setStaffRoleFilter('all')}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                            staffRoleFilter === 'all'
                              ? `${t.accentBg} ${t.accentText}`
                              : `${t.textMuted} hover:${t.text}`
                          }`}
                        >
                          All Roles
                        </button>
                        <button type="button"
                          onClick={() => setStaffRoleFilter('foh')}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                            staffRoleFilter === 'foh'
                              ? `${t.accentBg} ${t.accentText}`
                              : `${t.textMuted} hover:${t.text}`
                          }`}
                        >
                          Front of House
                        </button>
                        <button type="button"
                          onClick={() => setStaffRoleFilter('kitchen')}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                            staffRoleFilter === 'kitchen'
                              ? `${t.accentBg} ${t.accentText}`
                              : `${t.textMuted} hover:${t.text}`
                          }`}
                        >
                          Kitchen
                        </button>
                      </div>
                    </div>

      {/* PAIR DEVICE MODAL */}
      {showPairDeviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[420px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-lg ${t.accent} font-bold tracking-wide`}>Pair New Device</h3>
              <button type="button" 
                onClick={() => setShowPairDeviceModal(false)}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newDevice.name.trim()) {
                triggerToast('Please enter a device name.', 'info');
                return;
              }
              const newId = `DEV-${Math.floor(100 + Math.random() * 900)}`;
              const deviceToAdd = {
                id: newId,
                type: newDevice.type,
                name: newDevice.name,
                subtitle: newDevice.type === 'POS' ? 'Remote Station' : newDevice.type === 'PRINTER' ? 'Thermal Printer' : 'KDS Terminal',
                ipAddress: newDevice.ipAddress || '192.168.1.150',
                battery: '100% (Wired)',
                uptime: '0h 1m',
                status: 'ONLINE',
                details: newDevice.type === 'POS' ? 'Uptime: 0h 1m' : newDevice.type === 'PRINTER' ? 'Routing: Expo' : 'Syncing: Real-time'
              };
              setDevicesList([...devicesList, deviceToAdd]);
              setShowPairDeviceModal(false);
              setNewDevice({
                type: 'POS',
                name: '',
                ipAddress: '',
                status: 'ONLINE',
                details: ''
              });
              triggerToast(`Successfully paired device ${deviceToAdd.name}!`, 'success');
            }} className="space-y-4">
              {/* Type */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Device Type</label>
                <div className="relative">
                  <select
                    aria-label="Device type"
                    value={newDevice.type}
                    onChange={(e) => setNewDevice({...newDevice, type: e.target.value})}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="POS">POS Terminal</option>
                    <option value="PRINTER">Thermal Printer</option>
                    <option value="KDS">Kitchen Display System (KDS)</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Device Name</label>
                <input 
                  type="text" 
                  aria-label="Device name"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                  placeholder="e.g. Bar Printer Left"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                  required
                />
              </div>

              {/* IP Address */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>IP Address (Optional)</label>
                <input 
                  type="text" 
                  aria-label="IP address"
                  value={newDevice.ipAddress}
                  onChange={(e) => setNewDevice({...newDevice, ipAddress: e.target.value})}
                  placeholder="e.g. 192.168.1.110"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" 
                  onClick={() => setShowPairDeviceModal(false)}
                  className={`flex-1 py-3 bg-white/5 hover:${t.cardHover} ${t.text} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center`}
                >
                  Cancel
                </button>
                <button type="submit"
                  className={`flex-1 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center shadow-md`}
                >
                  Pair Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST ALERT */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`border-b ${t.border} ${t.inputBg}/50 text-[9.5px] font-bold ${t.textMuted} uppercase tracking-widest`}>
                            <th className="px-6 py-4">EMPLOYEE</th>
                            <th className="px-6 py-4">ROLE</th>
                            <th className="px-6 py-4">STATUS</th>
                            <th className="px-6 py-4">PERFORMANCE</th>
                            <th className="px-6 py-4 text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${t.divider} font-sans text-xs`}>
                          {staffMembers
                            .filter(member => {
                              // Filter by search query
                              const matchesSearch = member.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                                member.role.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                                member.id.toLowerCase().includes(staffSearchQuery.toLowerCase());
                              
                              // Filter by role category
                              if (staffRoleFilter === 'foh') {
                                  return matchesSearch && (member.role.toLowerCase().includes('sommelier') || member.role.toLowerCase().includes('maitre') || member.role.toLowerCase().includes('server') || member.role.toLowerCase().includes('wait'));
                              } else if (staffRoleFilter === 'kitchen') {
                                return matchesSearch && (member.role.toLowerCase().includes('chef') || member.role.toLowerCase().includes('kitchen') || member.role.toLowerCase().includes('cook'));
                              }
                              return matchesSearch;
                            })
                            .map((member) => (
                              <tr key={member.id} className={`hover:${t.cardHover} transition-colors`}>
                                <td className="px-6 py-4 flex items-center gap-3">
                                  {member.avatar ? (
                                    <div className={`w-[36px] h-[36px] rounded-lg overflow-hidden border ${t.borderStrong} flex-shrink-0`}>
                                      <img 
                                        src={member.avatar}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className={`w-[36px] h-[36px] rounded-lg ${t.accentLightBg} border ${t.accentLightBorder} ${t.accentLight} flex items-center justify-center font-bold text-xs flex-shrink-0`}>
                                      {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                  )}
                                  <div>
                                    <div className={`font-bold ${t.text} tracking-wide`}>{member.name}</div>
                                    <div className={`text-[10px] ${t.textMutedLight} font-semibold mt-0.5`}>ID: {member.id}</div>
                                  </div>
                                </td>
                                <td className={`px-6 py-4 ${t.text} opacity-80 align-middle`}>
                                  {member.role}
                                </td>
                                <td className="px-6 py-4 align-middle">
                                  {member.status === 'ON_SHIFT' && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold text-[9px] uppercase tracking-wider rounded-full">
                                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 motion-safe:animate-pulse"></span>
                                      + On Shift
                                    </span>
                                  )}
                                  {member.status === 'OFF_DUTY' && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border ${t.borderStrong} ${t.textMuted} font-bold text-[9px] uppercase tracking-wider rounded-full`}>
                                      Off Duty
                                    </span>
                                  )}
                                  {member.status === 'OVERTIME' && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[9px] uppercase tracking-wider rounded-full">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 motion-safe:animate-pulse"></span>
                                      Approaching (Overtime)
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 align-middle">
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex text-amber-400 select-none">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i} className="material-symbols-outlined text-[14px]">
                                          {i < Math.floor(member.performance) ? 'star' : 'star_border'}
                                        </span>
                                      ))}
                                    </div>
                                    <span className={`font-bold ${t.text} font-mono text-[10.5px]`}>{member.performance.toFixed(1)}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 align-middle text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingEmployee(member);
                                        setNewEmployee({
                                          name: member.name,
                                          role: member.role,
                                          status: member.status,
                                          performance: member.performance
                                        });
                                        setShowAddEmployeeModal(true);
                                      }}
                                      className={`p-1.5 rounded-lg hover:${t.cardHover} ${t.textMuted} hover:${t.accent} transition-colors cursor-pointer flex items-center justify-center`}
                                      title="Edit Employee"
                                    >
                                      <span className="material-symbols-outlined text-base">edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to delete ${member.name}?`)) {
                                          setStaffMembers(staffMembers.filter(m => m.id !== member.id));
                                          triggerToast(`Successfully deleted employee ${member.name}!`, 'success');
                                        }
                                      }}
                                      className={`p-1.5 rounded-lg hover:${t.cardHover} ${t.textMuted} hover:text-red-400 transition-colors cursor-pointer flex items-center justify-center`}
                                      title="Delete Employee"
                                    >
                                      <span className="material-symbols-outlined text-base">delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* View All Staff bottom action */}
                    <div className={`p-4 border-t ${t.border} ${t.inputBg}/30 text-center select-none`}>
                      <button type="button" 
                        onClick={() => triggerToast('Loading complete personnel list...', 'info')}
                        className={`text-[10px] ${t.accent} hover:opacity-80 uppercase font-bold tracking-widest inline-flex items-center gap-1 transition-colors cursor-pointer`}
                      >
                        View All Staff
                        <span className="material-symbols-outlined text-xs">keyboard_arrow_down</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Shift Planner & Role Distribution (Span 4) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Shift Planner Card */}
                  <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl space-y-5`}>
                    <div className={`flex justify-between items-center border-b ${t.border} pb-3 select-none`}>
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined ${t.accent} text-lg font-light`}>calendar_today</span>
                        <h3 className={`font-serif text-sm ${t.text} font-bold tracking-wide`}>Shift Planner</h3>
                      </div>
                      <span className={`material-symbols-outlined ${t.textMutedDark} text-sm`}>edit_calendar</span>
                    </div>

                    <div className={`flex justify-between items-center ${t.inputBg}/50 py-2.5 px-4 border ${t.border} rounded-xl text-xs select-none`}>
                      <button type="button" onClick={() => triggerToast('Previous day...', 'info')} className={`${t.textMuted} hover:${t.text} font-bold`}>{"<"}</button>
                      <span className={`${t.text} font-bold tracking-wider font-mono`}>Today, Oct 24</span>
                      <button type="button" onClick={() => triggerToast('Next day...', 'info')} className={`${t.textMuted} hover:${t.text} font-bold`}>{">"}</button>
                    </div>

                    <div className="space-y-4">
                      {/* Dinner Service Card */}
                      <div className={`${t.inputBg}/30 border ${t.border} rounded-xl p-4 space-y-3`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`text-[11px] ${t.text} font-bold uppercase tracking-wider`}>Dinner Service</h4>
                            <div className={`flex items-center gap-1.5 text-[9.5px] font-mono ${t.textMuted} mt-1`}>
                              <span className="material-symbols-outlined text-[10px]">schedule</span>
                              16:00 - 00:00
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[8px] uppercase tracking-wider rounded">
                            Short Staffed
                          </span>
                        </div>
                        {/* Avatar stack */}
                        <div className="flex -space-x-2.5 overflow-hidden select-none">
                          <img
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-[#161513] object-cover"
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop"
                            alt="Elena"
                          />
                          <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-bold ring-2 ring-[#161513]">
                            MC
                          </div>
                          <img
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-[#161513] object-cover"
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                            alt="Sarah"
                          />
                          <div className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${t.tagAdmin} text-[8px] font-bold ring-2 ring-[#161513]`}>
                            +2
                          </div>
                        </div>
                      </div>

                      {/* Closing Prep Card */}
                      <div className={`${t.inputBg}/30 border ${t.border} rounded-xl p-4 space-y-3`}>
                        <div>
                          <h4 className={`text-[11px] ${t.text} font-bold uppercase tracking-wider`}>Closing Prep</h4>
                          <div className={`flex items-center gap-1.5 text-[9.5px] font-mono ${t.textMuted} mt-1`}>
                            <span className="material-symbols-outlined text-[10px]">schedule</span>
                            22:00 - 02:00
                          </div>
                        </div>
                        {/* Avatar stack */}
                        <div className="flex -space-x-2.5 overflow-hidden select-none">
                          <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-bold ring-2 ring-[#161513]">
                            MC
                          </div>
                          <img
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-[#161513] object-cover"
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                            alt="Sarah"
                          />
                          <div className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${t.tagAdmin} text-[8px] font-bold ring-2 ring-[#161513]`}>
                            +1
                          </div>
                        </div>
                      </div>
                    </div>

                    <button type="button" 
                      onClick={() => triggerToast('Opening scheduler dashboard...', 'info')}
                      className={`w-full py-3 bg-transparent border ${t.buttonOutline} font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none`}
                    >
                      Manage Schedule
                    </button>
                  </div>

                  {/* Role Distribution Card */}
                  <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl space-y-5`}>
                    <div className={`border-b ${t.border} pb-3 select-none`}>
                      <h3 className={`font-serif text-sm ${t.text} font-bold tracking-wide`}>Role Distribution</h3>
                      <p className={`text-[10px] ${t.textMuted} font-semibold mt-1`}>Current active personnel breakdown.</p>
                    </div>

                    <div className="space-y-4 font-sans select-none">
                      {/* FOH */}
                      <div className="space-y-1.5">
                        <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider ${t.text}`}>
                          <span>Front of House</span>
                          <span className={t.accent}>45%</span>
                        </div>
                        <div className={`w-full ${t.inputBg} h-[6px] rounded-full overflow-hidden`}>
                          <div className={`${t.accentBg} h-full rounded-full`} style={{ width: '45%' }}></div>
                        </div>
                      </div>

                      {/* Kitchen */}
                      <div className="space-y-1.5">
                        <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider ${t.text}`}>
                          <span>Kitchen Staff</span>
                          <span className={t.accent}>35%</span>
                        </div>
                        <div className={`w-full ${t.inputBg} h-[6px] rounded-full overflow-hidden`}>
                          <div className={`${t.accentBg} h-full rounded-full`} style={{ width: '35%' }}></div>
                        </div>
                      </div>

                      {/* Management */}
                      <div className="space-y-1.5">
                        <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider ${t.text}`}>
                          <span>Management</span>
                          <span className={t.accent}>10%</span>
                        </div>
                        <div className={`w-full ${t.inputBg} h-[6px] rounded-full overflow-hidden`}>
                          <div className={`${t.accentBg} h-full rounded-full`} style={{ width: '10%' }}></div>
                        </div>
                      </div>

                      {/* Support / Cleaning */}
                      <div className="space-y-1.5">
                        <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider ${t.text}`}>
                          <span>Support / Cleaning</span>
                          <span className={t.accent}>10%</span>
                        </div>
                        <div className={`w-full ${t.inputBg} h-[6px] rounded-full overflow-hidden`}>
                          <div className={`${t.accentBg} h-full rounded-full`} style={{ width: '10%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Roster & Weekly Timeline Section */}
              <div className={`${t.cardBg} border rounded-2xl p-7 shadow-xl space-y-6`}>
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center border-b ${t.border} pb-4 gap-4 select-none`}>
                  <div>
                    <h3 className={`font-serif text-lg ${t.text} font-medium tracking-wide`}>Roster & Weekly Timeline</h3>
                    <p className={`text-[10px] ${t.textMuted} font-semibold mt-1`}>November 13 - November 19, 2025</p>
                  </div>
                  
                  {/* Timeline selector */}
                  <div className={`flex items-center gap-1 ${t.inputBg} p-1 rounded-xl border ${t.border}`}>
                    <button type="button"
                      onClick={() => setTimelineTab('timeline')}
                      className={`px-4 py-1.5 text-[9.5px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        timelineTab === 'timeline'
                          ? `${t.accentBg} ${t.accentText}`
                          : `${t.textMuted} hover:${t.text}`
                      }`}
                    >
                      Timeline
                    </button>
                    <button type="button"
                      onClick={() => setTimelineTab('month')}
                      className={`px-4 py-1.5 text-[9.5px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        timelineTab === 'month'
                          ? `${t.accentBg} ${t.accentText}`
                          : `${t.textMuted} hover:${t.text}`
                      }`}
                    >
                      Month
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto select-none">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className={`border-b ${t.border} text-[9.5px] font-bold ${t.textMuted} uppercase tracking-widest ${t.inputBg}/20`}>
                        <th className="px-6 py-4">STAFF</th>
                        <th className="px-4 py-4 text-center">MON 13</th>
                        <th className="px-4 py-4 text-center">TUE 14</th>
                        <th className="px-4 py-4 text-center">WED 15</th>
                        <th className="px-4 py-4 text-center">THU 16</th>
                        <th className="px-4 py-4 text-center">FRI 17</th>
                        <th className="px-4 py-4 text-center">SAT 18</th>
                        <th className="px-4 py-4 text-center">SUN 19</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.divider} font-sans text-xs text-[#A69984]/80`}>
                      
                      {/* Row 1: Marco R. */}
                      <tr className={`hover:${t.cardHover} transition-colors`}>
                        <td className={`px-6 py-4 font-bold ${t.text}`}>
                          <div>Marco R.</div>
                          <div className={`text-[9px] ${t.accentLight} uppercase tracking-wider font-semibold mt-0.5`}>Kitchen</div>
                        </td>
                        {['MON 13', 'TUE 14', 'WED 15', 'THU 16', 'FRI 17', 'SAT 18', 'SUN 19'].map(day => {
                          const shift = rosterShifts['Marco R.']?.[day] || 'OFF';
                          const isSpecial = shift === '09:00 - 22:00';
                          const isOff = shift === 'OFF';
                          return (
                            <td key={day} className={`px-4 py-4 text-center cursor-pointer hover:${t.cardHover} transition-colors`} onClick={() => setEditingShift({ employee: 'Marco R.', day })}>
                              {isOff ? (
                                <span className={`text-[10px] font-bold ${t.textMutedDark} uppercase tracking-wider`}>OFF</span>
                              ) : isSpecial ? (
                                <span className={`px-3 py-1.5 ${t.accentLightBg} border ${t.accentLightBorder} ${t.accent} font-bold font-mono text-[10px] rounded-lg shadow-sm`}>
                                  {shift}
                                </span>
                              ) : (
                                <span className={`text-[10px] font-medium font-mono ${t.textMuted}`}>{shift}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Row 2: Sarah J. */}
                      <tr className={`hover:${t.cardHover} transition-colors`}>
                        <td className={`px-6 py-4 font-bold ${t.text}`}>
                          <div>Sarah J.</div>
                          <div className={`text-[9px] ${t.accentLight} uppercase tracking-wider font-semibold mt-0.5`}>Maitre D'</div>
                        </td>
                        {['MON 13', 'TUE 14', 'WED 15', 'THU 16', 'FRI 17', 'SAT 18', 'SUN 19'].map(day => {
                          const shift = rosterShifts['Sarah J.']?.[day] || 'OFF';
                          const isOff = shift === 'OFF';
                          return (
                            <td key={day} className={`px-4 py-4 text-center cursor-pointer hover:${t.cardHover} transition-colors`} onClick={() => setEditingShift({ employee: 'Sarah J.', day })}>
                              {isOff ? (
                                <span className={`text-[10px] font-bold ${t.textMutedDark} uppercase tracking-wider`}>OFF</span>
                              ) : (
                                <span className={`text-[10px] font-medium font-mono ${t.textMuted}`}>{shift}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Cards: Role Management & Permissions Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Card: Role Management */}
                <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl space-y-5`}>
                  <div className={`border-b ${t.border} pb-3 select-none`}>
                    <h3 className={`font-serif text-base ${t.text} font-bold tracking-wide`}>Role Management</h3>
                    <p className={`text-[10px] ${t.textMuted} font-semibold mt-1`}>Quickly audit permissions and visibility for operational roles.</p>
                  </div>

                  <div className="space-y-3 font-sans select-none">
                    <button type="button"
                      onClick={() => triggerToast('Opening Managers Role permissions...', 'info')}
                      className={`w-full flex justify-between items-center ${t.inputBg}/50 p-4 border ${t.border} hover:${t.borderStrong} rounded-xl transition-all cursor-pointer text-left font-sans font-bold`}
                    >
                      <span className={`text-xs font-bold ${t.text} uppercase tracking-wider`}>Managers</span>
                      <span className={`material-symbols-outlined ${t.accent} text-sm`}>chevron_right</span>
                    </button>

                    <button type="button"
                      onClick={() => triggerToast('Opening Waitstaff Role permissions...', 'info')}
                      className={`w-full flex justify-between items-center ${t.inputBg}/50 p-4 border ${t.border} hover:${t.borderStrong} rounded-xl transition-all cursor-pointer text-left font-sans font-bold`}
                    >
                      <span className={`text-xs font-bold ${t.text} uppercase tracking-wider`}>Waitstaff</span>
                      <span className={`material-symbols-outlined ${t.accent} text-sm`}>chevron_right</span>
                    </button>

                    <button type="button"
                      onClick={() => triggerToast('Opening Kitchen Role permissions...', 'info')}
                      className={`w-full flex justify-between items-center ${t.inputBg}/50 p-4 border ${t.border} hover:${t.borderStrong} rounded-xl transition-all cursor-pointer text-left font-sans font-bold`}
                    >
                      <span className={`text-xs font-bold ${t.text} uppercase tracking-wider`}>Kitchen</span>
                      <span className={`material-symbols-outlined ${t.accent} text-sm`}>chevron_right</span>
                    </button>
                  </div>
                </div>

                {/* Right Card: Permissions Matrix */}
                <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl space-y-5`}>
                  <div className={`border-b ${t.border} pb-3 select-none flex items-center gap-2`}>
                    <span className={`material-symbols-outlined ${t.accent} text-lg`}>key</span>
                    <div>
                      <h3 className={`font-serif text-base ${t.text} font-bold tracking-wide`}>Permissions Matrix</h3>
                      <p className={`text-[10px] ${t.textMuted} font-semibold mt-1`}>Global access control for system-critical settings.</p>
                    </div>
                  </div>

                  <div className="space-y-3 font-sans select-none">
                    
                    {/* Item 1 */}
                    <div className={`flex justify-between items-center ${t.inputBg}/50 p-3.5 border ${t.border} rounded-xl`}>
                      <span className={`text-xs font-bold ${t.text} tracking-wide`}>Edit Receipt Configuration</span>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 ${t.tagAdmin} font-bold text-[8px] uppercase tracking-wider rounded`}>
                          Admin Only
                        </span>
                        <button type="button" onClick={() => triggerToast('Receipt permission rules configuration...', 'info')} className={`${t.textMutedDark} hover:${t.text} transition-colors cursor-pointer select-none`}>
                          <span className="material-symbols-outlined text-sm leading-none">settings</span>
                        </button>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className={`flex justify-between items-center ${t.inputBg}/50 p-3.5 border ${t.border} rounded-xl`}>
                      <span className={`text-xs font-bold ${t.text} tracking-wide`}>Void Transactions</span>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 ${t.tagManager} font-bold text-[8px] uppercase tracking-wider rounded`}>
                          Manager+
                        </span>
                        <button type="button" onClick={() => triggerToast('Void permission rules configuration...', 'info')} className={`${t.textMutedDark} hover:${t.text} transition-colors cursor-pointer select-none`}>
                          <span className="material-symbols-outlined text-sm leading-none">settings</span>
                        </button>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className={`flex justify-between items-center ${t.inputBg}/50 p-3.5 border ${t.border} rounded-xl`}>
                      <span className={`text-xs font-bold ${t.text} tracking-wide`}>Access Admin Dashboard</span>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 ${t.tagStaff} font-bold text-[8px] uppercase tracking-wider rounded`}>
                          Full Staff
                        </span>
                        <button type="button" onClick={() => triggerToast('Dashboard permission rules configuration...', 'info')} className={`${t.textMutedDark} hover:${t.text} transition-colors cursor-pointer select-none`}>
                          <span className="material-symbols-outlined text-sm leading-none">settings</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Action Row & Page Headers */}
              <div className={`flex flex-col md:flex-row justify-between items-start md:items-end border-b ${t.border} pb-6 gap-4`}>
                <div className="select-none">
                  <h2 className={`font-serif text-[38px] font-bold ${t.text} tracking-wide leading-none`}>
                    {tr.subAndBilling}
                  </h2>
                  <p className={`font-sans text-[12.5px] ${t.textMuted} mt-3 leading-relaxed max-w-2xl font-semibold`}>
                    {tr.subDesc}
                  </p>
                </div>

                {/* Download Statements trigger */}
                <button type="button"
                  onClick={() => triggerToast('Compiling financial statements download...', 'success')}
                  className={`bg-transparent border ${t.buttonOutline} px-6 py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] cursor-pointer flex items-center gap-2 select-none`}
                >
                  {tr.downloadStatements}
                </button>
              </div>

              {/* Plan Details and Payment Method Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Plan Card (Span 8) */}
                <div className="lg:col-span-8">
                  <div className={`${t.cardBg} border rounded-2xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[250px]`}>
                    {/* Checkmark Watermark Background */}
                    <div className="absolute right-6 bottom-4 text-white/[0.02] pointer-events-none select-none">
                      <span className="material-symbols-outlined text-[140px] leading-none">verified</span>
                    </div>

                    <div className="space-y-6 z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2 py-0.5 text-[8.5px] rounded bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold uppercase tracking-wider select-none leading-none">
                            {tr.currentPlan}
                          </span>
                          <h3 className={`font-serif text-3xl font-bold ${t.text} mt-2.5`}>{tr.planName}</h3>
                          <p className={`text-[11px] ${t.textMutedLight} font-semibold mt-1`}>
                            {tr.planBilling}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`font-serif text-3xl font-bold ${t.text}`}>{formatCurrency(2499)}</span>
                          <span className={`text-xs ${t.textMuted} font-semibold`}> / yr</span>
                        </div>
                      </div>

                      {/* Stat meters */}
                      <div className="grid grid-cols-2 gap-8 pt-2">
                        <div className="space-y-1">
                          <span className={`text-[9.5px] ${t.textMuted} font-bold uppercase tracking-wider block`}>{tr.activeTerminals}</span>
                          <div className={`text-sm font-bold ${t.text}`}>12 / 15</div>
                        </div>
                        <div className="space-y-1">
                          <span className={`text-[9.5px] ${t.textMuted} font-bold uppercase tracking-wider block`}>{tr.cloudStorage}</span>
                          <div className={`text-sm font-bold ${t.text}`}>2.4 TB / 5 TB</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-6 z-10 select-none">
                      <button type="button" 
                        onClick={() => triggerToast('Opening subscription plan switcher...', 'info')}
                        className={`bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-sans font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md cursor-pointer`}
                      >
                        {tr.changePlan}
                      </button>
                      <button type="button" 
                        onClick={() => triggerToast('Opening add-ons marketplace...', 'info')}
                        className={`bg-transparent border ${t.buttonOutline} font-sans font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300 cursor-pointer`}
                      >
                        {tr.manageAddons}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Method Card (Span 4) */}
                <div className="lg:col-span-4">
                  <div className={`${t.cardBg} border rounded-2xl p-8 shadow-xl min-h-[250px] flex flex-col justify-between`}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center select-none">
                        <h3 className={`font-serif text-sm ${t.text} font-bold tracking-wide`}>{tr.paymentMethod}</h3>
                        <button type="button" 
                          onClick={() => triggerToast('Opening payment edit forms...', 'info')}
                          className="text-[9.5px] text-[#ffe2ab] font-bold tracking-widest hover:text-white uppercase transition-colors cursor-pointer"
                        >
                          {tr.editBtn}
                        </button>
                      </div>

                      {/* Mock Credit Card */}
                      <div className={`${t.inputBg}/50 border ${t.border} rounded-xl p-5 flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-8 rounded border ${t.borderStrong} bg-black/40 flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-[#e5e2e1]/70 text-lg">credit_card</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 font-sans text-xs font-bold text-white tracking-widest">
                              •••• •••• •••• <span className="text-sm font-mono font-bold text-white tracking-normal">4242</span>
                            </div>
                            <div className={`text-[9.5px] ${t.textMuted} font-bold mt-1`}>Expires 12/25</div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded border border-white/10 text-[8.5px] text-[#A69984]/50 font-bold uppercase tracking-wider select-none leading-none">
                          {tr.defaultMethod}
                        </span>
                      </div>
                    </div>

                    <button type="button" 
                      onClick={() => triggerToast('Opening payment method adder...', 'info')}
                      className={`w-full py-3 bg-transparent border border-dashed ${t.borderStrong} hover:border-white/20 text-[#A69984] font-sans font-bold text-[9.5px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-4`}
                    >
                      <span className="material-symbols-outlined text-sm font-bold">add</span>
                      {tr.addBackupMethod}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stripe Merchant Integration Card (Span 12) */}
              <div className={`${t.cardBg} border rounded-2xl p-8 shadow-xl relative overflow-hidden font-sans`}>
                <div className="absolute right-6 top-6 text-white/[0.02] pointer-events-none select-none">
                  <span className="material-symbols-outlined text-[100px] leading-none">account_balance</span>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 select-none">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#635bff] animate-pulse"></span>
                        <h3 className={`font-serif text-lg ${t.text} font-bold tracking-wide`}>Stripe Merchant Integration</h3>
                      </div>
                      <p className={`text-xs ${t.textMuted} mt-1.5 leading-relaxed max-w-3xl`}>
                        Connect your restaurant's Stripe merchant account to process customer self-checkout payments. All transactions completed at customer tables will be automatically processed and routed to your linked Stripe account.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 select-none shrink-0">
                      <span className={`text-[10px] font-bold ${t.textMuted} uppercase tracking-wider`}>Owner Account:</span>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                        <span className="material-symbols-outlined text-xs text-[#ffe2ab]">person</span>
                        <span className="text-[11px] font-mono font-bold text-white/90">{activeAdminEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`border-t ${t.border} pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center`}>
                    
                    {/* Status Display Area */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>Integration Status</span>
                        {linkedStripeAccount ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-[9px] uppercase tracking-wider rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 font-bold text-[9px] uppercase tracking-wider rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                            Not Configured
                          </span>
                        )}
                      </div>

                      {linkedStripeAccount ? (
                        <div className={`${t.inputBg}/45 border border-emerald-500/10 rounded-xl p-4 space-y-2.5`}>
                          <div className="flex justify-between items-center text-xs">
                            <span className={`${t.textMuted}`}>Stripe Account ID:</span>
                            <span className="font-mono font-bold text-white text-[12.5px] select-text">{linkedStripeAccount}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10.5px]">
                            <span className={`${t.textMuted}`}>Linked On:</span>
                            <span className="text-white/70 font-semibold">
                              {(() => {
                                const connStr = localStorage.getItem('dinepos_stripe_connections');
                                if (connStr) {
                                  try {
                                    const connections = JSON.parse(connStr);
                                    if (connections[activeAdminEmail]?.linkedAt) {
                                      return new Date(connections[activeAdminEmail].linkedAt).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                      });
                                    }
                                  } catch (e) {}
                                }
                                return 'Just now';
                              })()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-[11px] ${t.textMutedLight} leading-relaxed font-medium`}>
                          No Stripe account is connected for this Owner Admin. Customers will be unable to use self-checkout at their tables until an account is connected.
                        </p>
                      )}
                    </div>

                    {/* Linking Form Action Area */}
                    <div className="lg:col-span-7">
                      {linkedStripeAccount ? (
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-end">
                          <p className={`text-[11px] ${t.textMuted} text-left sm:text-right max-w-sm font-semibold`}>
                            Need to update your connection? Disconnect your current Stripe configuration to connect a new merchant account.
                          </p>
                          <button
                            type="button"
                            onClick={disconnectStripeAccount}
                            className="px-6 py-3.5 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-950/60 text-rose-300 font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer text-center whitespace-nowrap shrink-0"
                          >
                            Disconnect Stripe
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                          <div className="flex-1 w-full space-y-2">
                            <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider`}>Enter Stripe Account ID</label>
                            <div className="relative">
                              <span className="material-symbols-outlined absolute left-4 top-3 text-[#A69984]/40 text-lg leading-none">key</span>
                              <input
                                type="text"
                                value={stripeAccountIdInput}
                                onChange={(e) => setStripeAccountIdInput(e.target.value)}
                                placeholder="acct_1x9u82HfdK72"
                                className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl pl-11 pr-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-mono`}
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={linkStripeAccount}
                            className="w-full sm:w-auto px-6 py-3.5 bg-[#ffc53d] hover:bg-[#ffb014] text-[#2c1a00] font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer text-center whitespace-nowrap shrink-0"
                          >
                            Link Stripe Account
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* Invoices segment */}
              <div className={`${t.cardBg} border rounded-2xl shadow-xl overflow-hidden`}>
                <div className={`p-6 border-b ${t.border} flex justify-between items-center select-none`}>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined ${t.accent} text-lg`}>receipt_long</span>
                    <h3 className={`font-serif text-base ${t.text} font-bold tracking-wide`}>{tr.invoiceLedger}</h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${t.border} ${t.inputBg}/50 text-[9.5px] font-bold ${t.textMuted} uppercase tracking-widest`}>
                        <th className="px-6 py-4">{tr.dateCol}</th>
                        <th className="px-6 py-4">{tr.descCol}</th>
                        <th className="px-6 py-4 text-right">{tr.amountCol}</th>
                        <th className="px-6 py-4">{tr.statusCol}</th>
                        <th className="px-6 py-4 text-center">{tr.actionCol}</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.divider} font-sans text-xs`}>
                      
                      {/* Row 1 */}
                      <tr className={`hover:${t.cardHover} transition-colors font-semibold`}>
                        <td className={`px-6 py-4.5 ${t.textMuted}`}>Nov 15, 2024</td>
                        <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>Enterprise Growth - Annual Renewal</td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold ${t.text}`}>$2,499.00</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/5 border border-white/10 text-[#A69984]/50 font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Upcoming
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button type="button" 
                            onClick={() => triggerToast('Downloading invoice preview...', 'success')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer mx-auto`}
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                          </button>
                        </td>
                      </tr>

                      {/* Row 2 */}
                      <tr className={`hover:${t.cardHover} transition-colors font-semibold`}>
                        <td className={`px-6 py-4.5 ${t.textMuted}`}>Oct 01, 2024</td>
                        <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>Hardware Add-on: Kitchen Display x2</td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold ${t.text}`}>$450.00</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button type="button" 
                            onClick={() => triggerToast('Downloading receipt...', 'success')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer mx-auto`}
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                          </button>
                        </td>
                      </tr>

                      {/* Row 3 */}
                      <tr className={`hover:${t.cardHover} transition-colors font-semibold`}>
                        <td className={`px-6 py-4.5 ${t.textMuted}`}>Nov 15, 2023</td>
                        <td className={`px-6 py-4.5 font-serif font-bold text-white text-[13.5px]`}>Enterprise Growth - Annual</td>
                        <td className={`px-6 py-4.5 text-right font-mono font-bold ${t.text}`}>$2,499.00</td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#ffc53d]/10 border border-[#ffc53d]/20 text-[#ffc53d] font-bold text-[8.5px] uppercase tracking-wider rounded-md">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button type="button" 
                            onClick={() => triggerToast('Downloading receipt...', 'success')}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-[#e5e2e1] transition-colors cursor-pointer mx-auto`}
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                          </button>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

              {/* Copy footer */}
              <footer className={`mt-16 pt-6 border-t ${t.border} flex flex-col sm:flex-row justify-between items-center text-[10px] ${t.textMutedLight} font-semibold tracking-wider uppercase select-none gap-4`}>
                <div>© 2026 DinePosAi. All rights reserved.</div>
                <div className="flex gap-6">
                  <Link href="/privacy" className={`hover:${t.text} transition-colors`}>Privacy Policy</Link>
                  <Link href="/terms" className={`hover:${t.text} transition-colors`}>Terms of Service</Link>
                </div>
              </footer>

            </div>
          )}

          {/* TAB 5: HARDWARE SCREEN (Redesigned matching user mockup) */}
          {activeTab === 'hardware' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Action Row & Page Headers */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-4">
                <div className="select-none">
                  <h2 className="font-serif text-[38px] font-bold text-white tracking-wide leading-none">
                    {tr.hardwareFleet}
                  </h2>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 mt-3 leading-relaxed max-w-2xl font-semibold">
                    {tr.hardwareDesc}
                  </p>
                </div>

                <div className="flex gap-4 items-center">
                  <Link
                    href="/dashboard/printer-settings"
                    className="text-[#ffe2ab] hover:text-[#ffdca0] px-4 py-2 text-xs uppercase tracking-widest font-sans font-bold transition-colors cursor-pointer flex items-center gap-1.5 select-none border border-[#ffe2ab]/20 rounded-xl bg-white/5 hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-base">print_connect</span>
                    Printer Console
                  </Link>
                  <button type="button"
                    onClick={() => setShowPairDeviceModal(true)}
                    className="text-[#ffe2ab] hover:text-[#ffdca0] px-4 py-2 text-xs uppercase tracking-widest font-sans font-bold transition-colors cursor-pointer flex items-center gap-1.5 select-none"
                  >
                    <span className="material-symbols-outlined text-base">add_circle</span>
                    {tr.pairNewDevice}
                  </button>
                </div>
              </div>

              {/* Row 1: Fleet Health & Active Diagnostics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                             {/* Fleet Health Card (Left Column - Span 5) */}
                <div className={`${t.cardBg} border rounded-2xl p-7 shadow-xl flex flex-col justify-between min-h-[220px]`}>
                  <div className="select-none space-y-1">
                    <h3 className={`text-[10px] font-sans font-bold uppercase tracking-wider ${t.textMuted}`}>FLEET HEALTH</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className={`font-sans font-bold text-5xl ${t.text} tracking-tight`}>98</span>
                      <span className={`font-sans font-bold text-2xl ${t.textMuted}`}>%</span>
                    </div>
                    <p className={`text-[11.5px] ${t.textMuted} font-semibold leading-relaxed mt-2`}>
                      Optimal connectivity across all zones.
                    </p>
                  </div>

                  <div className={`border-t ${t.border} pt-4 mt-6 grid grid-cols-3 gap-2 select-none text-[10.5px] font-sans font-semibold`}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className={`${t.textMuted}`}>Terminals</span>
                      <span className={`font-bold ml-auto font-mono ${t.text}`}>12/12</span>
                    </div>
                    <div className={`flex items-center gap-1.5 border-l ${t.border} pl-3`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className={`${t.textMuted}`}>Printers</span>
                      <span className={`font-bold ml-auto font-mono ${t.text}`}>4/5</span>
                    </div>
                    <div className={`flex items-center gap-1.5 border-l ${t.border} pl-3`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className={`${t.textMuted}`}>KDS</span>
                      <span className={`font-bold ml-auto font-mono ${t.text}`}>3/3</span>
                    </div>
                  </div>
                </div>

                {/* Active Diagnostics Card (Right Column - Span 7) */}
                <div className={`${t.cardBg} border rounded-2xl p-7 shadow-xl space-y-4`}>
                  <div className={`flex justify-between items-center border-b ${t.border} pb-3 select-none`}>
                    <h3 className={`text-[10px] font-sans font-bold uppercase tracking-wider ${t.textMuted}`}>ACTIVE DIAGNOSTICS</h3>
                    <button type="button" 
                      onClick={() => triggerToast('Refreshing hardware diagnostics...', 'info')}
                      className={`${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
                    >
                      <span className="material-symbols-outlined text-base">refresh</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[160px] overflow-y-auto">
                    {activeAlerts.length === 0 ? (
                      <div className={`text-center py-6 text-xs ${t.textMuted} font-bold uppercase tracking-wider`}>
                        All systems operational. No active diagnostics alerts.
                      </div>
                    ) : (
                      activeAlerts.map((alert) => (
                        <div key={alert.id} className={`${t.inputBg}/50 p-4 border ${t.border} rounded-xl flex items-start gap-4`}>
                          <div className={`w-9 h-9 rounded-lg ${t.tagAdmin} flex items-center justify-center ${t.accent} flex-shrink-0 select-none`}>
                            <span className="material-symbols-outlined text-[17px]">
                              {alert.updateBtn ? 'router' : 'print'}
                            </span>
                          </div>
                          <div className="flex-grow font-sans">
                            <div className="flex justify-between items-baseline select-none">
                              <h4 className={`text-xs font-bold ${t.text} tracking-wide`}>{alert.title}</h4>
                              <span className={`text-[9.5px] ${t.textMuted} font-mono font-medium`}>{alert.time}</span>
                            </div>
                            <p className={`text-[10.5px] ${t.textMuted} font-semibold leading-relaxed mt-1`}>
                              {alert.text}
                            </p>
                            <div className="flex gap-4 mt-2.5">
                              {alert.updateBtn ? (
                                <button type="button" 
                                  onClick={() => handleStartRouterUpdate(alert.id)}
                                  disabled={routerUpdateProgress !== null}
                                  className={`text-[9.5px] font-bold ${t.accent} hover:opacity-85 uppercase tracking-wider transition-colors cursor-pointer select-none disabled:opacity-50`}
                                >
                                  {routerUpdateProgress !== null ? `Updating (${routerUpdateProgress}%)` : 'Schedule Update'}
                                </button>
                              ) : (
                                <>
                                  <button type="button" 
                                    onClick={() => {
                                      triggerToast('Diagnostic log acknowledged.', 'success');
                                      setActiveAlerts(activeAlerts.filter(a => a.id !== alert.id));
                                    }}
                                    className={`text-[9.5px] font-bold ${t.textMuted} hover:${t.text} uppercase tracking-wider transition-colors cursor-pointer select-none`}
                                  >
                                    Acknowledge
                                  </button>
                                  <button type="button" 
                                    onClick={() => triggerToast('Initializing remote print calibration diagnostic...', 'info')}
                                    className={`text-[9.5px] font-bold ${t.accent} hover:opacity-85 uppercase tracking-wider transition-colors cursor-pointer select-none`}
                                  >
                                    Run Diagnostic
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* POS Terminals Grid Section */}
              <div className="space-y-5">
                <h3 className={`font-serif text-[18px] font-bold ${t.text} tracking-wide select-none`}>POS Terminals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {devicesList
                    .filter(dev => dev.type === 'POS')
                    .map((dev) => (
                      <div key={dev.id} className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[200px]`}>
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3 select-none">
                              <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                                <span className="material-symbols-outlined text-[16px]">tablet_mac</span>
                              </div>
                              <div>
                                <h4 className={`text-white font-bold text-xs tracking-wider uppercase ${t.text}`}>{dev.name}</h4>
                                <p className={`text-[10px] ${t.textMuted} font-semibold mt-0.5`}>{dev.subtitle}</p>
                              </div>
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          </div>

                          <div className="space-y-2 text-[10.5px] font-sans font-semibold">
                            <div className="flex justify-between">
                              <span className={`text-[#A69984]/40 uppercase tracking-wider text-[9px] ${t.textMutedLight}`}>IP Address</span>
                              <span className={`font-mono ${t.text}`}>{dev.ipAddress}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`text-[#A69984]/40 uppercase tracking-wider text-[9px] ${t.textMutedLight}`}>Battery</span>
                              <span className={`flex items-center gap-1 ${t.text}`}>
                                {dev.battery === '100% (Wired)' ? (
                                  <>
                                    <span className={`material-symbols-outlined text-[11px] ${t.accent}`}>bolt</span>
                                    Wired
                                  </>
                                ) : (
                                  dev.battery
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`text-[#A69984]/40 uppercase tracking-wider text-[9px] ${t.textMutedLight}`}>Uptime</span>
                              <span className={`font-mono ${t.text}`}>{dev.uptime}</span>
                            </div>
                          </div>
                        </div>

                        <button type="button" 
                          onClick={() => triggerToast(`Loading Terminal settings console for ${dev.name}...`, 'info')}
                          className={`w-full mt-5 py-2.5 bg-transparent border ${t.buttonOutline} font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none`}
                        >
                          Manage
                        </button>
                      </div>
                  ))}
                </div>
              </div>

              {/* Printers Grid Section */}
              <div className="space-y-5">
                <h3 className={`font-serif text-[18px] font-bold ${t.text} tracking-wide select-none`}>Printers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {devicesList
                    .filter(dev => dev.type === 'PRINTER')
                    .map((dev) => (
                      <div key={dev.id} className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[170px]`}>
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3 select-none">
                              <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                                <span className="material-symbols-outlined text-[16px]">print</span>
                              </div>
                              <div>
                                <h4 className={`text-white font-bold text-xs tracking-wider uppercase ${t.text}`}>{dev.name}</h4>
                                <p className={`text-[10px] ${t.textMuted} font-semibold mt-0.5`}>{dev.subtitle}</p>
                              </div>
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          </div>

                          <div className="text-[10.5px] font-sans font-semibold">
                            {dev.status === 'WARNING_LOW_PAPER' ? (
                              <div className="text-amber-400 font-bold uppercase tracking-wider text-[9.5px]">
                                Warning: Low Paper
                              </div>
                            ) : (
                              <div className="flex justify-between">
                                <span className={`text-[#A69984]/40 uppercase tracking-wider text-[9px] ${t.textMutedLight}`}>Routing</span>
                                <span className={t.text}>{dev.details.replace('Routing: ', '')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button type="button" 
                          onClick={() => handleRunPrinterTest(dev.id, dev.name)}
                          disabled={printingDevices[dev.id]}
                          className={`w-full mt-5 py-2.5 bg-transparent border ${t.buttonOutline} font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none disabled:opacity-50 flex items-center justify-center gap-2`}
                        >
                          {printingDevices[dev.id] ? (
                            <>
                              <span className={`w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin ${t.text}`}></span>
                              Printing...
                            </>
                          ) : (
                            'Test Print'
                          )}
                        </button>
                      </div>
                  ))}
                </div>
              </div>

              {/* Kitchen Display Systems Section */}
              <div className="space-y-5">
                <h3 className={`font-serif text-[18px] font-bold ${t.text} tracking-wide select-none`}>Kitchen Display Systems</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {devicesList
                    .filter(dev => dev.type === 'KDS')
                    .map((dev) => (
                      <div key={dev.id} className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[170px]`}>
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3 select-none">
                              <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                                <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
                              </div>
                              <div>
                                <h4 className={`text-white font-bold text-xs tracking-wider uppercase ${t.text}`}>{dev.name}</h4>
                                <p className={`text-[10px] ${t.textMuted} font-semibold mt-0.5`}>{dev.ipAddress}</p>
                              </div>
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          </div>

                          <div className="text-[10.5px] font-sans font-semibold select-none flex justify-between">
                            <span className={`text-[#A69984]/40 uppercase tracking-wider text-[9px] ${t.textMutedLight}`}>Sync Status</span>
                            <span className={t.accent}>{dev.details.replace('Syncing: ', '')}</span>
                          </div>
                        </div>

                        <button type="button" 
                          onClick={() => triggerToast(`Opening settings for KDS ${dev.name}...`, 'info')}
                          className={`w-full mt-5 py-2.5 bg-transparent border ${t.buttonOutline} font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none`}
                        >
                          Settings
                        </button>
                      </div>
                  ))}
                </div>
              </div>

              {/* Cash Drawer Integration Section */}
              <div className="space-y-5">
                <h3 className={`font-serif text-[18px] font-bold ${t.text} tracking-wide select-none`}>Cash Drawers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Drawer Status */}
                  <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[170px]`}>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 select-none">
                          <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                            <span className="material-symbols-outlined text-[16px]">inbox</span>
                          </div>
                          <div>
                            <h4 className={`text-white font-bold text-xs tracking-wider uppercase ${t.text}`}>Cash Drawer 01</h4>
                            <p className={`text-[10px] ${t.textMuted} font-semibold mt-0.5`}>Linked to Bar Receipt Printer</p>
                          </div>
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </div>

                      <div className="text-[10.5px] font-sans font-semibold space-y-2">
                        <div className="flex justify-between">
                          <span className={`text-[#A69984]/40 uppercase tracking-wider text-[9px] ${t.textMutedLight}`}>Connection</span>
                          <span className={t.text}>Printer Kick (RJ12)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-[#A69984]/40 uppercase tracking-wider text-[9px] ${t.textMutedLight}`}>Status</span>
                          <span className="text-emerald-400">Closed (Ready)</span>
                        </div>
                      </div>
                    </div>

                    <button type="button" 
                      onClick={() => triggerToast('Sending manual kick signal to Cash Drawer 01... Drawer kicked open!', 'success')}
                      className={`w-full mt-5 py-2.5 bg-transparent border ${t.buttonOutline} font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none`}
                    >
                      Test Drawer Kick
                    </button>
                  </div>

                  {/* Card 2: Drawer Settings */}
                  <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl space-y-4`}>
                    <div className="flex justify-between items-center select-none border-b border-white/5 pb-2">
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${t.text}`}>Integration Preferences</h4>
                      <span className="material-symbols-outlined text-[#A69984]/50 text-sm">settings</span>
                    </div>

                    <div className="space-y-4 font-sans text-xs select-none">
                      {/* Toggle 1: Open on Cash */}
                      <div className="flex justify-between items-center">
                        <div className="max-w-[70%]">
                          <span className={`text-[11px] font-bold ${t.text}`}>Open on Cash Payment</span>
                          <p className={`text-[9px] ${t.textMutedLight} font-semibold mt-0.5`}>Kick drawer automatically on checkout</p>
                        </div>
                        <button type="button" 
                          onClick={() => {
                            setOpenOnCash(!openOnCash);
                            triggerToast(`Auto drawer kick on cash ${!openOnCash ? 'enabled' : 'disabled'}.`, 'info');
                          }}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors ${openOnCash ? t.accentBg : 'bg-white/20'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${openOnCash ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Toggle 2: Require Manager Pin */}
                      <div className="flex justify-between items-center">
                        <div className="max-w-[70%]">
                          <span className={`text-[11px] font-bold ${t.text}`}>Manager Approval Required</span>
                          <p className={`text-[9px] ${t.textMutedLight} font-semibold mt-0.5`}>Require supervisor pin for manual opening</p>
                        </div>
                        <button type="button" 
                          onClick={() => {
                            setRequireManagerPin(!requireManagerPin);
                            triggerToast(`Manager approval for manual drawer opening ${!requireManagerPin ? 'enabled' : 'disabled'}.`, 'info');
                          }}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors ${requireManagerPin ? t.accentBg : 'bg-white/20'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${requireManagerPin ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 1.5: GENERAL SETTINGS & RECEIPT LIVE PREVIEW */}
          {activeTab === 'general' && (
            <div className="space-y-8 animate-fade-in duration-300">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6 select-none">
                <div>
                  <h2 className={`font-serif text-[38px] font-bold ${t.accent} tracking-wide leading-none`}>
                    {tr.generalTitle}
                  </h2>
                  <p className={`font-sans text-[12.5px] ${t.textMuted} mt-3 font-semibold`}>
                    {tr.generalDesc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (Configurations) - Span 7 */}
                <div className="lg:col-span-7 space-y-8">
                  
                  {/* Restaurant Information */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl`}>
                    <h3 className={`${t.text} font-bold text-sm tracking-wide mb-5 select-none`}>{tr.restaurantInfo}</h3>
                    <div className="space-y-5">
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>{tr.restaurantName}</label>
                        <input 
                          type="text" 
                          aria-label="Establishment name"
                          value={establishmentName}
                          onChange={(e) => setEstablishmentName(e.target.value)}
                          className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>{tr.contactEmail}</label>
                          <input 
                            type="email" 
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                          />
                        </div>
                        <div>
                          <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>{tr.taxIdLabel}</label>
                          <input 
                            type="text" 
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>{tr.businessAddress}</label>
                        <textarea 
                          rows={3}
                          aria-label="Business address"
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium resize-none leading-relaxed`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Global Aesthetic */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl`}>
                    <h3 className={`${t.text} font-bold text-sm tracking-wide mb-5 select-none`}>{tr.globalThemeTitle}</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      
                      {/* Theme: Midnight Black */}
                      <button type="button" 
                        onClick={() => handleGlobalAestheticChange('Midnight Black')}
                        className={`flex flex-col items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${globalAesthetic === 'Midnight Black' ? `${t.accentLightBorder} bg-[#ffe2ab]/5` : 'border-transparent hover:bg-white/[0.02]'}`}
                      >
                        <div className="w-full h-10 rounded-md bg-[#0a0a09] border border-white/10 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ffc53d]"></span>
                        </div>
                        <span className={`text-[9.5px] font-bold ${t.text} tracking-wide`}>Midnight Black</span>
                      </button>

                      {/* Theme: Pristine White */}
                      <button type="button" 
                        onClick={() => handleGlobalAestheticChange('Pristine White')}
                        className={`flex flex-col items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${globalAesthetic === 'Pristine White' ? 'border-[#cfa426] bg-[#cfa426]/5' : 'border-transparent hover:bg-black/[0.02]'}`}
                      >
                        <div className="w-full h-10 rounded-md bg-white border border-black/10 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#cfa426]"></span>
                        </div>
                        <span className="text-[9.5px] font-bold text-[#6e6b63] tracking-wide">Pristine White</span>
                      </button>

                      {/* Theme: Bordeaux Reserve */}
                      <button type="button" 
                        onClick={() => handleGlobalAestheticChange('Bordeaux Reserve')}
                        className={`flex flex-col items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${globalAesthetic === 'Bordeaux Reserve' ? 'border-[#e5a09b] bg-[#e5a09b]/5' : 'border-transparent hover:bg-white/[0.02]'}`}
                      >
                        <div className="w-full h-10 rounded-md bg-[#180a0c] border border-white/10 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f5aca4]"></span>
                        </div>
                        <span className={`text-[9.5px] font-bold ${t.text} tracking-wide`}>Bordeaux Reserve</span>
                      </button>

                      {/* Theme: Deep Teal */}
                      <button type="button" 
                        onClick={() => handleGlobalAestheticChange('Deep Teal')}
                        className={`flex flex-col items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${globalAesthetic === 'Deep Teal' ? 'border-[#48e5ec] bg-[#48e5ec]/5' : 'border-transparent hover:bg-white/[0.02]'}`}
                      >
                        <div className="w-full h-10 rounded-md bg-[#051112] border border-white/10 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#48e5ec]"></span>
                        </div>
                        <span className={`text-[9.5px] font-bold ${t.text} tracking-wide`}>Deep Teal</span>
                      </button>

                      {/* Theme: Custom Palette */}
                      <button type="button" 
                        onClick={() => handleGlobalAestheticChange('Custom Palette')}
                        className={`flex flex-col items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${globalAesthetic === 'Custom Palette' ? 'border-[var(--custom-accent)] bg-[var(--custom-accent)]/5' : 'border-transparent hover:bg-white/[0.02]'}`}
                      >
                        <div className="w-full h-10 rounded-md bg-[var(--custom-bg)] border border-[var(--custom-accent)]/20 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[var(--custom-accent)]"></span>
                        </div>
                        <span className={`text-[9.5px] font-bold ${t.text} tracking-wide`}>Custom Palette</span>
                      </button>

                    </div>

                    {/* Custom Color Configuration Panel */}
                    {globalAesthetic === 'Custom Palette' && (
                      <div className="mt-6 pt-6 border-t border-white/5 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Custom Theme Configuration</h4>
                            <p className="text-[10px] text-[#A69984]/50 mt-1">Design your own bespoke dashboard aesthetic</p>
                          </div>
                          
                          {/* Curated Presets */}
                          <div className="flex flex-wrap gap-2">
                            <button type="button" 
                              onClick={() => {
                                updateCustomBg('#061417');
                                updateCustomCardBg('#0b2024');
                                updateCustomAccent('#4ade80');
                                updateCustomText('#e2f8eb');
                                updateCustomTextMuted('#85ada4');
                              }}
                              className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[9px] font-bold text-white transition-colors cursor-pointer"
                            >
                              Forest Emerald
                            </button>
                            <button type="button" 
                              onClick={() => {
                                updateCustomBg('#0f0d1a');
                                updateCustomCardBg('#161326');
                                updateCustomAccent('#a855f7');
                                updateCustomText('#f3e8ff');
                                updateCustomTextMuted('#9a8fa8');
                              }}
                              className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[9px] font-bold text-white transition-colors cursor-pointer"
                            >
                              Royal Orchid
                            </button>
                            <button type="button" 
                              onClick={() => {
                                updateCustomBg('#1a0f0f');
                                updateCustomCardBg('#261313');
                                updateCustomAccent('#f43f5e');
                                updateCustomText('#ffe4e6');
                                updateCustomTextMuted('#a88f8f');
                              }}
                              className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[9px] font-bold text-white transition-colors cursor-pointer"
                            >
                              Sunset Crimson
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                          {/* Background Color */}
                          <div className="bg-black/20 p-3.5 border border-white/5 rounded-xl space-y-2">
                            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-[#A69984]/70">Background</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={customBg}
                                onChange={(e) => updateCustomBg(e.target.value)}
                                className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
                              />
                              <input 
                                type="text"
                                value={customBg}
                                onChange={(e) => updateCustomBg(e.target.value)}
                                className="bg-black/30 border border-white/10 rounded px-1.5 py-1 text-[10px] text-white font-mono w-16 focus:outline-none focus:border-[#ffe2ab]/40"
                              />
                            </div>
                          </div>

                          {/* Card Background Color */}
                          <div className="bg-black/20 p-3.5 border border-white/5 rounded-xl space-y-2">
                            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-[#A69984]/70">Card Bg</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={customCardBg}
                                onChange={(e) => updateCustomCardBg(e.target.value)}
                                className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
                              />
                              <input 
                                type="text"
                                value={customCardBg}
                                onChange={(e) => updateCustomCardBg(e.target.value)}
                                className="bg-black/30 border border-white/10 rounded px-1.5 py-1 text-[10px] text-white font-mono w-16 focus:outline-none focus:border-[#ffe2ab]/40"
                              />
                            </div>
                          </div>

                          {/* Accent Color */}
                          <div className="bg-black/20 p-3.5 border border-white/5 rounded-xl space-y-2">
                            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-[#A69984]/70">Accent</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={customAccent}
                                onChange={(e) => updateCustomAccent(e.target.value)}
                                className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
                              />
                              <input 
                                type="text"
                                value={customAccent}
                                onChange={(e) => updateCustomAccent(e.target.value)}
                                className="bg-black/30 border border-white/10 rounded px-1.5 py-1 text-[10px] text-white font-mono w-16 focus:outline-none focus:border-[#ffe2ab]/40"
                              />
                            </div>
                          </div>

                          {/* Text Color */}
                          <div className="bg-black/20 p-3.5 border border-white/5 rounded-xl space-y-2">
                            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-[#A69984]/70">Text</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={customText}
                                onChange={(e) => updateCustomText(e.target.value)}
                                className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
                              />
                              <input 
                                type="text"
                                value={customText}
                                onChange={(e) => updateCustomText(e.target.value)}
                                className="bg-black/30 border border-white/10 rounded px-1.5 py-1 text-[10px] text-white font-mono w-16 focus:outline-none focus:border-[#ffe2ab]/40"
                              />
                            </div>
                          </div>

                          {/* Muted Text Color */}
                          <div className="bg-black/20 p-3.5 border border-white/5 rounded-xl space-y-2">
                            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-[#A69984]/70">Muted Text</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={customTextMuted}
                                onChange={(e) => updateCustomTextMuted(e.target.value)}
                                className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
                              />
                              <input 
                                type="text"
                                value={customTextMuted}
                                onChange={(e) => updateCustomTextMuted(e.target.value)}
                                className="bg-black/30 border border-white/10 rounded px-1.5 py-1 text-[10px] text-white font-mono w-16 focus:outline-none focus:border-[#ffe2ab]/40"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Invoice & Receipt Configuration */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl space-y-5`}>
                    <h3 className={`${t.text} font-bold text-sm tracking-wide mb-5 select-none`}>{tr.receiptOptionsTitle}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      {/* Show Restaurant Logo */}
                      <div className="flex justify-between items-center bg-[#0e0e0d]/30 p-3.5 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-xs font-bold text-white leading-none mb-1">{tr.showLogo}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showLogoDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowLogo(!showLogo)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showLogo ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showLogo ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Show Tax ID */}
                      <div className="flex justify-between items-center bg-[#0e0e0d]/30 p-3.5 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-xs font-bold text-white leading-none mb-1">{tr.showTaxId}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showTaxIdDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowTaxId(!showTaxId)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showTaxId ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showTaxId ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                      
                      {/* Show Server Name */}
                      <div className="flex justify-between items-center bg-[#0e0e0d]/30 p-3.5 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-xs font-bold text-white leading-none mb-1">{tr.showServer}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showServerDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowServerName(!showServerName)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showServerName ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showServerName ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Show Table Number */}
                      <div className="flex justify-between items-center bg-[#0e0e0d]/30 p-3.5 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-xs font-bold text-white leading-none mb-1">{tr.showTable}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showTableDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowTableNumber(!showTableNumber)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showTableNumber ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showTableNumber ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Show Order Timestamp */}
                      <div className="flex justify-between items-center bg-[#0e0e0d]/30 p-3.5 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-xs font-bold text-white leading-none mb-1">{tr.showTimestamp}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showTimestampDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowOrderTimestamp(!showOrderTimestamp)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showOrderTimestamp ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showOrderTimestamp ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Show QR Code */}
                      <div className="flex justify-between items-center bg-[#0e0e0d]/30 p-3.5 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-xs font-bold text-white leading-none mb-1">{tr.showFeedbackQr}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showFeedbackQrDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowQrCode(!showQrCode)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showQrCode ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showQrCode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Show Social Media */}
                      <div className="flex justify-between items-center bg-[#0e0e0d]/30 p-3.5 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-xs font-bold text-white leading-none mb-1">{tr.showSocial}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.showSocialDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowSocialMedia(!showSocialMedia)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showSocialMedia ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showSocialMedia ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Show Service Charge */}
                      <div className="flex justify-between items-center bg-[#0e0e0d]/30 p-3.5 border border-white/5 rounded-xl">
                        <div>
                          <h4 className="text-xs font-bold text-white leading-none mb-1">{tr.includeServiceCharge}</h4>
                          <span className={`text-[9.5px] ${t.textMutedDark} font-medium`}>{tr.includeServiceChargeDesc}</span>
                        </div>
                        <button type="button" onClick={() => setShowServiceCharge(!showServiceCharge)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showServiceCharge ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showServiceCharge ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-5 mt-3 space-y-4">
                      <div className="flex justify-between items-center select-none">
                        <div>
                          <h4 className="text-xs font-bold text-white">{tr.showCustomFooter}</h4>
                          <p className={`text-[9.5px] ${t.textMutedDark}`}>{tr.showCustomFooterDesc}</p>
                        </div>
                        <button type="button" onClick={() => setShowCustomFooter(!showCustomFooter)} className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showCustomFooter ? t.accentBg : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showCustomFooter ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={thankYouMessage}
                        onChange={(e) => setThankYouMessage(e.target.value)}
                        placeholder="e.g. Thank you for dining with us!"
                        disabled={!showCustomFooter}
                        className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-white/20 focus:outline-none transition-colors font-medium ${!showCustomFooter ? 'opacity-40' : 'focus:border-[#ffe2ab]/40'}`}
                      />
                    </div>
                  </div>

                  {/* Regional & Currency Settings */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl`}>
                    <div className="flex items-center gap-2 mb-6">
                      <span className={`material-symbols-outlined ${t.accent} text-lg`}>language</span>
                      <h3 className={`${t.text} font-bold text-sm tracking-wide select-none`}>{tr.regionalSettings}</h3>
                    </div>
                    <div className="space-y-6">

                      {/* Language Selection */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-3 select-none`}>{tr.languageSelect}</label>
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { code: 'en', flag: '🇺🇸', label: tr.langEn },
                            { code: 'ja', flag: '🇯🇵', label: tr.langJa },
                            { code: 'zh', flag: '🇨🇳', label: tr.langZh },
                            { code: 'ko', flag: '🇰🇷', label: tr.langKo },
                          ] as const).map(lang => (
                            <button type="button"
                              key={lang.code}
                              onClick={() => handleLanguageChange(lang.code)}
                              className={`flex items-center gap-2.5 py-3 px-4 rounded-xl border font-sans font-bold text-xs tracking-wider transition-all cursor-pointer ${
                                language === lang.code
                                  ? `${t.accentBg} ${t.accentLightBorder} ${t.accentText}`
                                  : `${t.inputBg} ${t.inputBorder} ${t.textMuted} hover:border-white/20 hover:text-white`
                              }`}
                            >
                              <span className="text-base">{lang.flag}</span>
                              <span>{lang.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Currency Selection */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-3 select-none`}>Display Currency</label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {([
                            { code: 'USD', symbol: '$', name: 'US Dollar' },
                            { code: 'EUR', symbol: '€', name: 'Euro' },
                            { code: 'GBP', symbol: '£', name: 'Pound' },
                            { code: 'JPY', symbol: '¥', name: 'Yen' },
                            { code: 'CNY', symbol: '¥', name: 'Yuan' },
                            { code: 'KRW', symbol: '₩', name: 'Won' },
                          ] as const).map(cur => (
                            <button type="button"
                              key={cur.code}
                              onClick={() => handleCurrencyChange(cur.code)}
                              className={`flex flex-col items-center py-3 px-2 rounded-xl border font-sans font-bold text-xs tracking-wider transition-all cursor-pointer ${
                                currency === cur.code
                                  ? `${t.accentBg} ${t.accentLightBorder} ${t.accentText}`
                                  : `${t.inputBg} ${t.inputBorder} ${t.textMuted} hover:border-white/20 hover:text-white`
                              }`}
                            >
                              <span className="font-serif text-lg leading-none">{cur.symbol}</span>
                              <span className="text-[9.5px] font-bold uppercase tracking-wider mt-1">{cur.code}</span>
                              <span className="text-[8px] font-medium mt-0.5 opacity-70">{cur.name}</span>
                            </button>
                          ))}
                        </div>
                        <div className={`flex items-center gap-3 mt-3 p-3.5 rounded-xl border ${t.border} ${t.inputBg}/30`}>
                          <span className={`material-symbols-outlined text-base ${t.accent}`}>info</span>
                          <p className={`text-[10px] ${t.textMuted} font-semibold leading-relaxed`}>
                            Currency conversions are approximate. Current rate: 1 USD = {currencyRates[currency].toLocaleString()} {currency}.
                          </p>
                        </div>
                      </div>

                      {/* Tax Basis */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-3 select-none`}>{tr.taxBasisLabel}</label>
                        <div className="flex gap-3">
                          <button type="button"
                            onClick={() => handleTaxTypeChange('pre-tax')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-sans font-bold text-xs tracking-wider transition-all cursor-pointer ${
                              taxType === 'pre-tax'
                                ? `${t.accentBg} ${t.accentLightBorder} ${t.accentText}`
                                : `${t.inputBg} ${t.inputBorder} ${t.textMuted} hover:border-white/20 hover:text-white`
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            <span>{tr.preTaxLabel}</span>
                          </button>
                          <button type="button"
                            onClick={() => handleTaxTypeChange('post-tax')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-sans font-bold text-xs tracking-wider transition-all cursor-pointer ${
                              taxType === 'post-tax'
                                ? `${t.accentBg} ${t.accentLightBorder} ${t.accentText}`
                                : `${t.inputBg} ${t.inputBorder} ${t.textMuted} hover:border-white/20 hover:text-white`
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm font-bold">check_box</span>
                            <span>{tr.postTaxLabel}</span>
                          </button>
                        </div>
                        <p className={`text-[9.5px] ${t.textMutedDark} font-medium mt-2 leading-relaxed`}>
                          {tr.taxBasisDesc}
                        </p>
                      </div>

                      {/* Dynamic Tax Rates by Dining Option */}
                      <div className={`pt-4 border-t ${t.border}`}>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-3 select-none`}>
                          Tax Rates by Dining Option
                        </label>
                        <div className="space-y-4">
                          {/* Dine-in */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 select-none">
                              <span className={`material-symbols-outlined ${t.textMuted} text-base`}>local_dining</span>
                              <span className={`text-xs font-semibold ${t.text}`}>Dine-in Tax Rate</span>
                            </div>
                            <div className="flex items-center gap-2 max-w-[120px]">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={taxRateDineIn}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  handleTaxRateDineInChange(val);
                                }}
                                className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-3 py-2 text-xs text-right ${t.text} font-mono font-medium focus:outline-none focus:border-[#ffe2ab]/40`}
                              />
                              <span className={`text-xs ${t.textMuted} font-bold`}>%</span>
                            </div>
                          </div>

                          {/* Takeaway */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 select-none">
                              <span className={`material-symbols-outlined ${t.textMuted} text-base`}>shopping_bag</span>
                              <span className={`text-xs font-semibold ${t.text}`}>Takeaway Tax Rate</span>
                            </div>
                            <div className="flex items-center gap-2 max-w-[120px]">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={taxRateTakeaway}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  handleTaxRateTakeawayChange(val);
                                }}
                                className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-3 py-2 text-xs text-right ${t.text} font-mono font-medium focus:outline-none focus:border-[#ffe2ab]/40`}
                              />
                              <span className={`text-xs ${t.textMuted} font-bold`}>%</span>
                            </div>
                          </div>

                          {/* Delivery */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 select-none">
                              <span className={`material-symbols-outlined ${t.textMuted} text-base`}>moped</span>
                              <span className={`text-xs font-semibold ${t.text}`}>Delivery Tax Rate</span>
                            </div>
                            <div className="flex items-center gap-2 max-w-[120px]">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={taxRateDelivery}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  handleTaxRateDeliveryChange(val);
                                }}
                                className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-3 py-2 text-xs text-right ${t.text} font-mono font-medium focus:outline-none focus:border-[#ffe2ab]/40`}
                              />
                              <span className={`text-xs ${t.textMuted} font-bold`}>%</span>
                            </div>
                          </div>
                        </div>
                        <p className={`text-[9.5px] ${t.textMutedDark} font-medium mt-3 leading-relaxed`}>
                          Adjust the tax rate percentage applied dynamically depending on the selected dining option at checkout.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Digital Menu Preferences & Exclusions */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl`}>
                    <div className="flex items-center gap-2 mb-5">
                      <span className={`material-symbols-outlined ${t.accent} text-lg`}>restaurant_menu</span>
                      <h3 className={`${t.text} font-bold text-sm tracking-wide select-none`}>{tr.digitalMenuPrefs}</h3>
                    </div>
                    
                    <div className="space-y-6 font-sans">
                      {/* Max Price Exclusions */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>
                          {tr.maxDisplayPrice}
                        </label>
                        <div className="flex items-center gap-3">
                          <span className={`${t.text} font-serif text-lg font-bold`}>{isJpy ? '¥' : '$'}</span>
                          <input 
                            type="number"
                            value={digitalMenuConfig.maxPrice}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              updateDigitalMenuConfig({ maxPrice: val });
                            }}
                            className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none transition-colors font-medium focus:border-[#ffe2ab]/40`}
                          />
                        </div>
                        <p className={`text-[9.5px] ${t.textMutedDark} mt-1.5 leading-relaxed`}>
                          {tr.maxDisplayPriceDesc}
                        </p>
                      </div>

                      {/* Tag exclusions */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2 select-none`}>
                          {tr.excludedFoodTags}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['Seafood', 'GF', 'Veg', 'Non-Veg'].map(tag => {
                            const isExcluded = digitalMenuConfig.excludedTags.includes(tag);
                            return (
                              <button type="button"
                                key={tag}
                                onClick={() => {
                                  const newTags = isExcluded
                                    ? digitalMenuConfig.excludedTags.filter(t => t !== tag)
                                    : [...digitalMenuConfig.excludedTags, tag];
                                  updateDigitalMenuConfig({ excludedTags: newTags });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                  isExcluded 
                                    ? 'bg-red-500/20 border border-red-500/30 text-red-400' 
                                    : 'bg-white/5 border border-white/10 text-white/55 hover:text-white'
                                }`}
                              >
                                {isExcluded ? '✓ ' : ''}{tag}
                              </button>
                            );
                          })}
                        </div>
                        <p className={`text-[9.5px] ${t.textMutedDark} mt-1.5 leading-relaxed`}>
                          {tr.excludedFoodTagsDesc}
                        </p>
                      </div>

                      {/* Feature Controls */}
                      <div className="border-t border-white/5 pt-4 space-y-4">
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider select-none`}>
                          {tr.digitalMenuFeatures}
                        </label>

                        {/* Enable AI Concierge */}
                        <div className="flex items-center justify-between">
                          <div className="max-w-[80%] flex flex-col justify-center">
                            <h4 className="text-xs font-bold text-white">{tr.enableAIConcierge}</h4>
                            <p className={`text-[9.5px] ${t.textMutedDark} mt-0.5 leading-relaxed`}>{tr.enableAIConciergeDesc}</p>
                          </div>
                          <button type="button" 
                            onClick={() => updateDigitalMenuConfig({ showAIConcierge: !digitalMenuConfig.showAIConcierge })} 
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${digitalMenuConfig.showAIConcierge ? t.accentBg : 'bg-white/20'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${digitalMenuConfig.showAIConcierge ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </button>
                        </div>

                        {/* Enable Customer Self-Checkout */}
                        <div className="flex items-center justify-between">
                          <div className="max-w-[80%] flex flex-col justify-center">
                            <h4 className="text-xs font-bold text-white">{tr.enableSelfCheckout}</h4>
                            <p className={`text-[9.5px] ${t.textMutedDark} mt-0.5 leading-relaxed`}>{tr.enableSelfCheckoutDesc}</p>
                          </div>
                          <button type="button" 
                            onClick={() => updateDigitalMenuConfig({ enableSelfCheckout: !digitalMenuConfig.enableSelfCheckout })} 
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${digitalMenuConfig.enableSelfCheckout ? t.accentBg : 'bg-white/20'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${digitalMenuConfig.enableSelfCheckout ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </button>
                        </div>

                        {/* Fixed Customer Table Number */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-4">
                          <div className="max-w-[70%] flex flex-col justify-center">
                            <h4 className="text-xs font-bold text-white">Fixed Customer Table Number</h4>
                            <p className={`text-[9.5px] ${t.textMutedDark} mt-0.5 leading-relaxed`}>Admin-controlled table assignment for guest users (Customer Role).</p>
                          </div>
                          <div className="relative">
                            <select
                              aria-label="Fixed Customer Table Number"
                              value={digitalMenuConfig.customerTableNumber || 12}
                              onChange={(e) => updateDigitalMenuConfig({ customerTableNumber: parseInt(e.target.value, 10) })}
                              className={`w-[80px] bg-[#12110f] border border-white/10 rounded-lg py-1.5 px-3 text-white text-xs focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-semibold appearance-none`}
                            >
                              {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>T{num}</option>
                              ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-2.5 top-2 text-[#A69984]/40 text-xs pointer-events-none">keyboard_arrow_down</span>
                          </div>
                        </div>

                        {/* Time-Based Menu System */}
                        <div className="border-t border-white/5 pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="max-w-[80%] flex flex-col justify-center">
                              <h4 className="text-xs font-bold text-white">{tr.timeBasedMenu}</h4>
                              <p className={`text-[9.5px] ${t.textMutedDark} mt-0.5 leading-relaxed`}>{tr.timeBasedMenuDesc}</p>
                            </div>
                            <button type="button" 
                              onClick={() => updateDigitalMenuConfig({ enableTimeBasedMenu: !digitalMenuConfig.enableTimeBasedMenu })} 
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${digitalMenuConfig.enableTimeBasedMenu ? t.accentBg : 'bg-white/20'}`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${digitalMenuConfig.enableTimeBasedMenu ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </button>
                          </div>

                          {digitalMenuConfig.enableTimeBasedMenu && (
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-3 mt-2">
                              {/* Lunch Hours */}
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs font-semibold text-white/85 shrink-0 flex items-center gap-1.5">
                                  <span>🌤️</span> {tr.lunchMenuTime}
                                </span>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="time"
                                    aria-label="Lunch Start Time"
                                    value={digitalMenuConfig.lunchStart || '11:00'}
                                    onChange={(e) => updateDigitalMenuConfig({ lunchStart: e.target.value })}
                                    className={`bg-[#12110f] border border-white/10 rounded-lg py-1 px-2 text-white text-xs focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-semibold`}
                                  />
                                  <span className={`text-[10px] ${t.textMutedDark}`}>to</span>
                                  <input 
                                    type="time"
                                    aria-label="Lunch End Time"
                                    value={digitalMenuConfig.lunchEnd || '15:00'}
                                    onChange={(e) => updateDigitalMenuConfig({ lunchEnd: e.target.value })}
                                    className={`bg-[#12110f] border border-white/10 rounded-lg py-1 px-2 text-white text-xs focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-semibold`}
                                  />
                                </div>
                              </div>

                              {/* Dinner Hours */}
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs font-semibold text-white/85 shrink-0 flex items-center gap-1.5">
                                  <span>🌙</span> {tr.dinnerMenuTime}
                                </span>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="time"
                                    aria-label="Dinner Start Time"
                                    value={digitalMenuConfig.dinnerStart || '18:00'}
                                    onChange={(e) => updateDigitalMenuConfig({ dinnerStart: e.target.value })}
                                    className={`bg-[#12110f] border border-white/10 rounded-lg py-1 px-2 text-white text-xs focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-semibold`}
                                  />
                                  <span className={`text-[10px] ${t.textMutedDark}`}>to</span>
                                  <input 
                                    type="time"
                                    aria-label="Dinner End Time"
                                    value={digitalMenuConfig.dinnerEnd || '23:00'}
                                    onChange={(e) => updateDigitalMenuConfig({ dinnerEnd: e.target.value })}
                                    className={`bg-[#12110f] border border-white/10 rounded-lg py-1 px-2 text-white text-xs focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-semibold`}
                                  />
                                </div>
                              </div>

                              <p className={`text-[9px] ${t.textMutedLight} pt-1 leading-relaxed border-t border-white/5`}>
                                💡 {tr.timeBasedMenuInfoNote}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Right Column (Live Preview Simulator) - Span 5 */}
                <div className="lg:col-span-5 lg:sticky lg:top-[120px] space-y-6 select-none">
                  
                  {/* Live Preview Bar */}
                  <div className="flex justify-between items-center px-1">
                    <h3 className={`font-serif text-base font-bold ${t.accent} uppercase tracking-wider`}>{tr.livePreview}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"></span>
                      {tr.realtimeSync}
                    </div>
                  </div>

                  {/* Dark Simulated Receipt card wrapper */}
                  <div className={`${t.cardBg} rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[480px]`}>
                    <div className="w-full max-w-[280px] bg-[#1c1b1a] text-[#A69984] border border-white/5 rounded-xl p-5 shadow-lg flex flex-col justify-between font-mono text-[9.5px] leading-relaxed">
                      
                      {/* Brand & Logo Header */}
                      <div className="text-center space-y-1.5 mb-3">
                        {showLogo && (
                          <div className="flex justify-center select-none mb-1">
                            <div className="w-7 h-7 rounded-lg bg-black border border-white/10 flex items-center justify-center text-[#ffe2ab]">
                              <span className="material-symbols-outlined text-[13px] font-black">flatware</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-white font-extrabold uppercase text-[11px] tracking-wider truncate">
                          {establishmentName || 'DinePosAi'}
                        </div>
                        
                        <div className="text-[8px] text-[#A69984]/50 font-semibold max-w-[180px] mx-auto break-words leading-tight">
                          {businessAddress || '72 Culinary Avenue, Gourmet District'}
                        </div>
                      </div>

                      {/* Metadata dotted block */}
                      {(showTableNumber || showServerName || showOrderTimestamp) && (
                        <div className="border-y border-dashed border-white/10 py-2.5 my-2.5 text-[8.5px] text-[#A69984]/65">
                          <div className="flex justify-between">
                            <div>
                              {showTableNumber && <div className="text-white font-bold">TABLE: T-14</div>}
                              {showOrderTimestamp && <div className="text-[8px] mt-0.5">06/04/2026 09:48</div>}
                            </div>
                            <div className="text-right">
                              {showServerName && <div>SERVER: JULIAN B.</div>}
                              <div className="text-[8px] text-white/45 mt-0.5">Order #2345</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Items check list */}
                      <div className="space-y-2 py-1 select-none">
                        <div className="flex justify-between items-baseline">
                          <span className="text-white/80">2 Truffle Wagyu Sliders</span>
                          <span className="text-white/95 font-bold font-mono">{formatCurrency(48)}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-white/80">1 Lobster Bisque</span>
                          <span className="text-white/95 font-bold font-mono">{formatCurrency(18)}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-white/80">2 Vintage Cabernet (G)</span>
                          <span className="text-white/95 font-bold font-mono">{formatCurrency(34)}</span>
                        </div>
                      </div>

                      {/* Subtotal breakdowns */}
                      <div className="border-t border-white/5 pt-2.5 mt-2.5 space-y-1 text-[8.5px] text-[#A69984]/60">
                        <div className="flex justify-between">
                          <span>{taxType === 'post-tax' ? tr.subtotalInclusive : tr.subtotal}</span>
                          <span>{formatCurrency(subtotalVal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{taxType === 'post-tax' ? tr.includedTax : `${tr.tax} (8%)`}</span>
                          <span>{formatCurrency(taxVal)}</span>
                        </div>
                        {showServiceCharge && (
                          <div className="flex justify-between">
                            <span>{tr.serviceCharge}</span>
                            <span>{formatCurrency(10)}</span>
                          </div>
                        )}
                      </div>

                      {/* Total */}
                      <div className="border-t border-dashed border-white/10 pt-2.5 mt-2 flex justify-between items-baseline">
                        <span className="text-white font-extrabold text-[9px]">{tr.grandTotal}</span>
                        <span className="text-[#ffe2ab] text-[12px] font-bold font-mono">
                          {formatCurrency(totalVal)}
                        </span>
                      </div>

                      {/* Footer QR/Text message */}
                      <div className="text-center mt-5 space-y-3">
                        {showCustomFooter && thankYouMessage && (
                          <div className="text-[8px] italic text-[#A69984]/50 font-sans max-w-[200px] mx-auto">
                            "{thankYouMessage}"
                          </div>
                        )}

                        {showQrCode && (
                          <div className="flex flex-col items-center gap-1 select-none pt-1">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#A69984]/50">
                              <rect x="1" y="1" width="6" height="6" stroke="currentColor" rx="0.5"/>
                              <rect x="2.5" y="2.5" width="3" height="3" fill="currentColor"/>
                              <rect x="17" y="1" width="6" height="6" stroke="currentColor" rx="0.5"/>
                              <rect x="18.5" y="2.5" width="3" height="3" fill="currentColor"/>
                              <rect x="1" y="17" width="6" height="6" stroke="currentColor" rx="0.5"/>
                              <rect x="2.5" y="18.5" width="3" height="3" fill="currentColor"/>
                              <rect x="9" y="1" width="2" height="2" fill="currentColor"/>
                              <rect x="13" y="2" width="2" height="1" fill="currentColor"/>
                              <rect x="9" y="9" width="3" height="3" fill="currentColor"/>
                              <rect x="17" y="9" width="2" height="2" fill="currentColor"/>
                              <rect x="9" y="17" width="2" height="2" fill="currentColor"/>
                              <rect x="13" y="18" width="2" height="2" fill="currentColor"/>
                              <rect x="18" y="17" width="4" height="4" fill="currentColor"/>
                            </svg>
                            <span className="text-[7px] font-bold text-[#ffe2ab]/60 uppercase tracking-widest font-sans">Scan for Survey</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Upload Brand Logo card */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center`}>
                    <div className={`w-16 h-16 rounded-xl ${t.inputBg} border border-dashed ${t.borderStrong} flex flex-col items-center justify-center text-[#A69984] mb-3.5 cursor-pointer hover:border-[#ffc53d]/50 hover:text-[#ffc53d] transition-colors`}>
                      <span className="material-symbols-outlined text-xl">upload_file</span>
                    </div>
                    <p className={`text-[10px] ${t.textMuted} font-semibold leading-relaxed max-w-[200px]`}>
                      Recommended size: 512×512px SVG or high-res PNG.
                    </p>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 7: SECURITY & ACCESS CONTROL PANEL */}
          {activeTab === 'security' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Action Row & Page Headers */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-4 select-none">
                <div>
                  <h2 className={`font-serif text-[38px] font-bold ${t.accent} tracking-wide leading-none`}>
                    {tr.securityConsole}
                  </h2>
                  <p className={`font-sans text-[12.5px] ${t.textMuted} mt-3 font-semibold`}>
                    {tr.securityDesc}
                  </p>
                </div>
              </div>

              {/* Security Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Permissions & Settings (Span 7) */}
                <div className="lg:col-span-7 space-y-8">
                  
                  {/* Permissions Matrix Card */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl space-y-5`}>
                    <div className="border-b border-white/5 pb-3 select-none">
                      <h3 className={`${t.text} font-bold text-sm tracking-wide`}>Role Permissions Matrix</h3>
                      <p className={`text-[10px] ${t.textMuted} font-semibold mt-1`}>Toggle dashboard and device level command privileges.</p>
                    </div>

                    <div className="overflow-x-auto select-none">
                      <table className="w-full text-left border-collapse font-sans text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-[9px] font-bold text-[#A69984]/50 uppercase tracking-widest bg-[#0e0e0d]/20">
                            <th className="px-4 py-3">Permission Item</th>
                            <th className="px-2 py-3 text-center">Mgr</th>
                            <th className="px-2 py-3 text-center">Srv</th>
                            <th className="px-2 py-3 text-center">Btd</th>
                            <th className="px-2 py-3 text-center">Cook</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${t.divider}`}>
                          
                          {/* Row 1: Refund Orders */}
                          <tr className="hover:bg-white/[0.005] transition-colors">
                            <td className="px-4 py-4 font-bold text-white">Refund Completed Orders</td>
                            {['Manager', 'Server', 'Bartender', 'Cook'].map(role => (
                              <td key={role} className="px-2 py-4 text-center">
                                <button type="button" 
                                  onClick={() => togglePermission(role, 'refundOrders')}
                                  className={`w-4 h-4 rounded border transition-colors inline-flex items-center justify-center ${securityPermissions[role]?.['refundOrders'] ? `${t.accentBg} ${t.accentLightBorder}` : 'border-white/20 hover:border-white/40 bg-[#0e0e0d]'}`}
                                >
                                  {securityPermissions[role]?.['refundOrders'] && (
                                    <span className={`material-symbols-outlined text-[10px] font-extrabold ${t.accentText}`}>check</span>
                                  )}
                                </button>
                              </td>
                            ))}
                          </tr>

                          {/* Row 2: Comp Items */}
                          <tr className="hover:bg-white/[0.005] transition-colors">
                            <td className="px-4 py-4 font-bold text-white">Comp Dishes / Drinks (100% off)</td>
                            {['Manager', 'Server', 'Bartender', 'Cook'].map(role => (
                              <td key={role} className="px-2 py-4 text-center">
                                <button type="button" 
                                  onClick={() => togglePermission(role, 'compDishes')}
                                  className={`w-4 h-4 rounded border transition-colors inline-flex items-center justify-center ${securityPermissions[role]?.['compDishes'] ? `${t.accentBg} ${t.accentLightBorder}` : 'border-white/20 hover:border-white/40 bg-[#0e0e0d]'}`}
                                >
                                  {securityPermissions[role]?.['compDishes'] && (
                                    <span className={`material-symbols-outlined text-[10px] font-extrabold ${t.accentText}`}>check</span>
                                  )}
                                </button>
                              </td>
                            ))}
                          </tr>

                          {/* Row 3: Void Transactions */}
                          <tr className="hover:bg-white/[0.005] transition-colors">
                            <td className="px-4 py-4 font-bold text-white">Void Active Checks</td>
                            {['Manager', 'Server', 'Bartender', 'Cook'].map(role => (
                              <td key={role} className="px-2 py-4 text-center">
                                <button type="button" 
                                  onClick={() => togglePermission(role, 'voidItems')}
                                  className={`w-4 h-4 rounded border transition-colors inline-flex items-center justify-center ${securityPermissions[role]?.['voidItems'] ? `${t.accentBg} ${t.accentLightBorder}` : 'border-white/20 hover:border-white/40 bg-[#0e0e0d]'}`}
                                >
                                  {securityPermissions[role]?.['voidItems'] && (
                                    <span className={`material-symbols-outlined text-[10px] font-extrabold ${t.accentText}`}>check</span>
                                  )}
                                </button>
                              </td>
                            ))}
                          </tr>

                          {/* Row 4: Reopen Business Days */}
                          <tr className="hover:bg-white/[0.005] transition-colors">
                            <td className="px-4 py-4 font-bold text-white">Reopen Closed Business Days</td>
                            {['Manager', 'Server', 'Bartender', 'Cook'].map(role => (
                              <td key={role} className="px-2 py-4 text-center">
                                <button type="button" 
                                  onClick={() => togglePermission(role, 'reopenDays')}
                                  className={`w-4 h-4 rounded border transition-colors inline-flex items-center justify-center ${securityPermissions[role]?.['reopenDays'] ? `${t.accentBg} ${t.accentLightBorder}` : 'border-white/20 hover:border-white/40 bg-[#0e0e0d]'}`}
                                >
                                  {securityPermissions[role]?.['reopenDays'] && (
                                    <span className={`material-symbols-outlined text-[10px] font-extrabold ${t.accentText}`}>check</span>
                                  )}
                                </button>
                              </td>
                            ))}
                          </tr>

                          {/* Row 5: Edit Menu */}
                          <tr className="hover:bg-white/[0.005] transition-colors">
                            <td className="px-4 py-4 font-bold text-white">Modify Core Menu & Pricing</td>
                            {['Manager', 'Server', 'Bartender', 'Cook'].map(role => (
                              <td key={role} className="px-2 py-4 text-center">
                                <button type="button" 
                                  onClick={() => togglePermission(role, 'editMenu')}
                                  className={`w-4 h-4 rounded border transition-colors inline-flex items-center justify-center ${securityPermissions[role]?.['editMenu'] ? `${t.accentBg} ${t.accentLightBorder}` : 'border-white/20 hover:border-white/40 bg-[#0e0e0d]'}`}
                                >
                                  {securityPermissions[role]?.['editMenu'] && (
                                    <span className={`material-symbols-outlined text-[10px] font-extrabold ${t.accentText}`}>check</span>
                                  )}
                                </button>
                              </td>
                            ))}
                          </tr>

                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Passcode Policy settings card */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl`}>
                    <h3 className={`${t.text} font-bold text-sm tracking-wide mb-5 select-none`}>System Access Policies</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                      
                      {/* Passcode Length */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2`}>Employee PIN Length</label>
                        <div className="relative">
                          <select
                            aria-label="Passcode length"
                            value={passcodeLength}
                            onChange={(e) => {
                              setPasscodeLength(e.target.value);
                              triggerToast(`Passcode policy updated to ${e.target.value}-digit PINs.`, 'success');
                              setAuditLogs(prev => [
                                { id: Date.now(), time: 'Just now', actor: 'Admin', action: `Changed employee PIN requirement to ${e.target.value} digits`, type: 'security' },
                                ...prev
                              ]);
                            }}
                            className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                          >
                            <option value="4">4-Digit PIN</option>
                            <option value="6">6-Digit PIN</option>
                            <option value="8">8-Digit PIN</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-[#A69984]/40 text-xs pointer-events-none">keyboard_arrow_down</span>
                        </div>
                      </div>

                      {/* Session Timeout */}
                      <div>
                        <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2`}>Terminal Idle Auto-Logout</label>
                        <div className="relative">
                          <select
                            aria-label="Session timeout"
                            value={sessionTimeout}
                            onChange={(e) => {
                              setSessionTimeout(e.target.value);
                              triggerToast(`Session auto-logout timer set to ${e.target.value} mins.`, 'success');
                              setAuditLogs(prev => [
                                { id: Date.now(), time: 'Just now', actor: 'Admin', action: `Set terminal auto-logout session timer to ${e.target.value} minutes`, type: 'security' },
                                ...prev
                              ]);
                            }}
                            className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                          >
                            <option value="1">1 Minute</option>
                            <option value="5">5 Minutes</option>
                            <option value="15">15 Minutes</option>
                            <option value="30">30 Minutes</option>
                            <option value="0">Never Lock</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-[#A69984]/40 text-xs pointer-events-none">keyboard_arrow_down</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Right Side: Security Audit Log (Span 5) */}
                <div className="lg:col-span-5 space-y-6 select-none">
                  
                  {/* Audit Logs card */}
                  <div className={`${t.cardBgOpaque} rounded-2xl p-7 shadow-xl space-y-5 flex flex-col justify-between min-h-[420px]`}>
                    <div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined ${t.accent} text-lg`}>lock_open</span>
                          <h3 className={`${t.text} font-serif text-sm font-bold tracking-wide`}>Admin Audit Trail</h3>
                        </div>
                        <button type="button" 
                          onClick={() => {
                            setAuditLogs([]);
                            triggerToast('Administrative logs cleared.', 'info');
                          }}
                          className={`text-[9px] font-bold ${t.textMuted} hover:text-white uppercase tracking-wider transition-colors cursor-pointer`}
                        >
                          Clear Trails
                        </button>
                      </div>

                      {/* Log entries */}
                      <div className="space-y-4 mt-5 max-h-[300px] overflow-y-auto pr-1">
                        {auditLogs.length === 0 ? (
                          <div className={`text-center py-12 text-xs ${t.textMutedDark} font-bold uppercase tracking-wider`}>
                            No log trails recorded.
                          </div>
                        ) : (
                          auditLogs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 text-[11px] leading-relaxed">
                              <span className={`material-symbols-outlined text-sm font-semibold mt-0.5 ${
                                log.type === 'warning' ? 'text-amber-400' :
                                log.type === 'error' ? 'text-red-400' :
                                log.type === 'success' ? 'text-emerald-400' :
                                log.type === 'security' ? 'text-purple-400' : t.accent
                              }`}>
                                {log.type === 'warning' ? 'warning' :
                                 log.type === 'error' ? 'error' :
                                 log.type === 'success' ? 'check_circle' :
                                 log.type === 'security' ? 'vpn_key' : 'info'}
                              </span>
                              <div className="flex-grow font-sans">
                                <span className={`font-bold ${t.text} block`}>{log.actor}</span>
                                <span className={`${t.textMuted} block text-[10px] mt-0.5`}>{log.action}</span>
                              </div>
                              <span className={`text-[8.5px] ${t.textMutedDark} font-mono font-medium flex-shrink-0 mt-0.5`}>{log.time}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <button type="button" 
                      onClick={() => triggerToast('Exporting secure system audit logs cryptographically...', 'success')}
                      className={`w-full py-3 ${t.buttonOutline} border rounded-xl font-sans font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer mt-5`}
                    >
                      Export Sealed Audit PDF
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-8 animate-fade-in duration-300">
              
              {/* Header section with Title and Buttons */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-4">
                <div className="select-none">
                  <h2 className="font-serif text-[38px] font-bold text-white tracking-wide leading-none">
                    {tr.menuWelcome}
                  </h2>
                  <p className="font-sans text-[12.5px] text-[#A69984]/65 mt-3 leading-relaxed max-w-2xl font-semibold">
                    {tr.menuDesc}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryFormName('');
                      setCategoryFormIcon('restaurant');
                      setShowCategoryManagerModal(true);
                    }}
                    className={`border ${t.accentLightBorder} hover:bg-[#ffe2ab]/5 ${t.accent} px-6 py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] cursor-pointer flex items-center gap-2 select-none`}
                  >
                    <span className="material-symbols-outlined text-sm font-bold">folder_open</span>
                    {tr.manageCats}
                  </button>
                  <button type="button"
                    onClick={() => {
                      setEditingMenuItem(null);
                      setMenuFormName('');
                      setMenuFormCategory(categories[0]?.id || 'starters');
                      setMenuFormPrice(0);
                      setMenuFormCost(0);
                      setMenuFormDescription('');
                      setMenuFormImage('/images/wagyu_beef_tartare.png');
                      setMenuFormTags([]);
                      setMenuFormMealPeriod('both');
                      setShowMenuAddEditModal(true);
                    }}
                    className="bg-[#ffe2ab] hover:bg-[#ffdca0] text-[#402d00] px-6 py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_4px_16px_rgba(255,226,171,0.15)] hover:scale-[1.01] cursor-pointer flex items-center gap-2 select-none"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                    {tr.addMenuItem}
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[130px]`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>{tr.totalItems}</p>
                      <h3 className={`text-2xl font-bold font-mono ${t.text} mt-1`}>{menuItemsList.length}</h3>
                    </div>
                    <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                      <span className="material-symbols-outlined text-sm">restaurant_menu</span>
                    </div>
                  </div>
                </div>

                <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[130px]`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>{tr.specDishes}</p>
                      <h3 className={`text-2xl font-bold font-mono ${t.text} mt-1`}>{menuItemsList.filter(item => item.category === 'special').length}</h3>
                    </div>
                    <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    </div>
                  </div>
                </div>

                <div className={`${t.cardBg} border rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[130px]`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>{tr.avgProfit}</p>
                      <h3 className={`text-2xl font-bold font-mono ${t.text} mt-1`}>
                        {(menuItemsList.length > 0 
                          ? (menuItemsList.reduce((sum, item) => sum + ((item.price - (item.cost || 0)) / (item.price || 1) * 100), 0) / menuItemsList.length)
                          : 0
                        ).toFixed(1)}%
                      </h3>
                    </div>
                    <div className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table container */}
              <div className={`${t.cardBg} border rounded-2xl shadow-xl overflow-hidden`}>
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center select-none">
                  <div className="relative w-full md:w-[280px]">
                    <span className={`material-symbols-outlined absolute left-3 top-2.5 ${t.textMutedDark} text-sm`}>search</span>
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`bg-transparent border ${t.inputBorder} rounded-xl pl-9 pr-4 py-2 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/20 w-full transition-colors font-medium`}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${t.border} ${t.inputBg}/50 text-[9.5px] font-bold ${t.textMuted} uppercase tracking-widest`}>
                        <th className="px-6 py-4">{tr.itemCol}</th>
                        <th className="px-6 py-4">{tr.categoryCol}</th>
                        <th className="px-6 py-4 text-right">{tr.costCol}</th>
                        <th className="px-6 py-4 text-right">{tr.priceCol}</th>
                        <th className="px-6 py-4 text-right">{tr.marginCol}</th>
                        <th className="px-6 py-4 text-center">{tr.actionsCol}</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.divider} font-sans text-xs`}>
                      {menuItemsList
                        .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((item) => {
                          const margin = item.price > 0 ? ((item.price - (item.cost || 0)) / item.price * 100) : 0;
                          let marginColor = 'text-emerald-400';
                          if (margin < 50) marginColor = 'text-rose-400';
                          else if (margin < 70) marginColor = 'text-amber-400';

                          return (
                            <tr key={item.id} className={`hover:${t.cardHover} transition-colors`}>
                              <td className="px-6 py-4 flex items-center gap-3">
                                <div className={`w-[48px] h-[48px] rounded-lg overflow-hidden border ${t.borderStrong} flex-shrink-0 bg-black`}>
                                  <img 
                                    src={item.image || '/images/wagyu_beef_tartare.png'} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/images/wagyu_beef_tartare.png';
                                    }}
                                  />
                                </div>
                                <div className="max-w-[300px]">
                                  <div className={`font-bold ${t.text} tracking-wide text-sm flex items-center gap-1.5`}>
                                    {item.name}
                                    {item.category === 'special' && (
                                      <span className="material-symbols-outlined text-xs text-amber-400 fill-amber-400" title="Special Dish">star</span>
                                    )}
                                  </div>
                                  <div className={`text-[10px] ${t.textMutedLight} font-semibold truncate mt-0.5`}>
                                    {item.description}
                                  </div>
                                  <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
                                    {/* Meal Period Badge */}
                                    {item.mealPeriod === 'lunch' && (
                                      <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] uppercase tracking-wide text-amber-400 font-semibold flex items-center gap-1">
                                        <span>🌤️</span> {tr.lunchOnly}
                                      </span>
                                    )}
                                    {item.mealPeriod === 'dinner' && (
                                      <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[8px] uppercase tracking-wide text-indigo-400 font-semibold flex items-center gap-1">
                                        <span>🌙</span> {tr.dinnerOnly}
                                      </span>
                                    )}
                                    {(item.mealPeriod === 'both' || !item.mealPeriod) && (
                                      <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] uppercase tracking-wide text-emerald-400 font-semibold flex items-center gap-1">
                                        <span>📅</span> {tr.bothMeals}
                                      </span>
                                    )}
                                    {(item.tags || []).map((tag: string) => (
                                      <span key={tag} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] uppercase tracking-wide text-white/50">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className={`px-6 py-4 align-middle capitalize text-xs ${t.textMuted}`}>
                                {categories.find(c => c.id === item.category)?.name || item.category}
                              </td>
                              <td className="px-6 py-4 text-right align-middle font-mono font-bold text-white/70">
                                {formatCurrency(item.cost || 0)}
                              </td>
                              <td className="px-6 py-4 text-right align-middle font-mono font-bold text-[#ffe2ab]">
                                {formatCurrency(item.price || 0)}
                              </td>
                              <td className={`px-6 py-4 text-right align-middle font-mono font-bold ${marginColor}`}>
                                {margin.toFixed(1)}%
                              </td>
                              <td className="px-6 py-4 align-middle">
                                <div className="flex items-center justify-center gap-2">
                                  <button type="button"
                                    onClick={() => handleToggleSpecial(item)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${item.category === 'special' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : `${t.borderStrong} hover:border-amber-500/20 text-[#A69984] hover:text-amber-400`} cursor-pointer`}
                                    title={item.category === 'special' ? "Remove from Specials" : "Make Special Dish"}
                                  >
                                    <span className={`material-symbols-outlined text-[15px] ${item.category === 'special' ? 'fill-amber-400' : ''}`}>auto_awesome</span>
                                  </button>
                                  <button type="button"
                                    onClick={() => {
                                      setEditingMenuItem(item);
                                      setMenuFormName(item.name);
                                      setMenuFormCategory(item.category);
                                      setMenuFormPrice(item.price);
                                      setMenuFormCost(item.cost || 0);
                                      setMenuFormDescription(item.description);
                                      setMenuFormImage(item.image || '/images/wagyu_beef_tartare.png');
                                      setMenuFormTags(item.tags || []);
                                      setMenuFormMealPeriod(item.mealPeriod || 'both');
                                      setShowMenuAddEditModal(true);
                                    }}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border ${t.borderStrong} hover:border-[#ffe2ab]/20 text-[#A69984] hover:text-[#ffe2ab] transition-colors cursor-pointer`}
                                    title="Edit Item"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">edit</span>
                                  </button>
                                  <button type="button"
                                    onClick={() => handleDeleteMenuItem(item.id)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border ${t.borderStrong} hover:border-red-500/20 text-[#A69984] hover:text-red-400 transition-colors cursor-pointer`}
                                    title="Delete Item"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      {menuItemsList.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-16 text-[#A69984]/40 font-sans text-sm select-none">
                            No menu items found. Click "Add Menu Item" to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
               TAB: ANALYTICS
          ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'analytics' && (() => {
            // ── Mock dataset keyed by range ──────────────────────────
            const datasets = {
              today: {
                revenue: 8420, orders: 64, covers: 148, avgCheck: 131.56,
                revTrend: [320, 490, 870, 1240, 1580, 1320, 880, 640, 510, 300, 120, 150],
                trendLabels: ['11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p'],
                dineIn: 68, takeaway: 22, delivery: 10,
                peakHours: [12, 28, 64, 100, 88, 52, 76, 96, 80, 44, 20, 10],
              },
              week: {
                revenue: 52840, orders: 398, covers: 912, avgCheck: 132.77,
                revTrend: [6200, 7800, 5900, 8100, 9400, 7600, 7840],
                trendLabels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
                dineIn: 65, takeaway: 24, delivery: 11,
                peakHours: [8, 22, 58, 100, 84, 46, 72, 94, 76, 40, 18, 8],
              },
              month: {
                revenue: 214600, orders: 1612, covers: 3740, avgCheck: 133.12,
                revTrend: [7200, 8100, 6800, 9200, 7600, 8900, 7400, 8600, 9800, 7100, 8200, 9600,
                           7800, 8400, 6900, 9100, 8300, 7500, 9400, 8700, 7200, 8000, 9300, 7600,
                           8500, 7100, 9700, 8200, 7900, 8600],
                trendLabels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
                dineIn: 64, takeaway: 25, delivery: 11,
                peakHours: [7, 20, 55, 100, 82, 44, 68, 92, 74, 38, 16, 7],
              },
              '30days': {
                revenue: 198400, orders: 1490, covers: 3420, avgCheck: 133.15,
                revTrend: [7100, 7900, 6700, 9000, 7500, 8700, 7300, 8500, 9700, 7000, 8100, 9500,
                           7700, 8300, 6800, 9000, 8200, 7400, 9300, 8600, 7100, 7900, 9200, 7500,
                           8400, 7000, 9600, 8100, 7800, 8500],
                trendLabels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
                dineIn: 63, takeaway: 26, delivery: 11,
                peakHours: [6, 19, 53, 98, 80, 43, 66, 90, 72, 36, 15, 6],
              },
            };
            const d = datasets[analyticsRange];
            const trendMax = Math.max(...d.revTrend, 1);
            const peakMax = Math.max(...d.peakHours, 1);

            const topItems = [
              { name: 'Wagyu Ribeye 12oz', category: 'Mains', sold: 142, revenue: 20590 },
              { name: 'Truffle Risotto', category: 'Mains', sold: 198, revenue: 15048 },
              { name: 'Dom Pérignon 2012', category: 'Beverages', sold: 48, revenue: 14880 },
              { name: 'Seared Scallops', category: 'Starters', sold: 214, revenue: 9202 },
              { name: 'Burrata Salad', category: 'Starters', sold: 176, revenue: 5808 },
              { name: 'Crème Brûlée', category: 'Desserts', sold: 230, revenue: 5290 },
              { name: 'Old Fashioned', category: 'Cocktails', sold: 310, revenue: 4960 },
              { name: 'Sourdough & Butter', category: 'Sides', sold: 412, revenue: 3708 },
            ];
            const itemRevMax = Math.max(...topItems.map(i => i.revenue), 1);

            const staffData = [
              { name: 'Elena Rodriguez', role: 'Head Sommelier', orders: 84, revenue: 18420, rating: 4.9, covers: 196 },
              { name: 'Sarah Jenkins', role: "Maître D'", orders: 72, revenue: 15680, rating: 5.0, covers: 168 },
              { name: 'Marcus Chen', role: 'Sous Chef', orders: 96, revenue: 14200, rating: 4.8, covers: 0 },
              { name: 'James Park', role: 'Server', orders: 68, revenue: 11940, rating: 4.7, covers: 152 },
              { name: 'Amara Osei', role: 'Bartender', orders: 112, revenue: 9800, rating: 4.8, covers: 0 },
            ];

            const payMethods = [
              { label: 'Card', pct: 68, color: 'bg-sky-400', textColor: 'text-sky-400', amount: Math.round(d.revenue * 0.68) },
              { label: 'Cash', pct: 19, color: 'bg-amber-400', textColor: 'text-amber-400', amount: Math.round(d.revenue * 0.19) },
              { label: 'Digital Wallet', pct: 13, color: 'bg-violet-400', textColor: 'text-violet-400', amount: Math.round(d.revenue * 0.13) },
            ];

            const rangeOpts: { key: typeof analyticsRange; label: string }[] = [
              { key: 'today', label: tr.analyticsToday },
              { key: 'week', label: tr.analyticsWeek },
              { key: 'month', label: tr.analyticsMonth },
              { key: '30days', label: tr.analytics30 },
            ];

            const dashAuditTransactions = [
              { id: '#ORD-9021', time: 'Oct 24, 2023 21:45 PM', method: 'CARD', amount: 342.50, status: 'Success' },
              { id: '#ORD-9020', time: 'Oct 24, 2023 21:12 PM', method: 'CASH', amount: 85.00, status: 'Success' },
              { id: '#ORD-9019', time: 'Oct 24, 2023 20:45 PM', method: 'DIGITAL WALLET', amount: 510.25, status: 'Success' },
              { id: '#ORD-9018', time: 'Oct 24, 2023 20:15 PM', method: 'SPLIT', amount: 124.00, status: 'Success' },
              { id: '#ORD-9017', time: 'Oct 24, 2023 19:30 PM', method: 'CARD', amount: 215.40, status: 'Success' },
              { id: '#ORD-9016', time: 'Oct 24, 2023 18:50 PM', method: 'CASH', amount: 45.00, status: 'Success' },
              { id: '#ORD-9015', time: 'Oct 24, 2023 18:10 PM', method: 'CARD', amount: 189.50, status: 'Success' },
              { id: '#ORD-9014', time: 'Oct 24, 2023 17:40 PM', method: 'SPLIT', amount: 295.00, status: 'Success' },
              { id: '#ORD-9013', time: 'Oct 24, 2023 16:15 PM', method: 'DIGITAL WALLET', amount: 68.20, status: 'Success' },
              { id: '#ORD-9012', time: 'Oct 24, 2023 15:30 PM', method: 'CARD', amount: 155.00, status: 'Success' },
              { id: '#ORD-9011', time: 'Oct 24, 2023 14:45 PM', method: 'CASH', amount: 112.50, status: 'Success' },
              { id: '#ORD-9010', time: 'Oct 24, 2023 13:20 PM', method: 'CARD', amount: 94.00, status: 'Success' },
            ];

            const dashFilteredAudit = dashAuditTransactions.filter(tx => 
              tx.id.toLowerCase().includes(dashAuditSearch.toLowerCase()) ||
              tx.method.toLowerCase().includes(dashAuditSearch.toLowerCase())
            );

            const dashItemsPerPage = 5;
            const dashTotalAuditPages = Math.ceil(dashFilteredAudit.length / dashItemsPerPage);
            const dashCurrentAuditPage = Math.min(dashAuditPage, dashTotalAuditPages || 1);
            const dashPaginatedAudit = dashFilteredAudit.slice((dashCurrentAuditPage - 1) * dashItemsPerPage, dashCurrentAuditPage * dashItemsPerPage);

            const dashCashCount = dashFilteredAudit.filter(t => t.method === 'CASH').length;
            const dashCardCount = dashFilteredAudit.filter(t => t.method === 'CARD').length;
            const dashWalletCount = dashFilteredAudit.filter(t => t.method === 'DIGITAL WALLET').length;
            const dashSplitCount = dashFilteredAudit.filter(t => t.method === 'SPLIT').length;
            const dashTotalOrdersCount = dashFilteredAudit.length;

            const handleDashboardExportCSV = () => {
              const header = ['Transaction ID', 'Time', 'Payment Method', 'Amount ($)', 'Status'];
              const rows = dashFilteredAudit.map(tx => [
                tx.id,
                tx.time,
                tx.method === 'DIGITAL WALLET' ? 'Digital Wallet' : tx.method,
                tx.amount.toFixed(2),
                tx.status
              ]);
              const csvContent = [header, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `dineposai_dashboard_analytics_${analyticsRange}_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              triggerToast('Analytics transactions exported successfully as CSV.', 'success');
            };

            return (
              <div className="space-y-8 font-sans animate-fade-in duration-300">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className={`font-serif text-[38px] font-bold ${t.text} tracking-wide leading-none`}>
                      {tr.analyticsTitle}
                    </h1>
                    <p className={`${t.textMuted} text-[12.5px] font-semibold mt-2 leading-relaxed`}>
                      {tr.analyticsDesc}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Range selector */}
                    <div className={`flex gap-1 ${t.cardBgOpaque} border ${t.border} rounded-xl p-1`}>
                      {rangeOpts.map(r => (
                        <button type="button"
                          key={r.key}
                          onClick={() => setAnalyticsRange(r.key)}
                          className={`px-3.5 py-2 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            analyticsRange === r.key
                              ? `${t.accentBg} ${t.accentText}`
                              : `${t.textMuted} hover:text-white`
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                    <button type="button"
                      onClick={handleDashboardExportCSV}
                      className={`flex items-center gap-2 px-4 py-2.5 border ${t.border} ${t.textMuted} hover:${t.text} rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer`}
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      {tr.analyticsExport}
                    </button>
                  </div>
                </div>

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { label: tr.analyticsRevenue, value: `${formatCurrency(d.revenue)}`, sub: analyticsRange === 'today' ? 'vs $7,840 yesterday' : '+8.3% vs prior period', icon: 'payments', color: t.accent, trend: true },
                    { label: tr.analyticsOrders, value: d.orders.toLocaleString(), sub: `${(d.orders / (analyticsRange === 'today' ? 1 : analyticsRange === 'week' ? 7 : 30)).toFixed(1)} orders/day avg`, icon: 'receipt_long', color: 'text-sky-400', trend: true },
                    { label: tr.analyticsAvgCheck, value: `${formatCurrency(d.avgCheck)}`, sub: 'per cover incl. gratuity', icon: 'person', color: 'text-emerald-400', trend: false },
                    { label: tr.analyticsCovers, value: d.covers.toLocaleString(), sub: `${(d.covers / (analyticsRange === 'today' ? 1 : analyticsRange === 'week' ? 7 : 30)).toFixed(0)} covers/day avg`, icon: 'groups', color: 'text-violet-400', trend: false },
                  ].map(kpi => (
                    <div key={kpi.label} className={`${t.cardBgOpaque} border ${t.border} rounded-2xl p-6 flex flex-col justify-between min-h-[130px] shadow-lg`}>
                      <div className="flex justify-between items-start">
                        <span className={`font-bold text-[9.5px] ${t.textMuted} uppercase tracking-widest leading-none`}>{kpi.label}</span>
                        <span className={`material-symbols-outlined text-lg ${kpi.color}`}>{kpi.icon}</span>
                      </div>
                      <div className="mt-3">
                        <div className={`font-serif text-[28px] font-bold ${kpi.color} leading-none tracking-tight`}>{kpi.value}</div>
                        <div className={`text-[10px] font-semibold mt-1.5 flex items-center gap-1 ${kpi.trend ? 'text-emerald-400' : t.textMuted}`}>
                          {kpi.trend && <span className="material-symbols-outlined text-xs">arrow_upward</span>}
                          {kpi.sub}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Revenue Trend ── */}
                <div className={`${t.cardBgOpaque} border ${t.border} rounded-2xl p-7 shadow-lg`}>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className={`${t.text} font-bold text-sm tracking-wide`}>{tr.analyticsRevTrend}</h3>
                      <p className={`${t.textMuted} text-[10px] font-semibold mt-0.5`}>
                        {formatCurrency(d.revenue)} total · {d.trendLabels.length} data points
                      </p>
                    </div>
                    <span className={`material-symbols-outlined text-xl ${t.accent}`}>show_chart</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-[100px]">
                    {d.revTrend.map((val, i) => {
                      const pct = (val / trendMax) * 100;
                      const isLast = i === d.revTrend.length - 1;
                      const isHigh = val === trendMax;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                          <div className="w-full relative flex items-end justify-center" style={{ height: '82px' }}>
                            <div
                              className={`w-full rounded-t-lg transition-all duration-700 ${isLast ? t.accentBg : isHigh ? `${t.accentBg} opacity-60` : 'bg-white/10 group-hover:bg-white/15'}`}
                              style={{ height: `${Math.max(pct, 4)}%` }}
                            />
                          </div>
                          {d.trendLabels.length <= 12 && (
                            <span className={`text-[7.5px] ${t.textMutedLight} font-bold uppercase leading-none`}>{d.trendLabels[i]}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Orders by Type + Peak Hours ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Orders by Type */}
                  <div className={`lg:col-span-5 ${t.cardBgOpaque} border ${t.border} rounded-2xl p-7 shadow-lg`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className={`${t.text} font-bold text-sm tracking-wide`}>{tr.analyticsOrderTypes}</h3>
                      <span className={`material-symbols-outlined text-xl text-violet-400`}>donut_large</span>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: tr.analyticsDineIn, pct: d.dineIn, color: 'bg-amber-400', textColor: t.accent },
                        { label: tr.analyticsTakeaway, pct: d.takeaway, color: 'bg-sky-400', textColor: 'text-sky-400' },
                        { label: tr.analyticsDelivery, pct: d.delivery, color: 'bg-violet-400', textColor: 'text-violet-400' },
                      ].map(row => (
                        <div key={row.label}>
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${row.color}`} />
                              <span className={`text-[11px] ${t.text} font-semibold`}>{row.label}</span>
                            </div>
                            <span className={`text-[11px] font-bold ${row.textColor}`}>{row.pct}%</span>
                          </div>
                          <div className={`w-full ${t.inputBg} rounded-full h-2`}>
                            <div className={`${row.color} h-2 rounded-full transition-all duration-700`} style={{ width: `${row.pct}%` }} />
                          </div>
                          <div className={`text-[9px] ${t.textMuted} font-semibold mt-1`}>
                            {Math.round(d.orders * row.pct / 100)} orders
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Donut visual */}
                    <div className="mt-6 pt-5 border-t border-white/5 flex items-center gap-6">
                      <div className="relative w-[64px] h-[64px] flex-shrink-0">
                        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
                          <circle cx="32" cy="32" r="24" fill="none" stroke="#ffc53d" strokeWidth="10"
                            strokeDasharray={`${(d.dineIn / 100) * 150.8} 150.8`} strokeLinecap="butt"/>
                          <circle cx="32" cy="32" r="24" fill="none" stroke="#38bdf8" strokeWidth="10"
                            strokeDasharray={`${(d.takeaway / 100) * 150.8} 150.8`}
                            strokeDashoffset={`-${(d.dineIn / 100) * 150.8}`} strokeLinecap="butt"/>
                          <circle cx="32" cy="32" r="24" fill="none" stroke="#a78bfa" strokeWidth="10"
                            strokeDasharray={`${(d.delivery / 100) * 150.8} 150.8`}
                            strokeDashoffset={`-${((d.dineIn + d.takeaway) / 100) * 150.8}`} strokeLinecap="butt"/>
                        </svg>
                      </div>
                      <div className="text-[10px] font-semibold space-y-1.5">
                        <div className={`${t.textMuted}`}>Total orders this period</div>
                        <div className={`font-serif text-2xl font-bold ${t.text}`}>{d.orders.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Peak Hours */}
                  <div className={`lg:col-span-7 ${t.cardBgOpaque} border ${t.border} rounded-2xl p-7 shadow-lg`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className={`${t.text} font-bold text-sm tracking-wide`}>{tr.analyticsPeakHours}</h3>
                        <p className={`${t.textMuted} text-[10px] font-semibold mt-0.5`}>Normalised order volume by hour of day</p>
                      </div>
                      <span className="material-symbols-outlined text-xl text-emerald-400">schedule</span>
                    </div>
                    <div className="flex items-end gap-1 h-[90px]">
                      {d.peakHours.map((val, i) => {
                        const pct = (val / peakMax) * 100;
                        const hour = 11 + i;
                        const label = hour <= 12 ? `${hour}a` : `${hour - 12}p`;
                        const isLunch = i >= 1 && i <= 3;
                        const isDinner = i >= 6 && i <= 8;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="w-full" style={{ height: '72px', display: 'flex', alignItems: 'flex-end' }}>
                              <div
                                className={`w-full rounded-t-md transition-all duration-700 ${
                                  isLunch ? 'bg-amber-400/70' : isDinner ? `${t.accentBg} opacity-80` : 'bg-white/10 group-hover:bg-white/15'
                                }`}
                                style={{ height: `${Math.max(pct, 3)}%` }}
                              />
                            </div>
                            <span className={`text-[7px] ${t.textMutedLight} font-bold uppercase`}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-6 text-[10px] font-semibold">
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400/70 inline-block"/><span className={t.textMuted}>Lunch rush</span></div>
                      <div className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-sm ${t.accentBg} opacity-80 inline-block`}/><span className={t.textMuted}>Dinner service</span></div>
                    </div>
                  </div>
                </div>

                {/* ── Top Menu Items ── */}
                <div className={`${t.cardBgOpaque} border ${t.border} rounded-2xl overflow-hidden shadow-lg`}>
                  <div className={`px-7 py-5 border-b ${t.border} flex justify-between items-center`}>
                    <div>
                      <h3 className={`${t.text} font-bold text-sm tracking-wide`}>{tr.analyticsTopItems}</h3>
                      <p className={`${t.textMuted} text-[10px] font-semibold mt-0.5`}>Ranked by gross revenue · all categories</p>
                    </div>
                    <span className={`material-symbols-outlined text-xl ${t.accent}`}>restaurant_menu</span>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {topItems.map((item, idx) => (
                      <div key={item.name} className={`px-7 py-4 flex items-center gap-5 hover:bg-white/[0.015] transition-colors`}>
                        <span className={`font-serif text-lg font-bold w-6 text-right flex-shrink-0 ${idx === 0 ? t.accent : t.textMuted}`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className={`${t.text} font-bold text-[12.5px] truncate`}>{item.name}</div>
                          <div className={`${t.textMuted} text-[9.5px] font-semibold mt-0.5`}>{item.category} · {item.sold} sold</div>
                          <div className={`w-full mt-2 ${t.inputBg} rounded-full h-1.5`}>
                            <div
                              className={`h-1.5 rounded-full transition-all duration-700 ${idx === 0 ? t.accentBg : 'bg-white/20'}`}
                              style={{ width: `${(item.revenue / itemRevMax) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className={`font-serif font-bold text-sm flex-shrink-0 ${idx === 0 ? t.accent : t.text}`}>
                          {formatCurrency(item.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Staff + Payment Methods ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Staff Performance */}
                  <div className={`lg:col-span-8 ${t.cardBgOpaque} border ${t.border} rounded-2xl overflow-hidden shadow-lg`}>
                    <div className={`px-7 py-5 border-b ${t.border} flex justify-between items-center`}>
                      <h3 className={`${t.text} font-bold text-sm tracking-wide`}>{tr.analyticsStaffPerf}</h3>
                      <span className="material-symbols-outlined text-xl text-emerald-400">badge</span>
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className={`border-b ${t.border}`}>
                          {['Staff Member', 'Orders', 'Revenue', 'Avg Rating', 'Covers'].map(h => (
                            <th key={h} className={`px-5 py-3 text-[9px] ${t.textMuted} font-bold uppercase tracking-widest`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {staffData.map((s, i) => (
                          <tr key={s.name} className="hover:bg-white/[0.015] transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black ${i === 0 ? `${t.accentBg} ${t.accentText}` : 'bg-white/5 text-white/50'}`}>
                                  {s.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <div className={`${t.text} font-bold text-[11.5px]`}>{s.name}</div>
                                  <div className={`${t.textMuted} text-[9.5px] font-semibold`}>{s.role}</div>
                                </div>
                              </div>
                            </td>
                            <td className={`px-5 py-4 ${t.text} font-bold text-sm`}>{s.orders}</td>
                            <td className={`px-5 py-4 font-bold text-sm ${t.accent}`}>{formatCurrency(s.revenue)}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                                <span className={`${t.text} font-bold text-sm`}>{s.rating.toFixed(1)}</span>
                              </div>
                            </td>
                            <td className={`px-5 py-4 ${t.textMuted} font-semibold text-sm`}>
                              {s.covers > 0 ? s.covers : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Payment Methods */}
                  <div className={`lg:col-span-4 ${t.cardBgOpaque} border ${t.border} rounded-2xl p-7 shadow-lg`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className={`${t.text} font-bold text-sm tracking-wide`}>{tr.analyticsPayMethods}</h3>
                      <span className="material-symbols-outlined text-xl text-sky-400">credit_card</span>
                    </div>
                    <div className="space-y-5">
                      {payMethods.map(pm => (
                        <div key={pm.label}>
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${pm.color}`} />
                              <span className={`text-[11px] ${t.text} font-semibold`}>{pm.label}</span>
                            </div>
                            <span className={`text-[11px] font-bold ${pm.textColor}`}>{pm.pct}%</span>
                          </div>
                          <div className={`w-full ${t.inputBg} rounded-full h-2`}>
                            <div className={`${pm.color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pm.pct}%` }} />
                          </div>
                          <div className={`text-[9px] ${t.textMuted} font-semibold mt-1`}>{formatCurrency(pm.amount)}</div>
                        </div>
                      ))}
                    </div>

                    <div className={`mt-6 pt-5 border-t ${t.border} space-y-3`}>
                      {[
                        { label: 'Avg transaction', val: formatCurrency(d.revenue / d.orders) },
                        { label: 'Largest transaction', val: formatCurrency(482) },
                        { label: 'Refunds issued', val: formatCurrency(124) },
                      ].map(stat => (
                        <div key={stat.label} className="flex justify-between items-center">
                          <span className={`text-[10px] ${t.textMuted} font-semibold`}>{stat.label}</span>
                          <span className={`text-[11px] ${t.text} font-bold`}>{stat.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audit Trail & Payments Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch select-none">
                  
                  {/* Payments Widget (Span 4) */}
                  <div className={`${t.cardBgOpaque} border ${t.border} rounded-2xl p-7 shadow-lg flex flex-col justify-between`}>
                    <div>
                      <div className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-widest mb-6`}>
                        Payments
                      </div>
                      
                      <div className="flex flex-col items-center justify-center py-8">
                        <span className={`text-[56px] font-bold ${t.text} leading-none font-sans`}>{dashTotalOrdersCount}</span>
                        <span className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-widest mt-1`}>Orders</span>
                      </div>
                    </div>
                    
                    <div className={`space-y-4 pt-4 border-t ${t.border}`}>
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className={`uppercase tracking-wider text-[11px] ${t.textMuted}`}>Cash</span>
                        </div>
                        <span className={`font-mono text-sm ${t.text}`}>{dashCashCount}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <span className={`uppercase tracking-wider text-[11px] ${t.textMuted}`}>Card</span>
                        </div>
                        <span className={`font-mono text-sm ${t.text}`}>{dashCardCount}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                          <span className={`uppercase tracking-wider text-[11px] ${t.textMuted}`}>Digital Wallet</span>
                        </div>
                        <span className={`font-mono text-sm ${t.text}`}>{dashWalletCount}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                          <span className={`uppercase tracking-wider text-[11px] ${t.textMuted}`}>Split</span>
                        </div>
                        <span className={`font-mono text-sm ${t.text}`}>{dashSplitCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Audit Trail Widget (Span 8) */}
                  <div className={`${t.cardBgOpaque} border ${t.border} rounded-2xl p-7 shadow-lg flex flex-col justify-between`}>
                    <div>
                      {/* Header */}
                      <div className={`flex flex-col sm:flex-row justify-between sm:items-center border-b ${t.border} pb-4 gap-4`}>
                        <div>
                          <h3 className={`${t.text} font-serif text-sm font-bold tracking-wide uppercase`}>Audit Trail</h3>
                          <div className={`text-[9px] ${t.textMuted} font-bold uppercase tracking-widest mt-1.5`}>
                            {dashFilteredAudit.length} Total Transactions Found
                          </div>
                        </div>
                        
                        {/* Search */}
                        <div className="relative w-full sm:w-[240px]">
                          <span className={`material-symbols-outlined absolute left-3.5 top-2.5 ${t.textMuted} text-sm`}>search</span>
                          <input
                            type="text"
                            placeholder="Search ID or method..."
                            value={dashAuditSearch}
                            onChange={(e) => {
                              setDashAuditSearch(e.target.value);
                              setDashAuditPage(1);
                            }}
                            className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl pl-9 pr-4 py-2 text-xs ${t.text} placeholder-white/20 focus:outline-none focus:border-[#ffe2ab]/20 transition-all font-medium`}
                          />
                        </div>
                      </div>

                      {/* Records / Table */}
                      <div className="mt-4 overflow-x-auto min-h-[220px]">
                        {dashPaginatedAudit.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 text-center select-none">
                            <span className={`material-symbols-outlined text-4xl ${t.textMuted} opacity-30 mb-3`}>inventory_2</span>
                            <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-widest`}>No records in range</p>
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className={`text-[9.5px] font-bold ${t.textMuted} uppercase tracking-widest border-b ${t.border}`}>
                                <th className="pb-3 pr-4">Transaction ID</th>
                                <th className="pb-3 px-4">Date & Time</th>
                                <th className="pb-3 px-4">Method</th>
                                <th className="pb-3 px-4 text-right">Amount</th>
                                <th className="pb-3 pl-4">Status</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${t.divider} text-xs font-sans`}>
                              {dashPaginatedAudit.map((tx) => (
                                <tr key={tx.id} className={`hover:${t.cardHover} transition-colors`}>
                                  <td className={`py-3 pr-4 font-bold ${t.text} tracking-wider`}>{tx.id}</td>
                                  <td className={`py-3 px-4 ${t.textMuted} font-semibold`}>{tx.time}</td>
                                  <td className="py-3 px-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9.5px] font-bold border uppercase tracking-wider ${
                                      tx.method === 'CASH' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                      tx.method === 'CARD' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                      tx.method === 'DIGITAL WALLET' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                      'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                                    }`}>
                                      {tx.method === 'DIGITAL WALLET' ? 'DIGITAL WALLET' : tx.method}
                                    </span>
                                  </td>
                                  <td className={`py-3 px-4 text-right font-mono font-bold ${t.accent}`}>{typeof tx.amount === 'number' ? `$${tx.amount.toFixed(2)}` : tx.amount}</td>
                                  <td className="py-3 pl-4">
                                    <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                      {tx.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                    {/* Pagination Controls */}
                    {dashFilteredAudit.length > 0 && (
                      <div className={`flex justify-between items-center text-[10px] ${t.textMuted} font-bold uppercase tracking-wider pt-4 border-t ${t.border} select-none`}>
                        <span>
                          Showing {((dashCurrentAuditPage - 1) * dashItemsPerPage) + 1}-{Math.min(dashCurrentAuditPage * dashItemsPerPage, dashFilteredAudit.length)} of {dashFilteredAudit.length} entries
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={dashCurrentAuditPage === 1}
                            onClick={() => setDashAuditPage(prev => Math.max(prev - 1, 1))}
                            className={`w-7 h-7 rounded-lg border ${t.border} flex items-center justify-center ${t.text} transition-colors cursor-pointer ${
                              dashCurrentAuditPage === 1 ? 'opacity-30 cursor-not-allowed' : `bg-white/5 hover:${t.cardHover}`
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                          </button>
                          
                          {Array.from({ length: dashTotalAuditPages }, (_, idx) => {
                            const pageNum = idx + 1;
                            return (
                              <button
                                type="button"
                                key={pageNum}
                                onClick={() => setDashAuditPage(pageNum)}
                                className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                                  dashCurrentAuditPage === pageNum
                                    ? `${t.accentBg} ${t.accentText}`
                                    : `bg-white/5 hover:${t.cardHover} ${t.textMuted} hover:text-white border ${t.border}`
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          
                          <button
                            type="button"
                            disabled={dashCurrentAuditPage === dashTotalAuditPages}
                            onClick={() => setDashAuditPage(prev => Math.min(prev + 1, dashTotalAuditPages))}
                            className={`w-7 h-7 rounded-lg border ${t.border} flex items-center justify-center ${t.text} transition-colors cursor-pointer ${
                              dashCurrentAuditPage === dashTotalAuditPages ? 'opacity-30 cursor-not-allowed' : `bg-white/5 hover:${t.cardHover}`
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            );
          })()}

          {/* Fallback Placeholder tab for other sections */}
          {activeTab !== 'operations' && activeTab !== 'receipts' && activeTab !== 'staff' && activeTab !== 'payments' && activeTab !== 'hardware' && activeTab !== 'general' && activeTab !== 'security' && activeTab !== 'menu' && activeTab !== 'analytics' && (
            <div className={`text-center py-36 select-none border border-dashed ${t.border} rounded-2xl ${t.inputBg}/30`}>
              <span className={`material-symbols-outlined text-5xl ${t.accent} opacity-40 motion-safe:animate-pulse font-light mb-4 block`}>construction</span>
              <h3 className={`font-serif text-xl ${t.text} mb-2 tracking-wide capitalize`}>{activeTab} Dashboard Panel</h3>
              <p className={`font-sans text-xs font-semibold max-w-sm mx-auto ${t.textMuted}`}>
                Auditing tools and administrative controls for {activeTab} parameters are currently being synchronized.
              </p>
              <button type="button" 
                onClick={() => setActiveTab('operations')}
                className={`mt-6 px-5 py-2.5 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} font-sans font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer`}
              >
                Back to Operations Config
              </button>
            </div>
          )}

        </div>

      </div>      {/* SHIFT EDITING MODAL */}
      {editingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[380px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-base ${t.accent} font-bold tracking-wide`}>Edit Shift</h3>
              <button type="button" 
                onClick={() => setEditingShift(null)}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>Employee</p>
                <p className={`${t.text} font-bold mt-1 text-sm`}>{editingShift.employee}</p>
              </div>
              <div>
                <p className={`text-[10px] ${t.textMuted} font-bold uppercase tracking-wider`}>Day</p>
                <p className={`${t.text} font-semibold mt-1 text-xs`}>{editingShift.day}</p>
              </div>
              
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Shift Time</label>
                <div className="relative">
                  <select
                    aria-label="Shift time"
                    value={rosterShifts[editingShift.employee]?.[editingShift.day] || 'OFF'}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      setRosterShifts(prev => ({
                        ...prev,
                        [editingShift.employee]: {
                          ...prev[editingShift.employee],
                          [editingShift.day]: newTime
                        }
                      }));
                      setEditingShift(null);
                      triggerToast(`Updated shift for ${editingShift.employee} on ${editingShift.day} to ${newTime}`, 'success');
                      setAuditLogs(prev => [
                        {
                          id: Date.now(),
                          time: 'Just now',
                          actor: 'Admin',
                          action: `Assigned ${editingShift.employee} shift on ${editingShift.day} to ${newTime}`,
                          type: 'info'
                        },
                        ...prev
                      ]);
                    }}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="OFF">OFF (Rest Day)</option>
                    <option value="09:00 - 17:00">09:00 - 17:00 (Morning)</option>
                    <option value="10:00 - 18:00">10:00 - 18:00 (Day)</option>
                    <option value="14:00 - 22:00">14:00 - 22:00 (Mid/Swing)</option>
                    <option value="16:00 - 00:00">16:00 - 00:00 (Dinner)</option>
                    <option value="22:00 - 02:00">22:00 - 02:00 (Late Night)</option>
                    <option value="09:00 - 22:00">09:00 - 22:00 (Double)</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <button type="button" 
                onClick={() => setEditingShift(null)}
                className={`w-full py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center shadow-md`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ADD/EDIT EMPLOYEE MODAL */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className={`${t.cardBgOpaque} border w-[420px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up font-sans`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-lg ${t.accent} font-bold tracking-wide`}>
                {editingEmployee ? 'Edit Employee Details' : 'Add New Employee'}
              </h3>
              <button type="button" 
                onClick={() => {
                  setShowAddEmployeeModal(false);
                  setEditingEmployee(null);
                  setNewEmployee({
                    name: '',
                    role: 'Server',
                    status: 'OFF_DUTY',
                    performance: 5.0
                  });
                }}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newEmployee.name.trim()) {
                triggerToast('Please enter an employee name.', 'info');
                return;
              }
              if (editingEmployee) {
                const updatedMembers = staffMembers.map(member => 
                  member.id === editingEmployee.id 
                    ? { ...member, name: newEmployee.name, role: newEmployee.role, status: newEmployee.status, performance: newEmployee.performance }
                    : member
                );
                setStaffMembers(updatedMembers);
                triggerToast(`Successfully updated employee ${newEmployee.name}!`, 'success');
              } else {
                const newId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
                const addedMember = {
                  id: newId,
                  name: newEmployee.name,
                  role: newEmployee.role,
                  status: newEmployee.status,
                  performance: newEmployee.performance,
                  avatar: ''
                };
                setStaffMembers([...staffMembers, addedMember]);
                triggerToast(`Successfully added employee ${addedMember.name}!`, 'success');
              }
              setShowAddEmployeeModal(false);
              setEditingEmployee(null);
              setNewEmployee({
                name: '',
                role: 'Server',
                status: 'OFF_DUTY',
                performance: 5.0
              });
            }} className="space-y-4">
              {/* Name */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Full Name</label>
                <input 
                  type="text" 
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  placeholder="e.g. John Doe"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Role</label>
                <div className="relative">
                  <select
                    aria-label="Employee role"
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="Server">Server</option>
                    <option value="Bartender">Bartender</option>
                    <option value="Head Sommelier">Head Sommelier</option>
                    <option value="Maitre D'">Maitre D'</option>
                    <option value="Executive Sous Chef">Executive Sous Chef</option>
                    <option value="Line Cook">Line Cook</option>
                    <option value="Manager">Manager</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Status</label>
                <div className="relative">
                  <select
                    aria-label="Employee status"
                    value={newEmployee.status}
                    onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value})}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="ON_SHIFT">On Shift</option>
                    <option value="OFF_DUTY">Off Duty</option>
                    <option value="OVERTIME">Approaching (Overtime)</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>

              {/* Performance */}
              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>
                  {editingEmployee ? 'Rating' : 'Initial Rating'}
                </label>
                <div className="relative">
                  <select
                    aria-label="Initial rating"
                    value={newEmployee.performance}
                    onChange={(e) => setNewEmployee({...newEmployee, performance: parseFloat(e.target.value)})}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none`}
                  >
                    <option value="5.0">5.0 Star (Excellent)</option>
                    <option value="4.8">4.8 Star (Very Good)</option>
                    <option value="4.5">4.5 Star (Good)</option>
                    <option value="4.0">4.0 Star (Satisfactory)</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button"
                  onClick={() => {
                    setShowAddEmployeeModal(false);
                    setEditingEmployee(null);
                    setNewEmployee({
                      name: '',
                      role: 'Server',
                      status: 'OFF_DUTY',
                      performance: 5.0
                    });
                  }}
                  className={`flex-1 py-3 bg-white/5 hover:${t.cardHover} ${t.text} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center`}
                >
                  Cancel
                </button>
                <button type="submit"
                  className={`flex-1 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center shadow-md`}
                >
                  {editingEmployee ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMenuAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[460px] rounded-2xl p-7 shadow-2xl space-y-5 animate-scale-up`}>
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-lg ${t.accent} font-bold tracking-wide`}>
                {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button type="button" 
                onClick={() => {
                  setShowMenuAddEditModal(false);
                  setEditingMenuItem(null);
                }}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              {/* Item Name */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5`}>Item Name</label>
                <input 
                  type="text" 
                  value={menuFormName}
                  onChange={(e) => setMenuFormName(e.target.value)}
                  placeholder="e.g. Imperial Beluga Caviar"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5`}>Category</label>
                <div className="relative">
                  <select
                    aria-label="Menu category"
                    value={menuFormCategory}
                    onChange={(e) => setMenuFormCategory(e.target.value)}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium appearance-none capitalize`}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <span className={`material-symbols-outlined absolute right-3.5 top-3 ${t.textMutedDark} text-sm pointer-events-none`}>keyboard_arrow_down</span>
                </div>
              </div>

              {/* Cost & Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5`}>Unit Cost ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={menuFormCost}
                    onChange={(e) => setMenuFormCost(parseFloat(e.target.value) || 0)}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-mono`}
                    required
                  />
                </div>
                <div>
                  <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5`}>Customer Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={menuFormPrice}
                    onChange={(e) => setMenuFormPrice(parseFloat(e.target.value) || 0)}
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium font-mono`}
                    required
                  />
                </div>
              </div>

              {/* Dynamic Image Uploader dropzone */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5`}>Item Image</label>
                
                <input 
                  type="file"
                  id="menu-item-image-file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setMenuFormImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />

                <div 
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragActive(true);
                  }}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setMenuFormImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onClick={() => document.getElementById('menu-item-image-file')?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer ${
                    isDragActive 
                      ? 'border-[#ffc53d] bg-[#ffc53d]/5' 
                      : `${t.inputBorder} hover:border-[#ffe2ab]/40 bg-[#0e0e0d]`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-lg overflow-hidden border ${t.borderStrong} bg-black flex-shrink-0 flex items-center justify-center`}>
                      {menuFormImage ? (
                        <img src={menuFormImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[#A69984]/30 text-xl">image</span>
                      )}
                    </div>
                    <div className="text-left font-sans">
                      <div className={`text-[11px] font-bold ${t.text}`}>
                        {menuFormImage ? 'Change Image File' : 'Drop or Select Photo'}
                      </div>
                      <div className={`text-[9.5px] ${t.textMuted} mt-0.5 max-w-[200px] truncate`}>
                        Drag & drop file or click to browse.
                      </div>
                    </div>
                  </div>
                  
                  {menuFormImage && (
                    <button type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuFormImage('/images/wagyu_beef_tartare.png');
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border ${t.borderStrong} hover:bg-white/5 ${t.text} text-[9px] uppercase tracking-wider font-bold transition-all`}
                      title="Reset to default image"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-1.5`}>Description</label>
                <textarea 
                  rows={2}
                  value={menuFormDescription}
                  onChange={(e) => setMenuFormDescription(e.target.value)}
                  placeholder="Describe the dish flavors, ingredients..."
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-xs ${t.text} placeholder-[#A69984]/20 focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium resize-none leading-normal`}
                />
              </div>

              {/* Tags Checklist */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2`}>Dietary & Type Badges</label>
                <div className="flex gap-4 flex-wrap text-xs select-none">
                  {['GF', 'Veg', 'Non-Veg', 'Seafood'].map(tag => {
                    const hasTag = menuFormTags.includes(tag);
                    return (
                      <button type="button"
                        key={tag}
                        onClick={() => {
                          if (hasTag) {
                            setMenuFormTags(menuFormTags.filter(t => t !== tag));
                          } else {
                            setMenuFormTags([...menuFormTags, tag]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          hasTag 
                            ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/30 text-[#ffe2ab]' 
                            : 'bg-[#0e0e0d] border-white/10 hover:border-white/20 text-[#A69984]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meal Period Selection */}
              <div>
                <label className={`block ${t.textMuted} text-[9.5px] font-bold uppercase tracking-wider mb-2`}>{tr.mealPeriodLabel}</label>
                <div className="grid grid-cols-3 gap-2 text-xs select-none">
                  {[
                    { id: 'lunch', label: tr.lunchOnly, icon: '🌤️' },
                    { id: 'dinner', label: tr.dinnerOnly, icon: '🌙' },
                    { id: 'both', label: tr.bothMeals, icon: '📅' }
                  ].map(period => {
                    const isSelected = menuFormMealPeriod === period.id;
                    return (
                      <button type="button"
                        key={period.id}
                        onClick={() => setMenuFormMealPeriod(period.id as any)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          isSelected 
                            ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/30 text-[#ffe2ab]' 
                            : 'bg-[#0e0e0d] border-white/10 hover:border-white/20 text-[#A69984]'
                        }`}
                      >
                        <span>{period.icon}</span>
                        <span>{period.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer controls */}
              <div className="flex gap-4 pt-4">
                <button type="button"
                  onClick={() => {
                    setShowMenuAddEditModal(false);
                    setEditingMenuItem(null);
                  }}
                  className={`flex-1 py-3 bg-white/5 hover:${t.cardHover} ${t.text} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center`}
                >
                  Cancel
                </button>
                <button type="submit"
                  className={`flex-1 py-3 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center shadow-md`}
                >
                  {editingMenuItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className={`${t.cardBgOpaque} border w-[480px] rounded-2xl p-7 shadow-2xl space-y-6 animate-scale-up`}>
            
            <div className={`flex justify-between items-center border-b ${t.border} pb-4 select-none`}>
              <h3 className={`font-serif text-lg ${t.accent} font-bold tracking-wide`}>
                Manage Menu Categories
              </h3>
              <button type="button" 
                onClick={() => {
                  setShowCategoryManagerModal(false);
                  setEditingCategory(null);
                  setCategoryFormName('');
                  setCategoryFormIcon('restaurant');
                }}
                className={`w-8 h-8 rounded-lg hover:${t.cardHover} flex items-center justify-center ${t.textMuted} hover:${t.text} transition-colors cursor-pointer`}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 border-b border-white/5 pb-5">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${t.text}`}>
                {editingCategory ? 'Edit Category Details' : 'Create New Category'}
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-1.5`}>Category Name</label>
                  <input 
                    type="text"
                    value={categoryFormName}
                    onChange={(e) => setCategoryFormName(e.target.value)}
                    placeholder="e.g. Soups & Broths"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-3.5 py-2.5 text-xs ${t.text} focus:outline-none focus:border-[#ffe2ab]/40 transition-colors font-medium`}
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  {editingCategory && (
                    <button type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryFormName('');
                        setCategoryFormIcon('restaurant');
                      }}
                      className={`flex-1 py-2.5 bg-white/5 border ${t.borderStrong} hover:bg-white/10 ${t.text} text-[10px] uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer text-center`}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit"
                    className={`flex-1 py-2.5 ${t.accentBg} ${t.accentHoverBg} ${t.accentText} text-[10px] uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer text-center shadow-md`}
                  >
                    {editingCategory ? 'Save' : 'Add Category'}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block ${t.textMuted} text-[9px] font-bold uppercase tracking-wider mb-2`}>Category Icon</label>
                <div className="grid grid-cols-8 gap-2 p-2 bg-[#0e0e0d] rounded-xl border border-white/5">
                  {[
                    'restaurant', 'local_bar', 'icecream', 'auto_awesome', 
                    'ramen_dining', 'bakery_dining', 'soup_kitchen', 'dinner_dining'
                  ].map(iconName => {
                    const isSelected = categoryFormIcon === iconName;
                    return (
                      <button type="button"
                        key={iconName}
                        onClick={() => setCategoryFormIcon(iconName)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#ffe2ab]/10 border-[#ffe2ab]/30 text-[#ffe2ab]' 
                            : 'border-transparent text-[#A69984]/50 hover:text-white hover:bg-white/5'
                        }`}
                        title={iconName.replace('_', ' ')}
                      >
                        <span className="material-symbols-outlined text-base">{iconName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>

            <div className="space-y-3">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${t.textMuted}`}>
                Active Categories ({categories.length})
              </h4>
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div key={cat.id} className={`flex justify-between items-center p-3 bg-[#12110f] border ${t.border} rounded-xl hover:border-white/10 transition-colors`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg ${t.inputBg} border ${t.borderStrong} flex items-center justify-center ${t.accent}`}>
                        <span className="material-symbols-outlined text-sm">{cat.icon || 'restaurant_menu'}</span>
                      </span>
                      <div className="text-left font-sans">
                        <div className={`text-xs font-bold ${t.text}`}>{cat.name}</div>
                        <div className={`text-[8.5px] ${t.textMutedLight} font-mono mt-0.5`}>ID: {cat.id}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryFormName(cat.name);
                          setCategoryFormIcon(cat.icon || 'restaurant');
                        }}
                        className={`w-7 h-7 rounded-md flex items-center justify-center bg-transparent border ${t.borderStrong} hover:border-[#ffe2ab]/20 text-[#A69984] hover:text-[#ffe2ab] transition-colors cursor-pointer`}
                        title="Edit Category"
                      >
                        <span className="material-symbols-outlined text-[13px]">edit</span>
                      </button>
                      <button type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className={`w-7 h-7 rounded-md flex items-center justify-center bg-transparent border ${t.borderStrong} hover:border-red-500/20 text-[#A69984] hover:text-red-400 transition-colors cursor-pointer`}
                        title="Delete Category"
                      >
                        <span className="material-symbols-outlined text-[13px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* INTERACTIVE TOAST FEEDBACK NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-50 animate-slide-in duration-300">
          <div className={`${t.cardBgOpaque} border text-[#ffe2ab] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3`}>
            <span className="material-symbols-outlined text-xl animate-bounce">
              {toast.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <div>
              <div className={`font-sans font-bold text-xs uppercase tracking-wider ${t.text}`}>
                {toast.type === 'success' ? 'Update Success' : 'Notification'}
              </div>
              <div className={`font-sans text-[11px] ${t.textMuted} mt-0.5`}>
                {toast.message}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
