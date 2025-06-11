
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Não renderizar toasts vazios ou com conteúdo em branco
        const hasTitle = title && title.toString().trim() !== '';
        const hasDescription = description && description.toString().trim() !== '';
        
        if (!hasTitle && !hasDescription) {
          return null;
        }
        
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {hasTitle && <ToastTitle>{title}</ToastTitle>}
              {hasDescription && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
