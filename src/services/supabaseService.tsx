import { DateValueType } from 'react-tailwindcss-datepicker'
import { supabase } from '../utils/supabase'
import { User } from '@supabase/supabase-js'
import { getCategoryColor } from '../utils/categoryUtils'

// Function to handle errors uniformly
async function handleQuery<T>(query: any): Promise<T | null> {
  try {
    const { data, error } = await query
    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Error executing query:', error)
    return null
  }
}

// Add transactions
export async function addTransaction(data: Transaction, user: User | null | undefined) {
  if (!data || !user) throw new Error('Data or user is missing')
  const { error } = await supabase.from('transaction').insert([{ ...data, user_id: user.id }])
  if (error) throw error
  return { success: true }
}

// Retrieve transactions by user ID
export async function getTransactionsByUserId(userId: string, filterDate?: DateValueType): Promise<Transaction[] | null> {
  const query = supabase.from('transaction').select('*').eq('user_id', userId).is('deleted_at', null)
  if (filterDate) query.gte('date', filterDate.startDate).lte('date', filterDate.endDate)
  query.order('date', { ascending: false })
  query.order('total', { ascending: false })
  return await handleQuery<Transaction[]>(query)
}

// Update transaction
export async function updateTransaction(transactionId: number, newData: Partial<Transaction>, user: User | null | undefined) {
  if (!transactionId || !newData || !user) throw new Error('Transaction ID, data, or user is missing')
  const { error } = await supabase.from('transaction').update(newData).eq('id', transactionId).eq('user_id', user.id)
  if (error) throw error
  return { success: true }
}

// Delete transaction
export async function deleteTransaction(transactionId: number, user: User | null | undefined) {
  if (!transactionId || !user) throw new Error('Transaction ID or user is missing')
  const { error } = await supabase.from('transaction').update({ deleted_at: new Date() }).eq('id', transactionId).eq('user_id', user.id)
  if (error) throw error
  return { success: true }
}

// Retrieve top spending categories
export async function getTopSpendingCategories(userId: string, filterDate?: DateValueType): Promise<CategorySummary[] | null> {
  const query = supabase
    .from('transaction')
    .select('category_id, total')
    .eq('user_id', userId)
    .eq('category_type', 'outcome')
    .is('deleted_at', null)
  if (filterDate && filterDate.startDate && filterDate.endDate) {
    query.gte('date', filterDate.startDate).lte('date', filterDate.endDate)
  }
  const transactions = await handleQuery<Transaction[]>(query)
  if (!transactions) return null

  const categorySpendingMap = new Map<string, number>()
  let totalSpending = 0

  transactions.forEach((transaction) => {
    const { category_id, total } = transaction
    if (category_id && total) {
      totalSpending += total
      categorySpendingMap.set(category_id.toString(), (categorySpendingMap.get(category_id.toString()) || 0) + total)
    }
  })

  const categoriesData = await handleQuery<Category[]>(supabase.from('categories').select('id, name'))
  if (!categoriesData) return null

  const categoryNamesMap = new Map<string, string>()
  categoriesData.forEach((category) => {
    categoryNamesMap.set(category.id.toString(), category.name)
  })

  const categorySpendingArray: CategorySummary[] = []

  for (const [categoryId, total] of categorySpendingMap.entries()) {
    let categoryName = categoryNamesMap.get(categoryId)
    if (categoryName === 'Other') {
      categoryName = 'Outcome Other'
    }
    if (categoryName) {
      const percentage = ((total / totalSpending) * 100).toFixed(1)
      categorySpendingArray.push({
        category_id: categoryId,
        title: categoryName,
        total,
        percentage: parseFloat(percentage),
        color: getCategoryColor(categoryName),
      })
    }
  }

  categorySpendingArray.sort((a, b) => b.total - a.total)

  return categorySpendingArray
}

// Retrieve transactions by category and date
export async function getTransactionsByCategoryAndDate(
  userId?: string,
  categoryId?: string,
  filterDate?: DateValueType,
): Promise<Transaction[] | null> {
  const query = supabase.from('transaction').select('*').eq('user_id', userId).eq('category_id', categoryId).is('deleted_at', null)
  if (filterDate && filterDate.startDate && filterDate.endDate) {
    query.gte('date', filterDate.startDate).lte('date', filterDate.endDate)
  }
  query.order('date', { ascending: false })
  return await handleQuery<Transaction[]>(query)
}

// Retrieve pie chart data by user ID
export async function getPieChartDataByUserId(userId: string, filterDate?: DateValueType, type?: string): Promise<PieChartEntry[] | null> {
  try {
    let query = supabase.from('transaction').select('*').eq('user_id', userId).is('deleted_at', null)

    if (type) {
      query.eq('category_type', type)
    }

    if (filterDate && filterDate.startDate && filterDate.endDate) {
      query.gte('date', filterDate.startDate).lte('date', filterDate.endDate)
    }

    const { data: transactions, error } = await query

    if (error) {
      throw error
    }

    if (!transactions || transactions.length === 0) {
      return null
    }

    // Fetch category names from the 'categories' table
    const categoryNamesMap = new Map<string, string>()
    const categoriesData = await supabase.from('categories').select('id, name')
    if (categoriesData.error) {
      throw categoriesData.error
    }
    categoriesData.data?.forEach((category) => {
      categoryNamesMap.set(category.id.toString(), category.name)
    })

    // Calculate total amount and category totals
    const totalAmount = transactions.reduce((acc, curr) => acc + curr.total, 0)
    const categoryTotals: { [key: string]: number } = {}
    transactions.forEach((transaction) => {
      const categoryId = transaction.category_id
      categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + transaction.total
    })

    // Prepare pie chart entries with category names
    const pieChartEntries: PieChartEntry[] = Object.entries(categoryTotals).map(([categoryId, total]) => ({
      title: categoryNamesMap.get(categoryId) || 'Unknown',
      total,
      percentage: (total / totalAmount) * 100,
      color: getCategoryColor(categoryNamesMap.get(categoryId) || 'Unknown'),
    }))

    return pieChartEntries
  } catch (error: any) {
    console.error('Error fetching pie chart data:', error)
    return null
  }
}

// Retrieve bar chart data by user ID
export async function getBarChartDataByUserId(userId: string, selectedYear?: number): Promise<BarChartEntry[] | []> {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  let startMonth = 0
  let endMonth = currentMonth + 1

  if (selectedYear && selectedYear < currentYear) {
    endMonth = 12
  } else if (!selectedYear || selectedYear === currentYear) {
    startMonth = 0
  }

  const startOfYear = `${selectedYear}-01-01T00:00:00Z`
  const endOfYear = `${selectedYear}-12-31T23:59:59Z`

  const query = supabase.from('transaction').select('*').eq('user_id', userId).is('deleted_at', null)

  if (selectedYear) {
    query.gte('date', startOfYear).lte('date', endOfYear)
  }

  const { data: transactions, error } = await query

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  const monthlySpending: { [key: string]: number } = {}

  for (let i = startMonth; i < endMonth; i++) {
    const monthStart = new Date(currentYear, i, 1).toLocaleDateString('default', { month: 'long' })
    monthlySpending[monthStart] = 0
  }

  if (transactions && transactions.length > 0) {
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)
      const month = transactionDate.toLocaleDateString('default', { month: 'long' })
      if (transaction.category_type === 'outcome' && monthlySpending[month] !== undefined) {
        monthlySpending[month] += transaction.total || 0
      }
    })
  }

  const monthlySpendingData = Object.entries(monthlySpending).map(([label, total]) => ({ label, total }))

  return monthlySpendingData
}

// Retrieve categories by user ID and/or transaction type
export async function getCategories(userId?: string, transactionType?: string): Promise<Category[] | null> {
  try {
    let query = supabase.from('categories').select('*')

    // Construct the query based on the provided parameters
    if (userId) {
      query.or(`user_id.eq.${userId},user_id.is.null`)
    } else {
      query.not('user_id', 'is', null)
    }

    if (transactionType) {
      query.eq('type', transactionType)
    }

    // Execute the query
    const { data, error } = await query

    if (error) {
      throw error
    }

    return data ?? null
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return null
  }
}
