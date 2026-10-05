import { toast as sonnerToast } from 'sonner'

/**
 * Bütün bildirişlər tək qapıdan keçir ki, üslub və mətn tonu eyni qalsın.
 * Uğurlu GET əməliyyatları üçün toast göstərmirik — yalnız yazma əməliyyatları.
 */
export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, description ? { description } : undefined),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, description ? { description } : undefined),
  info: (message: string, description?: string) =>
    sonnerToast.message(message, description ? { description } : undefined),
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
}
