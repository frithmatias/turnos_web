import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// ROUTES
import { AppRoutingModule } from './app-routing.module';

// SOCKET.IO 
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

// ENV
import { environment } from '../environments/environment';

// CONF
const config: SocketIoConfig = { url: environment.url, options: {} };

// COMPONENTS
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';

import { NopagefoundComponent } from './pages/nopagefound/nopagefound.component';

// MODULES
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './modules/material.module';

// GUARDS
import { AdminGuard } from './guards/admin.guard';
import { TokenGuard } from './guards/token.guard';
import { LoginGuard } from './guards/login.guard';
import { ComponentsModule } from 'src/app/components/components.module';
import { HomeComponent } from './pages/home/home.component';


@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		RegistroComponent,
		LoginComponent,
		NopagefoundComponent
	],
	imports: [
		MaterialModule,
		ComponentsModule,
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		AppRoutingModule,
		SocketIoModule.forRoot(config)
	],
	exports: [],
	providers: [
		AdminGuard,
		TokenGuard,
		LoginGuard
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
