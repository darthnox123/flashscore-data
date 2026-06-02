import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser'
import { AppComponent } from './app.component'
import { appServerConfig } from './app.config.server'

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, appServerConfig, context)

export default bootstrap
