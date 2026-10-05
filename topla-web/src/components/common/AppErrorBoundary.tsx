import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface State {
  hasError: boolean
}

/** Son sığınacaq: gözlənilməz render xətasında ağ ekran əvəzinə anlaşılan mesaj. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Real layihədə burada Sentry kimi xidmətə göndərilir.
    console.error('Render xətası:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
          <AlertTriangle className="size-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-ink-900">Nəsə səhv getdi</h1>
          <p className="max-w-md text-sm text-ink-500">
            Səhifəni yenidən yükləməyə cəhd et. Problem davam edərsə bir azdan yenidən yoxla.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Səhifəni yenilə
        </button>
      </div>
    )
  }
}
