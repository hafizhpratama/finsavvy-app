import React, { useState } from 'react'
import { Option, Textarea } from '@material-tailwind/react'
import Typography from '../Typography'
import Select from '../Select'
import Input from '../Input'
import Button from '../Button'
import { deleteTransaction, updateTransaction } from '../../../services/supabaseService'
import { useAuth } from '../../../contexts/AuthContext'
import { TbTrash } from 'react-icons/tb'

interface UpdateTransactionModalProps {
  closeModal: () => void
  refreshData: () => void
  sendAlertMessage: (message: string) => void
  transaction: Transaction
}

const UpdateTransactionModal: React.FC<UpdateTransactionModalProps> = ({ closeModal, refreshData, sendAlertMessage, transaction }) => {
  const [type, setType] = useState<string | undefined>(transaction?.category_type)
  const [total, setTotal] = useState<string>(transaction.total?.toString() || '')
  const [category, setCategory] = useState<string | undefined>(transaction?.category_id?.toString())
  const [notes, setNotes] = useState<string>(transaction?.notes || '')
  const [date, setDate] = useState<string>(transaction.date || '')
  const { user } = useAuth()

  const handleSave = async () => {
    const formattedTotal = parseInt(total.replace(/,/g, ''), 10)
    const updatedTransaction: Transaction = {
      ...transaction,
      total: formattedTotal,
      category_id: parseInt(category || ''),
      notes,
      date,
      category_type: type,
    }

    const result = await updateTransaction(transaction.id || 0, updatedTransaction, user)

    if (result.success) {
      closeModal()
      refreshData()
      sendAlertMessage('Transaction updated successfully.')
    } else {
      sendAlertMessage(`Failed to update transaction: ${result.error}`)
    }
  }

  const handleDelete = async () => {
    const result = await deleteTransaction(transaction.id || 0, user)

    if (result.success) {
      closeModal()
      refreshData()
      sendAlertMessage('Transaction deleted successfully.')
    } else {
      sendAlertMessage(`Failed to delete transaction: ${result.error}`)
    }
  }

  const formatTotal = (value: string): string => {
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const incomeCategories = [
    { category_id: 1, category_name: 'Salary' },
    { category_id: 2, category_name: 'Interest' },
    { category_id: 3, category_name: 'Investments' },
    { category_id: 4, category_name: 'Gifts' },
    { category_id: 5, category_name: 'Other' },
  ]

  const outcomeCategories = [
    { category_id: 7, category_name: 'Bills' },
    { category_id: 8, category_name: 'Groceries' },
    { category_id: 9, category_name: 'Transportation' },
    { category_id: 10, category_name: 'Dining' },
    { category_id: 11, category_name: 'Entertainment' },
    { category_id: 12, category_name: 'Healthcare' },
    { category_id: 13, category_name: 'Education' },
    { category_id: 14, category_name: 'Insurance' },
    { category_id: 15, category_name: 'Other' },
    { category_id: 6, category_name: 'Rent' },
    { category_id: 16, category_name: 'Cleaning Household' },
    { category_id: 17, category_name: 'Houseware' },
  ]

  const renderOptions = () => {
    if (type === 'income') {
      return incomeCategories.map((cat) => (
        <Option key={cat.category_id} value={cat.category_id.toString()}>
          {cat.category_name}
        </Option>
      ))
    } else if (type === 'outcome') {
      return outcomeCategories.map((cat) => (
        <Option key={cat.category_id} value={cat.category_id.toString()}>
          {cat.category_name}
        </Option>
      ))
    } else {
      return null
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-5/6 rounded-2xl bg-white">
        <div className="rounded-t-2xl border-b border-gray-200 px-6 py-4">
          <Typography className="text-sm font-semibold text-black">Update Transaction</Typography>
        </div>
        <div className="px-4">
          <div className="py-6">
            <div className="flex flex-col gap-6">
              <Input
                type="text"
                variant="outlined"
                label="Total Transaction"
                value={formatTotal(total)}
                onChange={(e) => setTotal(formatTotal(e.target.value))}
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

              <Select
                variant="outlined"
                label="Select Category"
                value={category || ''}
                onChange={(e: any) => {
                  setCategory(e)
                }}
              >
                {renderOptions()}
              </Select>

              {/* @ts-ignore */}
              <Textarea variant="outlined" label="Note" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Input type="date" variant="outlined" label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between border-t py-4">
            <Button className="p-2" variant="text" onClick={handleDelete}>
              <TbTrash size={20} color="red" />
            </Button>
            <div className="flex gap-2">
              <Button variant="outlined" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateTransactionModal
