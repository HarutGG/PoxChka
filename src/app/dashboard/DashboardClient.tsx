'use client';

import { useState, useEffect } from 'react';
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
    MinusCircle
} from 'lucide-react';
import { formatAMDLocalized } from '@/lib/formatters';
import { 
    getTransactions, 
    createTransaction, 
    calculateBalance,
    type Transaction,
    type TransactionCategory,
    type TransactionType
} from '@/services/transactions';

const CATEGORY_ICONS: Record<TransactionCategory, React.ReactNode> = {
    Food: <Utensils className="w-5 h-5" />,
    Transport: <Bus className="w-5 h-5" />,
    Rent: <Home className="w-5 h-5" />,
    Utilities: <Zap className="w-5 h-5" />,
    Salary: <Briefcase className="w-5 h-5" />,
    Entertainment: <Film className="w-5 h-5" />,
    Health: <Heart className="w-5 h-5" />,
    Other: <CreditCard className="w-5 h-5" />,
};

interface DashboardClientProps {
    userFullName: string | undefined;
    userEmail: string | undefined;
    userAvatarUrl: string | undefined;
}

export function DashboardClient({ userFullName, userEmail, userAvatarUrl }: DashboardClientProps) {
    // State
    const [totalBalance, setTotalBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [historyFilter, setHistoryFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [loading, setLoading] = useState(true);

    // Form State
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<TransactionCategory>('Food');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<TransactionType>('expense');

    // Load transactions on mount
    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
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
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = Math.abs(parseFloat(amount));
        if (isNaN(numericAmount) || numericAmount === 0 || !description) return;

        const finalAmount = type === 'income' ? numericAmount : -numericAmount;

        try {
            const newTransaction = await createTransaction({
                amount: finalAmount,
                category,
                description,
            });

            setTransactions([newTransaction, ...transactions]);
            setTotalBalance(prev => prev + finalAmount);
            setAmount('');
            setDescription('');
        } catch (error) {
            console.error('Failed to create transaction:', error);
            alert('Failed to add transaction. Please try again.');
        }
    };

    const filteredHistory = transactions.filter(tx => {
        if (historyFilter === 'all') return true;
        return historyFilter === 'income' ? tx.amount > 0 : tx.amount < 0;
    });

    const recentTransactions = transactions.slice(0, 5);

    return (
        <div className="flex flex-col min-h-screen relative font-sans">
            {/* Background glow effects */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-violet/10 blur-[150px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald/10 blur-[150px] pointer-events-none" />

            {/* Navbar */}
            <nav className="border-b border-border bg-surface/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-emerald flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-violet-glow">
                            P
                        </div>
                        <span className="font-bold text-xl tracking-tight text-text-primary">PoxChka</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-text-primary capitalize">
                                {userFullName || userEmail?.split('@')[0]}
                            </p>
                            <p className="text-xs text-text-secondary">{userEmail}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-border overflow-hidden bg-surface flex items-center justify-center shadow-inner">
                            {userAvatarUrl ? (
                                <img
                                    src={userAvatarUrl}
                                    alt="User avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-violet-light font-bold">
                                    {userEmail?.[0]?.toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

                {/* Left Column: Stats & Add Transaction */}
                <div className="lg:col-span-5 flex flex-col gap-8">

                    {/* Glassmorphism Total Balance Card */}
                    <div className="relative p-8 rounded-3xl overflow-hidden shadow-2xl bg-surface/40 backdrop-blur-md border border-white/10 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-light/20 to-emerald-light/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none blur-sm" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-text-secondary text-sm font-semibold uppercase tracking-wider">Total Balance</p>
                                <div className="w-8 h-8 rounded-full bg-violet/20 flex items-center justify-center text-violet-light">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary mb-4 tracking-tight">
                                {formatAMDLocalized(totalBalance)}
                            </h2>

                            <div className="flex items-center justify-between gap-4 mt-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-text-secondary flex items-center gap-1">
                                        <ArrowUpRight className="w-3 h-3 text-emerald" /> Income
                                    </span>
                                    <span className="text-sm font-semibold text-text-primary">
                                        {formatAMDLocalized(transactions.filter(t => t.amount > 0).reduce((acc, curr) => acc + curr.amount, 0))}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    <span className="text-xs text-text-secondary flex items-center gap-1">
                                        <TrendingDown className="w-3 h-3 text-danger" /> Expenses
                                    </span>
                                    <span className="text-sm font-semibold text-text-primary">
                                        {formatAMDLocalized(Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, curr) => acc + curr.amount, 0)))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Transaction Form */}
                    <div className="p-6 rounded-2xl bg-surface/60 backdrop-blur-sm border border-border">
                        <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-violet-light" />
                            Add Transaction
                        </h3>

                        <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
                            {/* Type Toggle */}
                            <div className="flex p-1 bg-background rounded-xl border border-border">
                                <button
                                    type="button"
                                    onClick={() => setType('income')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'income'
                                            ? 'bg-emerald/10 text-emerald-light shadow-sm'
                                            : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Income
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('expense')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'expense'
                                            ? 'bg-danger/10 text-danger shadow-sm'
                                            : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    <MinusCircle className="w-4 h-4" />
                                    Expense
                                </button>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider text-left">Amount (֏)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="e.g. 5000"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-violet/50 focus:border-violet transition-all"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider text-left">Category</label>
                                <div className="relative">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                                        className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-violet/50 focus:border-violet transition-all"
                                    >
                                        {['Food', 'Transport', 'Rent', 'Utilities', 'Salary', 'Entertainment', 'Health', 'Other'].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider text-left">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What was this for?"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-violet/50 focus:border-violet transition-all"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className={`mt-2 w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg 
                  ${type === 'income' ? 'bg-gradient-to-r from-emerald to-emerald-dark shadow-emerald-glow' : 'bg-gradient-to-r from-violet to-violet-dark shadow-violet-glow'}`}
                            >
                                <Plus className="w-5 h-5" />
                                Add {type === 'income' ? 'Income' : 'Expense'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Recent Transactions List */}
                <div className="lg:col-span-7">
                    <div className="h-[730px] rounded-2xl bg-surface/40 backdrop-blur-sm border border-border flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-surface/50">
                            <h3 className="text-xl font-bold text-text-primary">Recent Transactions</h3>
                            <button
                                onClick={() => setShowHistory(true)}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-background text-violet-light border border-violet/20 hover:bg-violet/10 transition-all"
                            >
                                <History className="w-4 h-4" />
                                History
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto w-full custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {loading ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center h-full"
                                    >
                                        <div className="w-12 h-12 border-4 border-violet/20 border-t-violet rounded-full animate-spin mb-4" />
                                        <p className="text-text-secondary text-sm">Loading transactions...</p>
                                    </motion.div>
                                ) : recentTransactions.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center h-full opacity-50"
                                    >
                                        <Briefcase className="w-12 h-12 text-text-secondary mb-4" />
                                        <p className="text-text-secondary text-lg">No activity yet.</p>
                                        <p className="text-text-secondary text-sm">Start by adding your first transaction!</p>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {recentTransactions.map((tx) => (
                                            <motion.div
                                                key={tx.id}
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                                className="group flex items-center justify-between p-4 rounded-xl bg-background border border-white/5 hover:border-violet/30 hover:bg-surface/60 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner
                            ${tx.amount > 0 ? 'bg-emerald/10 text-emerald-light' : 'bg-violet/10 text-violet-light'}
                            group-hover:scale-110 transition-transform duration-300
                          `}>
                                                        {CATEGORY_ICONS[tx.category]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-text-primary text-base">{tx.description}</span>
                                                        <span className="text-xs text-text-secondary capitalize">{tx.category} • {new Date(tx.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <span className={`font-bold text-lg ${tx.amount > 0 ? 'text-emerald-light' : 'text-text-primary'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{formatAMDLocalized(tx.amount)}
                                                </span>
                                            </motion.div>
                                        ))}
                                        {transactions.length > 5 && (
                                            <p className="text-center text-xs text-text-secondary mt-4">
                                                Showing latest 5 of {transactions.length} transactions
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
                            className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center text-violet-light">
                                        <History className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-text-primary">Transaction History</h2>
                                </div>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="p-2 rounded-lg hover:bg-white/5 text-text-secondary transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="p-4 bg-background/50 flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-background p-1 rounded-xl border border-border">
                                    {(['all', 'income', 'expense'] as const).map(filter => (
                                        <button
                                            key={filter}
                                            onClick={() => setHistoryFilter(filter)}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${historyFilter === filter
                                                    ? 'bg-violet/10 text-violet-light'
                                                    : 'text-text-secondary hover:text-text-primary'
                                                }`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                                <div className="hidden sm:flex items-center gap-2 text-xs text-text-secondary ml-auto">
                                    <Filter className="w-3 h-3" />
                                    Filtering by {historyFilter}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                {filteredHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 opacity-50">
                                        <History className="w-12 h-12 text-text-secondary mb-4" />
                                        <p className="text-text-secondary">No transactions match your filter.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {filteredHistory.map((tx) => (
                                            <div
                                                key={tx.id}
                                                className="flex items-center justify-between p-4 rounded-xl bg-background border border-white/5"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                            ${tx.amount > 0 ? 'bg-emerald/10 text-emerald-light' : 'bg-violet/10 text-violet-light'}
                          `}>
                                                        {CATEGORY_ICONS[tx.category]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-text-primary text-sm">{tx.description}</span>
                                                        <span className="text-xs text-text-secondary capitalize">{tx.category} • {new Date(tx.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-emerald-light' : 'text-text-primary'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{formatAMDLocalized(tx.amount)}
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

            {/* Footer */}
            <footer className="py-6 text-center text-sm text-text-secondary/60">
                PoxChka — Precision in Every Transaction
            </footer>
        </div>
    );
}
