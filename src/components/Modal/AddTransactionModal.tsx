import { useState, useEffect } from 'react'
import { Button, Input, Option, Select, Textarea, Typography } from '@material-tailwind/react'
import { useAuth } from '../../contexts/AuthContext'
import { addTransaction, getCategoriesByType } from '../../services/supabaseService'

interface AddTransactionModalProps {
  closeModal: () => void
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ closeModal }) => {
  const [type, setType] = useState('')
  const [total, setTotal] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategoriesByType(user?.id, type)
      console.log(data)
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
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-2/3 max-w-lg rounded-2xl bg-white">
        <div className="rounded-t-2xl border-b border-gray-200 px-6 py-4">
          <Typography
            variant="h6"
            color="black"
            className="font-semibold"
            placeholder=""
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            Add Transaction
          </Typography>
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
                crossOrigin={[]}
                placeholder=""
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
              />

              <Select
                variant="outlined"
                label="Type"
                value={type}
                onChange={(e: any) => {
                  setType(e)
                  setCategory('')
                }}
                placeholder=""
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
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
                  placeholder=""
                  onPointerEnterCapture={() => {}}
                  onPointerLeaveCapture={() => {}}
                >
                  {categories.map((cat) => (
                    <Option key={cat.category_id} value={cat.category_id.toString()}>
                      {cat.category_name}
                    </Option>
                  ))}
                </Select>
              )}
              <Textarea
                variant="outlined"
                label="Note"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder=""
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
              />
              <Input
                type="date"
                variant="outlined"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                crossOrigin={[]}
                placeholder=""
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t py-4">
            <Button
              variant="outlined"
              onClick={closeModal}
              placeholder=""
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddTransactionModal
