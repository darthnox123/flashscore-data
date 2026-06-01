import { Component } from '@angular/core'
import { RouterOutlet, RouterLink } from '@angular/router'

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './base-layout.component.html',
})
export class BaseLayoutComponent {
  readonly currentYear = new Date().getFullYear()
}
