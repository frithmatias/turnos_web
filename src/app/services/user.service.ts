import { Injectable } from '@angular/core';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// Interfaces
import { Desktop } from 'src/app/interfaces/desktop.interface';
import { Skill } from '../interfaces/skill.interface';
import { User } from 'src/app/interfaces/user.interface';
import { Company, CompaniesResponse } from '../interfaces/company.interface';
import { MatStepper } from '@angular/material/stepper';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	//assistant || user
	token: string;
	user: User;
	menu: any[] = [];
	logueado = false;
	//assistant
	desktop: Desktop;
	public companies: Company[] = [];

	public companiesSource = new Subject<Company[]>();
	companies$ = this.companiesSource.asObservable();
	
	public userSource = new Subject<User>();
	user$ = this.userSource.asObservable();


	constructor(private http: HttpClient, private router: Router) {
		if (localStorage.getItem('token') && localStorage.getItem('user') && localStorage.getItem('menu')) {
			this.token = JSON.parse(localStorage.getItem('token'));
			this.menu = JSON.parse(localStorage.getItem('menu'));
			let user = JSON.parse(localStorage.getItem('user'));
			this.pushUser(user);

			if (this.user.id_role === 'USER_ROLE') {
				this.readCompanies(this.user._id).subscribe(data => {
					this.companies = data.companies;
					this.companiesSource.next(data.companies);
				})
			}

			this.logueado = true;
		}
	}


	// ========================================================
	// User Methods
	// ========================================================

	pushUser(user: User) {
		localStorage.setItem('user', JSON.stringify(user));
		this.user = user;
		this.userSource.next(this.user);
	}

	createUser(user: User) {
		let data = { user };
		const url = environment.url + '/u/register';
		return this.http.post(url, data);
	}

	checkEmailExists(pattern: string) {
		let data = { pattern }
		const url = environment.url + '/u/checkemailexists';
		return this.http.post(url, data);
	}

	getUser(uid: string) {
		const url = environment.url + '/u/users/' + uid;
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		return this.http.get(url, { headers }).pipe(
			map((resp: any) => {
				return resp.user;
			})
		);
	}

	updateUser(user: User) {
		const url = environment.url + '/u/users/' + user._id;

		const headers = new HttpHeaders({
			'turnos-token': this.token
		});

		return this.http.put(url, user, { headers }).pipe(
			map((resp: any) => {
				if (user._id === this.user._id) {
					this.pushUser(resp.user);
				}
				return true;
			}),
			// seccion 17 clase 222, capturo el error con throwError en PROFILE.COMPONENT.TS
			catchError(err => {
				return throwError(err);
			})
		);
	}

	deleteUser(id: string) {
		const url = environment.url + '/u/' + id;

		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		// url += '?token=' + this.token;

		return this.http.delete(url, { headers }).pipe(
			map(resp => {
				Swal.fire(
					'Usuario borrado',
					'El user a sido eliminado correctamente',
					'success'
				);
				return true;
			})
		);
	}

	activateUser(id: string) {
		const url = environment.url + '/u/activate/' + id;
		return this.http.get(url)
			.pipe(map(data => {
				return data;
			}),
				catchError(err => {
					return throwError(err);
				})
			)
	}

	// ========================================================
	// Companies Methods
	// ========================================================

	createCompany(company: Company) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		let data = { company };
		const url = environment.url + '/c/create';
		return this.http.post(url, data, { headers });
	}

	attachCompany(company: Company) {
		// return new user object with populated company
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		let data = { company };
		let idUser = this.user._id;
		const url = environment.url + '/u/attach/' + idUser;
		return this.http.post(url, data, { headers });
	}

	checkCompanyExists(pattern: string) {
		let data = { pattern }
		const url = environment.url + '/c/checkcompanyexists';
		return this.http.post(url, data);
	}

	readCompanies(idUser: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/c/readcompanies/' + idUser;
		return this.http.get(url, { headers }).pipe(tap((data: CompaniesResponse) => {
			this.companies = data.companies;
			this.companiesSource.next(data.companies);
		}));
	}

	updateCompany(company: Company) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/c/update';
		return this.http.post(url, company, { headers });
	}

	deleteCompany(idCompany: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/c/deletecompany/' + idCompany;
		return this.http.delete(url, { headers });
	}


	// ========================================================
	// Assistants Methods
	// ========================================================

	createAssistant(assistant: User) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/a/createassistant';
		return this.http.post(url, assistant, { headers });
	}

	readAssistants(idCompany: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/a/readassistants/' + idCompany;
		return this.http.get(url, { headers });
	}

	updateAssistant(assistant: User) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/a/updateassistant';
		return this.http.post(url, assistant, { headers });
	}

	deleteAssistant(idAssistant: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/a/deleteassistant/' + idAssistant;
		return this.http.delete(url, { headers });
	}

	// ========================================================
	// Desktop Methods
	// ========================================================

	createDesktop(desktop: Desktop) {

		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/d/createdesktop';
		return this.http.post(url, desktop, { headers });
	}

	readDesktops(idCompany: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/d/readdesktops/' + idCompany;
		return this.http.get(url, { headers });
	}

	readDesktopsUser(idUser: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/d/readdesktopsuser/' + idUser;
		return this.http.get(url, { headers });
	}

	deleteDesktop(idDesktop: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/d/deletedesktop/' + idDesktop;
		return this.http.delete(url, { headers });
	}

	takeDesktop(idDesktop: string, idAssistant: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		let data = { idDesktop, idAssistant }
		const url = environment.url + '/d/takedesktop';
		return this.http.post(url, data, { headers });
	}

	releaseDesktop(idDesktop: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		let data = { idDesktop }
		const url = environment.url + '/d/releasedesktop';
		return this.http.post(url, data, { headers });
	}

	// ========================================================
	// Skill Methods
	// ========================================================

	createSkill(skill: Skill) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/s/createskill';
		return this.http.post(url, skill, { headers });
	}

	readSkills(idCompany: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/s/readskills/' + idCompany;
		return this.http.get(url, { headers });
	}

	readSkillsUser(idUser: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/s/readskillsuser/' + idUser;
		return this.http.get(url, { headers });
	}

	deleteSkill(idSkill: string) {
		const headers = new HttpHeaders({
			'turnos-token': this.token
		});
		const url = environment.url + '/s/deleteskill/' + idSkill;
		return this.http.delete(url, { headers });
	}


	// ========================================================
	// Session Methods
	// ========================================================


	loginUser(user: User, recordar: boolean = false) {
		if (recordar) {
			localStorage.setItem('email', user.tx_email);
		} else {
			localStorage.removeItem('email');
		}

		const url = environment.url + '/u/login';
		return this.http.post(url, user).pipe(
			map((resp: any) => {
				this.token = resp.token;
				localStorage.setItem('token', JSON.stringify(resp.token));
				this.menu = resp.menu;
				localStorage.setItem('menu', JSON.stringify(resp.menu));
				this.pushUser(resp.user);
				this.logueado = true;
				return resp;
			}),
			// clase 222 seccion 17, manejo de errores
			catchError(err => {
				return throwError(err);
			})
		);
	}

	loginGoogle(token: string) {
		const url = environment.url + '/u/google';
		return this.http.post(url, { token }).pipe(map((resp: any) => {
			this.token = resp.token;
			localStorage.setItem('token', JSON.stringify(resp.token));
			this.menu = resp.menu;
			localStorage.setItem('menu', JSON.stringify(resp.menu));
			this.pushUser(resp.user);
			this.logueado = true;
			return true;
		}),
			catchError(err => {
				return throwError(err);
			})
		);
	}

	updateToken() {

		const url = environment.url + '/login/updatetoken';
		// url += '?token=' + this.token;

		const headers = new HttpHeaders({
			'turnos-token': this.token
		});

		return this.http.get(url, { headers })
			.pipe(map((resp: any) => {
				this.token = resp.token;
				localStorage.setItem('token', this.token);
			}));

	}

	estaLogueado() {
		// si no hay token el user no esta logueado
		if ((this.token.length < 5) || (typeof this.token === 'undefined') || (this.token === 'undefined')) {
			return false;
		}
		// si el user se logueo en algun momento verifico la expiracion del token
		const payload = JSON.parse(atob(this.token.split('.')[1]));
		const ahora = new Date().getTime() / 1000;

		if (payload.exp < ahora) {
			this.logout();
			return false; // token expirado
		} else {
			return true; // token valido
		}
	}

	logout() {
		if (localStorage.getItem('token')) { localStorage.removeItem('token'); }
		if (localStorage.getItem('user')) { localStorage.removeItem('user'); }
		if (localStorage.getItem('menu')) { localStorage.removeItem('menu'); }
		if (localStorage.getItem('desktop')) { localStorage.removeItem('desktop'); }
		if (localStorage.getItem('ticket')) { localStorage.removeItem('ticket'); }

		this.token = '';
		this.user = null;
		this.userSource.next(null)
		this.menu = null;
		this.logueado = false;
		this.companies = null;
		this.router.navigate(['/home']);
	}

	scrollTop() {
		document.body.scrollTop = 0; // Safari
		document.documentElement.scrollTop = 0; // Other
	}

	stepperGoBack(stepper: MatStepper) {
		stepper.previous();
	}

	stepperGoNext(stepper: MatStepper) {
		this.scrollTop();
		stepper.next();
	}

	stepperReset(stepper: MatStepper) {
		stepper.reset();
	}
}
