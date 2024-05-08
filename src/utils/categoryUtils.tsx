import {
  MdAttachMoney,
  MdHome,
  MdShoppingCart,
  MdDirectionsCar,
  MdRestaurant,
  MdTheaters,
  MdLocalHospital,
  MdSchool,
  MdSecurity,
  MdCleaningServices,
  MdHouse,
} from 'react-icons/md'

export const categoryConfig = {
  Salary: { icon: MdAttachMoney, color: '#15F5BA' },
  Interest: { icon: MdAttachMoney, color: '#98A8F8' },
  Investments: { icon: MdAttachMoney, color: '#6F38C5' },
  Gifts: { icon: MdAttachMoney, color: '#068FFF' },
  Other: { icon: MdAttachMoney, color: '#3A98B9' },
  Bills: { icon: MdHome, color: '#CF0A0A' },
  Groceries: { icon: MdShoppingCart, color: '#ADDDD0' },
  Transportation: { icon: MdDirectionsCar, color: '#FFDE00' },
  Dining: { icon: MdRestaurant, color: '#F73D93' },
  Entertainment: { icon: MdTheaters, color: '#EA906C' },
  Healthcare: { icon: MdLocalHospital, color: '#5F264A' },
  Education: { icon: MdSchool, color: '#FF6000' },
  Insurance: { icon: MdSecurity, color: '#FF597B' },
  Rent: { icon: MdHome, color: '#F273E6' },
  'Outcome Other': { icon: MdAttachMoney, color: '#E55604' },
  'Cleaning Household': { icon: MdCleaningServices, color: '#FEFAF6' },
  Houseware: { icon: MdHouse, color: '#124076' },
}

export const getCategoryIcon = (category: string): React.ComponentType<any> => {
  const iconComponent = categoryConfig[category as keyof typeof categoryConfig]?.icon || MdAttachMoney
  return iconComponent
}

export const getCategoryColor = (category: string): string => {
  const color = categoryConfig[category as keyof typeof categoryConfig]?.color || '#F0F3FF'
  return color
}
