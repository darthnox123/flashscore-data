import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './base-layout.component.html',
})
export class BaseLayoutComponent {
  readonly currentYear = new Date().getFullYear()
}
