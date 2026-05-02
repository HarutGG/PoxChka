'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Utensils,
    Bus,
    Home,
    Zap,
    Briefcase,
    Film,
    Heart,
    CreditCard,
    ArrowUpRight,
    TrendingDown,
    History,
    Filter,
    X,
    PlusCircle,
    MinusCircle,
    LogOut,
    ChevronDown,
    Moon,
    Sun,
    Edit2
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocale } from '@/contexts/LocaleContext';
import { formatAMDForUi } from '@/lib/formatters';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { 
    getTransactions, 
    createTransaction, 
    calculateBalance,
    type Transaction,
    type TransactionType
} from '@/services/transactions';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    Food: <Utensils className="w-5 h-5" />,
    Transport: <Bus className="w-5 h-5" />,
    Rent: <Home className="w-5 h-5" />,
    Utilities: <Zap className="w-5 h-5" />,
    Salary: <Briefcase className="w-5 h-5" />,
    Entertainment: <Film className="w-5 h-5" />,
    Health: <Heart className="w-5 h-5" />,
    Investment: <TrendingDown className="w-5 h-5 rotate-180" />,
    Gift: <PlusCircle className="w-5 h-5" />,
    Other: <CreditCard className="w-5 h-5" />,
};

const INCOME_CATEGORIES = ['Salary', 'Gift', 'Investment', 'Other'] as const;
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Health', 'Other'] as const;
const KNOWN_CATEGORY_KEYS = new Set<string>([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]);

interface DashboardClientProps {
    userFullName: string | undefined;
    userEmail: string | undefined;
    userAvatarUrl: string | undefined;
    initialUsername?: string;
}

export function DashboardClient({ userFullName, userEmail, userAvatarUrl, initialUsername }: DashboardClientProps) {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const { locale, t } = useLocale();
    const dateLocale = locale === 'hy' ? 'hy-AM' : 'en-US';

    const categoryLabel = (c: string) =>
        KNOWN_CATEGORY_KEYS.has(c) ? t(`categories.${c}`) : c;
    
    // Username State
    const [username, setUsername] = useState(initialUsername || '');
    const [showUsernameModal, setShowUsernameModal] = useState(!initialUsername);
    const [newUsername, setNewUsername] = useState(initialUsername || '');
    const [isSavingUsername, setIsSavingUsername] = useState(false);
    
    // State
    const [totalBalance, setTotalBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [historyFilter, setHistoryFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [loading, setLoading] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Form State
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<string>('Food');
    const [customCategory, setCustomCategory] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<TransactionType>('expense');

    const loadTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getTransactions();
            setTransactions(data);
            setTotalBalance(calculateBalance(data));
        } catch (error) {
            console.error('Failed to load transactions:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on mount (setState inside loadTransactions)
        void loadTransactions();
    }, [loadTransactions]);

    const switchToIncome = () => {
        setType('income');
        setCategory('Salary');
        setCustomCategory('');
    };

    const switchToExpense = () => {
        setType('expense');
        setCategory('Food');
        setCustomCategory('');
    };

    const handleSaveUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedUsername = newUsername.trim();
        if (!trimmedUsername) return;
        
        setIsSavingUsername(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({
                data: { username: trimmedUsername }
            });
            if (error) throw error;
            setUsername(trimmedUsername);
            setShowUsernameModal(false);
        } catch (error) {
            console.error('Error updating username:', error);
            alert(t('dashboard.failedUsername'));
        } finally {
            setIsSavingUsername(false);
        }
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Remove any commas or spaces from the input
        const cleanedAmount = amount.replace(/[,\s]/g, '');
        const numericAmount = Math.abs(parseFloat(cleanedAmount));
        
        if (isNaN(numericAmount) || numericAmount === 0 || !description) return;

        const finalAmount = type === 'income' ? numericAmount : -numericAmount;
        const finalCategory = category === 'Other' ? customCategory.trim() : category;
        
        if (category === 'Other' && !finalCategory) {
            alert(t('dashboard.specifyCategory'));
            return;
        }

        try {
            const newTransaction = await createTransaction({
                amount: finalAmount,
                category: finalCategory,
                description,
            });

            setTransactions([newTransaction, ...transactions]);
            setTotalBalance(prev => prev + finalAmount);
            setAmount('');
            setDescription('');
            setCustomCategory('');
        } catch (error) {
            console.error('Failed to create transaction:', error);
            alert(t('dashboard.failedTransaction'));
        }
    };

    const handleLogout = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
            // Still redirect even if there's an error
            router.push('/');
        }
    };

    const filteredHistory = transactions.filter(tx => {
        if (historyFilter === 'all') return true;
        return historyFilter === 'income' ? tx.amount > 0 : tx.amount < 0;
    });

    const recentTransactions = transactions.slice(0, 5);

    const historyFilterLabel = (f: 'all' | 'income' | 'expense') =>
        f === 'all'
            ? t('dashboard.filterAll')
            : f === 'income'
              ? t('dashboard.filterIncome')
              : t('dashboard.filterExpense');

    return (
        <div className="flex flex-col min-h-screen relative font-sans">
            {/* Background glow effects */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-violet/10 blur-[150px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald/10 blur-[150px] pointer-events-none" />

            {/* Navbar */}
            <nav className="border-b border-border bg-surface/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt={t('dashboard.logoAlt')} className="w-8 h-8 rounded-lg object-cover shadow-lg border border-border/30 bg-surface" />
                        <span className="font-bold text-xl tracking-tight text-text-primary">PoxChka</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <LanguageSwitcher />
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors focus:outline-none"
                            title={t('common.toggleTheme')}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <div className="text-right hidden sm:block">
                            <div 
                                className="flex items-center justify-end gap-2 group/user cursor-pointer transition-colors hover:text-violet-light" 
                                onClick={() => {
                                    setNewUsername(username || '');
                                    setShowUsernameModal(true);
                                }}
                            >
                                <p className="text-sm font-bold text-text-primary flex items-center gap-1 group-hover/user:text-violet-light transition-colors">
                                    @{username || t('common.userFallback')}
                                    <Edit2 className="w-3 h-3 opacity-0 group-hover/user:opacity-100 transition-opacity" />
                                </p>
                            </div>
                            <p className="text-xs text-text-secondary">{userFullName || userEmail?.split('@')[0]}</p>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 focus:outline-none group"
                            >
                                <div className="w-10 h-10 rounded-full border border-border overflow-hidden bg-surface flex items-center justify-center shadow-inner transition-all group-hover:border-violet">
                                    {userAvatarUrl ? (
                                        <img
                                            src={userAvatarUrl}
                                            alt={t('dashboard.userAvatarAlt')}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-violet-light font-bold">
                                            {userEmail?.[0]?.toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User Dropdown Menu */}
                            <AnimatePresence>
                                {showUserMenu && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-40" 
                                            onClick={() => setShowUserMenu(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50"
                                        >
                                            <div className="p-4 border-b border-border sm:hidden">
                                                <p className="text-sm font-medium text-text-primary capitalize">
                                                    {userFullName || userEmail?.split('@')[0]}
                                                </p>
                                                <p className="text-xs text-text-secondary mt-1">{userEmail}</p>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-text-primary hover:bg-danger/10 hover:text-danger transition-colors"
                                            >
                                                <LogOut className="w-5 h-5" />
                                                <span className="font-medium">{t('dashboard.logOut')}</span>
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 relative">

                {/* Left Column: Stats & Add Transaction */}
                <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6 lg:gap-8">

                    {/* Glassmorphism Total Balance Card */}
                    <div className="relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-surface border border-border group">
                        <div className="absolute inset-0 bg-gradient-to-br from-black/[0.06] dark:from-white/5 to-transparent pointer-events-none" />
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-light/20 to-emerald-light/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl pointer-events-none blur-sm" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <p className="text-text-secondary text-xs sm:text-sm font-semibold uppercase tracking-wider">{t('dashboard.totalBalance')}</p>
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-violet/20 flex items-center justify-center text-violet-light">
                                    <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary mb-3 sm:mb-4 tracking-tight break-all">
                                {formatAMDForUi(locale, totalBalance)}
                            </h2>

                            <div className="flex items-center justify-between gap-4 mt-4 sm:mt-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-text-secondary flex items-center gap-1">
                                        <ArrowUpRight className="w-3 h-3 text-emerald" /> {t('dashboard.income')}
                                    </span>
                                    <span className="text-xs sm:text-sm font-semibold text-text-primary break-all">
                                        {formatAMDForUi(locale, transactions.filter(t => t.amount > 0).reduce((acc, curr) => acc + curr.amount, 0))}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    <span className="text-xs text-text-secondary flex items-center gap-1">
                                        <TrendingDown className="w-3 h-3 text-danger" /> {t('dashboard.expenses')}
                                    </span>
                                    <span className="text-xs sm:text-sm font-semibold text-text-primary break-all">
                                        {formatAMDForUi(locale, Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, curr) => acc + curr.amount, 0)))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Transaction Form */}
                    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-surface/60 backdrop-blur-sm border border-border">
                        <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-4 sm:mb-6 flex items-center gap-2">
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-violet-light" />
                            {t('dashboard.addTransaction')}
                        </h3>

                        <form onSubmit={handleAddTransaction} className="flex flex-col gap-3 sm:gap-4">
                            {/* Type Toggle */}
                            <div className="flex p-1 bg-background rounded-xl border border-border">
                                <button
                                    type="button"
                                    onClick={switchToIncome}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${type === 'income'
                                            ? 'bg-emerald/10 text-emerald-light shadow-sm'
                                            : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    {t('dashboard.incomeType')}
                                </button>
                                <button
                                    type="button"
                                    onClick={switchToExpense}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${type === 'expense'
                                            ? 'bg-danger/10 text-danger shadow-sm'
                                            : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    <MinusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    {t('dashboard.expenseType')}
                                </button>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider text-left">{t('dashboard.amountLabel')}</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9,.\s]*"
                                    value={amount}
                                    onChange={(e) => {
                                        // Allow only numbers, commas, dots, and spaces
                                        const value = e.target.value.replace(/[^0-9,.\s]/g, '');
                                        setAmount(value);
                                    }}
                                    placeholder={t('dashboard.amountPlaceholder')}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-violet/50 focus:border-violet transition-all"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider text-left">{t('dashboard.category')}</label>
                                <div className="relative">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full appearance-none bg-background border border-border rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-violet/50 focus:border-violet transition-all"
                                    >
                                        {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                                            <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            {category === 'Other' && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="flex flex-col gap-1.5"
                                >
                                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider text-left">{t('dashboard.customCategory')}</label>
                                    <input
                                        type="text"
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        placeholder={t('dashboard.customCategoryPlaceholder')}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-violet/50 focus:border-violet transition-all"
                                        required
                                    />
                                </motion.div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider text-left">{t('dashboard.description')}</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t('dashboard.descriptionPlaceholder')}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-violet/50 focus:border-violet transition-all"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className={`mt-2 w-full py-3 sm:py-3.5 rounded-xl text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg 
                  ${type === 'income' ? 'bg-gradient-to-r from-emerald to-emerald-dark shadow-emerald-glow' : 'bg-gradient-to-r from-violet to-violet-dark shadow-violet-glow'}`}
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                {type === 'income' ? t('dashboard.addIncome') : t('dashboard.addExpense')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Recent Transactions List */}
                <div className="lg:col-span-7">
                    <div className="h-[500px] sm:h-[600px] lg:h-[730px] rounded-xl sm:rounded-2xl bg-surface border border-border flex flex-col overflow-hidden shadow-sm">
                        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-surface/80 backdrop-blur-md">
                            <h3 className="text-lg sm:text-xl font-bold text-text-primary">{t('dashboard.recentTransactions')}</h3>
                            <button
                                onClick={() => setShowHistory(true)}
                                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-lg bg-background text-violet-light border border-violet/20 hover:bg-violet/10 transition-all"
                            >
                                <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">{t('dashboard.history')}</span>
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 flex-1 overflow-y-auto w-full custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {loading ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center h-full"
                                    >
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-violet/20 border-t-violet rounded-full animate-spin mb-4" />
                                        <p className="text-text-secondary text-xs sm:text-sm">{t('dashboard.loading')}</p>
                                    </motion.div>
                                ) : recentTransactions.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center h-full opacity-50"
                                    >
                                        <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-text-secondary mb-4" />
                                        <p className="text-text-secondary text-base sm:text-lg">{t('dashboard.noActivity')}</p>
                                        <p className="text-text-secondary text-xs sm:text-sm">{t('dashboard.noActivityHint')}</p>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        {recentTransactions.map((tx) => (
                                            <motion.div
                                                key={tx.id}
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                                className="group flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-background border border-border/50 hover:border-violet/40 hover:bg-surface transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full flex items-center justify-center shadow-inner
                            ${tx.amount > 0 ? 'bg-emerald/10 text-emerald-light' : 'bg-violet/10 text-violet-light'}
                            group-hover:scale-110 transition-transform duration-300
                          `}>
                                                        {CATEGORY_ICONS[tx.category] || <CreditCard className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="font-semibold text-text-primary text-sm sm:text-base truncate">{tx.description}</span>
                                                        <span className="text-xs text-text-secondary capitalize">{categoryLabel(tx.category)} • {new Date(tx.created_at).toLocaleDateString(dateLocale)}</span>
                                                    </div>
                                                </div>
                                                <span className={`font-bold text-sm sm:text-lg flex-shrink-0 ml-2 ${tx.amount > 0 ? 'text-emerald-light' : 'text-text-primary'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{formatAMDForUi(locale, tx.amount)}
                                                </span>
                                            </motion.div>
                                        ))}
                                        {transactions.length > 5 && (
                                            <p className="text-center text-xs text-text-secondary mt-2 sm:mt-4">
                                                {t('dashboard.showingLatest', { count: transactions.length })}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

            </main>

            {/* History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col bg-surface border border-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-violet/10 flex items-center justify-center text-violet-light">
                                        <History className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">{t('dashboard.transactionHistory')}</h2>
                                </div>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="p-2 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/5 text-text-secondary transition-colors"
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="p-3 sm:p-4 bg-background/50 flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-background p-1 rounded-xl border border-border">
                                    {(['all', 'income', 'expense'] as const).map(filter => (
                                        <button
                                            key={filter}
                                            onClick={() => setHistoryFilter(filter)}
                                            className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${historyFilter === filter
                                                    ? 'bg-violet/10 text-violet-light'
                                                    : 'text-text-secondary hover:text-text-primary'
                                                }`}
                                        >
                                            {historyFilterLabel(filter)}
                                        </button>
                                    ))}
                                </div>
                                <div className="hidden sm:flex items-center gap-2 text-xs text-text-secondary ml-auto">
                                    <Filter className="w-3 h-3" />
                                    {t('dashboard.filteringBy')} {historyFilterLabel(historyFilter)}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                                {filteredHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 opacity-50">
                                        <History className="w-10 h-10 sm:w-12 sm:h-12 text-text-secondary mb-4" />
                                        <p className="text-text-secondary text-sm sm:text-base">{t('dashboard.noMatchFilter')}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        {filteredHistory.map((tx) => (
                                            <div
                                                key={tx.id}
                                                className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-background border border-border"
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-full flex items-center justify-center
                            ${tx.amount > 0 ? 'bg-emerald/10 text-emerald-light' : 'bg-violet/10 text-violet-light'}
                          `}>
                                                        {CATEGORY_ICONS[tx.category] || <CreditCard className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="font-semibold text-text-primary text-xs sm:text-sm truncate">{tx.description}</span>
                                                        <span className="text-xs text-text-secondary capitalize">{categoryLabel(tx.category)} • {new Date(tx.created_at).toLocaleDateString(dateLocale)}</span>
                                                    </div>
                                                </div>
                                                <span className={`font-bold text-xs sm:text-sm flex-shrink-0 ml-2 ${tx.amount > 0 ? 'text-emerald-light' : 'text-text-primary'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{formatAMDForUi(locale, tx.amount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Username Modal */}
            <AnimatePresence>
                {showUsernameModal && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-8"
                        >
                            <h2 className="text-2xl font-bold text-text-primary mb-2">
                                {username ? t('dashboard.updateUsername') : t('dashboard.welcomeTitle')}
                            </h2>
                            <p className="text-sm text-text-secondary mb-6">
                                {username ? t('dashboard.usernamePromptUpdate') : t('dashboard.usernamePromptNew')}
                            </p>

                            <form onSubmit={handleSaveUsername} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">{t('dashboard.username')}</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">@</span>
                                        <input
                                            type="text"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                                            placeholder={t('dashboard.usernamePlaceholder')}
                                            className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-violet/50 focus:border-violet transition-all"
                                            required
                                            minLength={3}
                                            maxLength={20}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4">
                                    {username && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowUsernameModal(false);
                                                setNewUsername(username);
                                            }}
                                            className="flex-1 py-3 rounded-xl border border-border text-text-secondary font-semibold hover:text-text-primary hover:border-text-secondary transition-all"
                                        >
                                            {t('dashboard.cancel')}
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSavingUsername || !newUsername.trim() || newUsername === username}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet to-emerald text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-lg"
                                    >
                                        {isSavingUsername ? t('dashboard.saving') : t('dashboard.save')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="py-4 sm:py-6 text-center text-xs sm:text-sm text-text-secondary/60">
                {t('dashboard.footerTagline')}
            </footer>
        </div>
    );
}
