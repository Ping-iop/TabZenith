import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../atoms/Button';

interface Props {
  readonly children: ReactNode;
  readonly fallbackTitle?: string;
}

interface State {
  readonly hasError: boolean;
  readonly error: Error | null;
  readonly errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[TabZenith] ErrorBoundary capturó una excepción crítica:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private readonly handleReload = (): void => {
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900/95 border border-red-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <h1 className="text-xl font-bold text-slate-100">
                  {this.props.fallbackTitle || 'Error en TabZenith'}
                </h1>
                <p className="text-xs text-red-300">Se produjo un error al renderizar la vista.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-red-300 font-mono overflow-auto max-h-48 mb-6">
              <p className="font-bold mb-1">{this.state.error?.name}: {this.state.error?.message}</p>
              {this.state.error?.stack && (
                <pre className="text-slate-400 whitespace-pre-wrap">{this.state.error.stack}</pre>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="primary"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={this.handleReload}
              >
                Recargar Vista
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
