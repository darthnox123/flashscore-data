import { Component, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'

export type ModelType = 'lr' | 'rf' | 'xgb'

interface ParamOption { value: unknown; label: string }
interface ParamDef    { key: string; label: string; options: ParamOption[] }

export interface ModelConfig {
  model:  ModelType
  params: Record<string, unknown>
}

@Component({
  selector: 'app-model-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-config.component.html',
})
export class ModelConfigComponent {
  @Output() configChanged = new EventEmitter<ModelConfig>()

  readonly MODEL_LABELS: Record<ModelType, string> = {
    lr:  'Logistic Regression',
    rf:  'Random Forest',
    xgb: 'XGBoost',
  }

  readonly MODELS: { key: ModelType; short: string }[] = [
    { key: 'lr',  short: 'LR'  },
    { key: 'rf',  short: 'RF'  },
    { key: 'xgb', short: 'XGB' },
  ]

  readonly MODEL_PARAMS: Record<ModelType, ParamDef[]> = {
    lr: [
      {
        key: 'C', label: 'Regularization C',
        options: [
          { value: 0.01, label: '0.01' },
          { value: 0.1,  label: '0.1'  },
          { value: 1.0,  label: '1'    },
          { value: 10.0, label: '10'   },
        ],
      },
      {
        key: 'solver', label: 'Solver',
        options: [
          { value: 'lbfgs', label: 'lbfgs' },
          { value: 'saga',  label: 'saga'  },
        ],
      },
    ],
    rf: [
      {
        key: 'n_estimators', label: 'Trees',
        options: [
          { value: 50,  label: '50'  },
          { value: 100, label: '100' },
          { value: 200, label: '200' },
        ],
      },
      {
        key: 'max_depth', label: 'Max Depth',
        options: [
          { value: null, label: 'None' },
          { value: 5,    label: '5'    },
          { value: 10,   label: '10'   },
        ],
      },
    ],
    xgb: [
      {
        key: 'learning_rate', label: 'Learning Rate',
        options: [
          { value: 0.01, label: '0.01' },
          { value: 0.1,  label: '0.1'  },
          { value: 0.3,  label: '0.3'  },
        ],
      },
      {
        key: 'n_estimators', label: 'Trees',
        options: [
          { value: 50,  label: '50'  },
          { value: 100, label: '100' },
          { value: 200, label: '200' },
        ],
      },
    ],
  }

  private readonly DEFAULT_PARAMS: Record<ModelType, Record<string, unknown>> = {
    lr:  { C: 1.0, solver: 'lbfgs' },
    rf:  { n_estimators: 100, max_depth: null },
    xgb: { learning_rate: 0.1, n_estimators: 100 },
  }

  selectedModel: ModelType = 'lr'
  selectedParams: Record<string, unknown> = { ...this.DEFAULT_PARAMS['lr'] }

  get currentParamDefs(): ParamDef[] {
    return this.MODEL_PARAMS[this.selectedModel]
  }

  modelBtnClass(model: ModelType): string {
    const base = 'px-3.5 py-1.5 text-xs font-bold rounded-md border cursor-pointer transition-all duration-150'
    return model === this.selectedModel
      ? `${base} bg-violet-500/20 border-violet-500/60 text-violet-400`
      : `${base} bg-white/5 border-white/10 text-white/45 hover:bg-white/10`
  }

  paramBtnClass(key: string, value: unknown): string {
    const base = 'px-2.5 py-1 text-[0.75rem] font-semibold rounded-md border cursor-pointer transition-all duration-150'
    return this.selectedParams[key] === value
      ? `${base} bg-amber-500/15 border-amber-500/50 text-amber-400`
      : `${base} bg-white/5 border-white/10 text-white/40 hover:bg-white/10`
  }

  selectModel(model: ModelType): void {
    this.selectedModel  = model
    this.selectedParams = { ...this.DEFAULT_PARAMS[model] }
    this.emit()
  }

  setParam(key: string, value: unknown): void {
    this.selectedParams = { ...this.selectedParams, [key]: value }
    this.emit()
  }

  private emit(): void {
    this.configChanged.emit({ model: this.selectedModel, params: this.selectedParams })
  }
}
