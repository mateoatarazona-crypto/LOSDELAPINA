'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onRemove: () => void
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(onRemove, 300)
  }

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-cyan-900/90',
      border: 'border-cyan-500/50',
      icon: (
        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        }
      case 'error':
        return {
          bg: 'bg-red-900/90',
          border: 'border-red-500/50',
          icon: (
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        }
      case 'warning':
        return {
          bg: 'bg-yellow-900/90',
          border: 'border-yellow-500/50',
          icon: (
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        }
      case 'info':
      default:
        return {
          bg: 'bg-blue-900/90',
          border: 'border-blue-500/50',
          icon: (
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className={`
      transform transition-all duration-300 ease-out
      ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${isRemoving ? 'scale-95' : 'scale-100'}
    `}>
      <div className={`
        ${styles.bg} ${styles.border}
        backdrop-blur-sm border rounded-xl p-4 shadow-lg
        max-w-sm w-full
      `}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {styles.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-subheading text-white text-sm font-semibold">
              {notification.title}
            </h4>
            
            {notification.message && (
              <p className="font-body text-gray-300 text-xs mt-1 leading-relaxed">
                {notification.message}
              </p>
            )}
            
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="mt-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors duration-200 underline"
              >
                {notification.action.label}
              </button>
            )}
          </div>
          
          <button
            onClick={handleRemove}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook de conveniencia para notificaciones comunes
export function useNotificationHelpers() {
  const { addNotification } = useNotifications()

  return {
    success: (title: string, message?: string) => 
      addNotification({ type: 'success', title, message }),
    
    error: (title: string, message?: string) => 
      addNotification({ type: 'error', title, message }),
    
    warning: (title: string, message?: string) => 
      addNotification({ type: 'warning', title, message }),
    
    info: (title: string, message?: string) => 
      addNotification({ type: 'info', title, message }),
    
    loading: (title: string, message?: string) => 
      addNotification({ 
        type: 'info', 
        title, 
        message, 
        duration: 0 // No auto-remove
      })
  }
}