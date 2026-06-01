import { Component } from '@angular/core'
import { ButtonComponent } from '../../components/ui/button/button.component'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
