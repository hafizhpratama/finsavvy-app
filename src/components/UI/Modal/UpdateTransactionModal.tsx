import React, { useEffect, useState } from 'react'
import { Option, Textarea } from '@material-tailwind/react'
import Typography from '../Typography'
import Select from '../Select'
import Input from '../Input'
import Button from '../Button'
import { deleteTransaction, getCategories, updateTransaction } from '../../../services/supabaseService'
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
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true)
        const fetchedCategories = await getCategories(user?.id, type)
        if (fetchedCategories) {
          setCategories(fetchedCategories)
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [type, user?.id])

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

  const renderOptions = () => {
    if (categories) {
      return categories.map((cat) => (
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
              {isLoading ? (
                <div className="max-w-full animate-pulse">
                  <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                    &nbsp;
                  </Typography>
                </div>
              ) : (
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
              )}
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
