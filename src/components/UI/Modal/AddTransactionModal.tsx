import { useState, useEffect } from 'react'
import { Option, Textarea } from '@material-tailwind/react'
import { useAuth } from '../../../contexts/AuthContext'
import { addTransaction, getCategories } from '../../../services/supabaseService'
import Typography from '../Typography'
import Select from '../Select'
import Input from '../Input'
import Button from '../Button'

interface AddTransactionModalProps {
  closeModal: () => void
  refreshData: () => void
  sendAlertMessage: (message: string) => void
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ closeModal, refreshData, sendAlertMessage }) => {
  const [type, setType] = useState('')
  const [total, setTotal] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories(user?.id, type)
      if (data) {
        setCategories(data)
      }
    }
    fetchCategories()
  }, [user, type])

  const handleSave = async () => {
    const data: Transaction = {
      total: parseInt(total),
      category_id: parseInt(category),
      notes,
      date,
      category_type: type,
    }

    const result = await addTransaction(data, user)

    if (result.success) {
      closeModal()
      refreshData()
      sendAlertMessage('Transaction added successfully.')
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-5/6 rounded-2xl bg-white">
        <div className="rounded-t-2xl border-b border-gray-200 px-6 py-4">
          <Typography className="text-sm font-semibold text-black">Add Transaction</Typography>
        </div>
        <div className="px-6">
          <div className="py-6">
            <div className="flex flex-col gap-6">
              <Input
                type="number"
                variant="outlined"
                label="Total Transaction"
                value={total}
                onChange={(e) => {
                  setTotal(e.target.value)
                }}
              />

              <Select
                variant="outlined"
                label="Type"
                value={type}
                onChange={(e: any) => {
                  setType(e)
                  setCategory('')
                }}
              >
                <Option value="">Select Type</Option>
                <Option value="income">Income</Option>
                <Option value="outcome">Outcome</Option>
              </Select>

              {type && (
                <Select
                  variant="outlined"
                  label="Select Category"
                  onChange={(e: any) => {
                    setCategory(e)
                  }}
                >
                  {categories.map((cat) => (
                    <Option key={cat.category_id} value={cat.category_id.toString()}>
                      {cat.category_name}
                    </Option>
                  ))}
                </Select>
              )}
              {/* @ts-ignore */}
              <Textarea variant="outlined" label="Note" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Input type="date" variant="outlined" label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t py-4">
            <Button variant="outlined" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddTransactionModal
