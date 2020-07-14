import { Injectable } from '@angular/core';
import { CanActivate  } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable()
export class LoginGuard implements CanActivate {

	constructor(
		public userService: UserService,
	) { }

	canActivate() {
		if (this.userService.logueado) {
			return true;
		} else {
			return false;
		}

	}
}
