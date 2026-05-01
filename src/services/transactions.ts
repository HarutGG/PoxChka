import { createClient } from '@/utils/supabase/client';

export type TransactionCategory = 'Food' | 'Transport' | 'Rent' | 'Utilities' | 'Salary' | 'Entertainment' | 'Health' | 'Other';
export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    category: TransactionCategory;
    description: string;
    created_at: string;
}

export interface TransactionInput {
    amount: number;
    category: TransactionCategory;
    description: string;
}

/**
 * Fetch all transactions for the current user
 */
export async function getTransactions(): Promise<Transaction[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }

    return data || [];
}

/**
 * Create a new transaction
 */
export async function createTransaction(input: TransactionInput): Promise<Transaction> {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            amount: input.amount,
            category: input.category,
            description: input.description,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }

    return data;
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
}

/**
 * Calculate total balance from transactions
 */
export function calculateBalance(transactions: Transaction[]): number {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Get transactions by type
 */
export function getTransactionsByType(
    transactions: Transaction[],
    type: TransactionType
): Transaction[] {
    return transactions.filter(tx => 
        type === 'income' ? tx.amount > 0 : tx.amount < 0
    );
}
