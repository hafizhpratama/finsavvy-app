interface Transaction {
  id?: number
  total?: number
  category_id?: number
  notes?: string
  date?: string
  user_id?: string
  created_at?: string
  category_type?: string
}

interface CategorySummary {
  category_id: string;
  title: string;
  total: number;
  percentage: number;
  color: string;
}

interface PieChartEntry {
  title: string;
  total: number;
  percentage: number;
  color: string;
}

interface BarChartEntry {
  label: string;
  total: number;
}

interface Category {
  id: number;
  user_id: number | null;
  name: string;
  type: string;
}
