import { supabase } from '../utils/supabase'
import { User } from '@supabase/supabase-js'

export async function addTransaction(data: Transaction, user: User | null | undefined) {
  try {
    const { error } = await supabase.from('transaction').insert([{ ...data, user_id: user?.id }])

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getTransactionsByUserId(
  userId?: string,
  month: number = new Date().getMonth() + 1,
  year: number = new Date().getFullYear(),
): Promise<Transaction[] | null> {
  try {
    const { data, error } = await supabase
      .from('transaction')
      .select('*')
      .eq('user_id', userId)
      .gte('date', `${year}-${month.toString().padStart(2, '0')}-01T00:00:00.000Z`)
      .lt('date', `${year}-${(month + 1).toString().padStart(2, '0')}-01T00:00:00.000Z`)

    if (error) {
      throw error
    }

    return data
  } catch (error: any) {
    return null
  }
}

export async function getCategories(userId?: string, type?: string): Promise<Category[] | null> {
  try {
    let query = supabase.from('categories').select('*')

    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`)
    } else {
      query = query.not('user_id', 'is', null)
    }

    if (type) {
      query = query.eq('transaction_type', type)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? null
  } catch (error: any) {
    console.error('Error fetching categories:', error.message)
    return null
  }
}
