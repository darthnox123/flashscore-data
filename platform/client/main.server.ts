import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent } from './app.component'
import { appServerConfig } from './app.config.server'

const bootstrap = () => bootstrapApplication(AppComponent, appServerConfig)

export default bootstrap
