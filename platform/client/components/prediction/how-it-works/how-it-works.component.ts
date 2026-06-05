import { Component } from '@angular/core'

interface Step {
  icon:  string
  title: string
  desc:  string
  color: string
}

interface Stat {
  value: string
  label: string
  color: string
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  templateUrl: './how-it-works.component.html',
})
export class HowItWorksComponent {
  readonly steps: Step[] = [
    {
      icon:  '⚙️',
      title: '1. Configure the Model',
      desc:  'Pick LR, RF or XGBoost and tune the hyperparameters from a curated set of predefined values.',
      color: 'violet',
    },
    {
      icon:  '👕',
      title: '2. Pick 11 Starters',
      desc:  'Search and add 11 players per side. Players are automatically sorted by position: GK → DEF → MID → FWD.',
      color: 'amber',
    },
    {
      icon:  '📊',
      title: '3. Get the Prediction',
      desc:  'Hit "Predict" and the model returns H/D/A probabilities alongside its real test-set accuracy for that configuration.',
      color: 'blue',
    },
  ]

  readonly stats: Stat[] = [
    { value: '18', label: 'Liga Teams',      color: 'text-emerald-400' },
    { value: '3',  label: 'Models',          color: 'text-violet-400'  },
    { value: '~24', label: 'Param Combos',   color: 'text-amber-400'   },
    { value: '3',  label: 'Outcomes',        color: 'text-blue-400'    },
  ]

  stepIconClass(color: string): string {
    const map: Record<string, string> = {
      violet: 'bg-violet-500/10 border-violet-500/20',
      amber:  'bg-amber-500/10 border-amber-500/20',
      blue:   'bg-blue-500/10 border-blue-500/20',
    }
    return `w-10 h-10 ${map[color] ?? ''} border rounded-lg flex items-center justify-center text-2xl mb-4`
  }
}
