'use client'

import { Agency, User } from '@prisma/client'
import { createContext, useContext, useEffect, useState } from 'react'

interface ModalProviderProps {
  children: React.ReactNode
}

export type ModalData = {
  user?: User
  agency?: Agency
}

type ModalContextType = {
  data: ModalData
  isOpen: boolean
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => void
  setClose: () => void
}

export const ModalContext = createContext<ModalContextType>({
  data: {},
  isOpen: false,
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => {},
  setClose: () => {},
})

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<ModalData>({})
  const [showingModal, setShowingModal] = useState<React.ReactNode>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const setOpen = async (
    modal: React.ReactNode,
    fetchData?: () => Promise<any>
  ) => {
    if (modal) {
      if (fetchData) {
        setData({ ...data, ...(await fetchData()) } || {})
      }
      setShowingModal(modal)
      setIsOpen(true)
    }
  }

  const setClose = () => {
    setIsOpen(false)
    setData({})
  }

  if (!isMounted) return null

  return (
    <ModalContext.Provider value={{ data, setOpen, setClose, isOpen }}>
      {children}
      {showingModal}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('Use Modal must be used within Modal Provider')
  }
  return context
}

export default ModalProvider
