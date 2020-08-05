import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { User, UserResponse } from 'src/app/interfaces/user.interface';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';
import { HttpErrorResponse } from '@angular/common/http';
import { Skill, SkillsResponse } from '../../../../interfaces/skill.interface';
import { AssistantResponse } from '../../../../interfaces/assistant.interface';

@Component({
	selector: 'app-assistant-create-form',
	templateUrl: './assistant-create-form.component.html',
	styleUrls: ['./assistant-create-form.component.css']
})
export class AssistantCreateFormComponent implements OnInit, OnChanges {
	@Input() assistantEdit: User;
	@Output() updateAssistants: EventEmitter<string> = new EventEmitter();
	selStrSkills: string[];
	forma: FormGroup;
	skills: Skill[] = [];
	constructor(
		public userService: UserService,
		private snack: MatSnackBar
	) { }

	ngOnInit(): void {
		// build reactive form
		this.forma = new FormGroup({
			rol: new FormControl(null, Validators.required),
			idCompany: new FormControl(null, Validators.required),
			nombre: new FormControl(null, Validators.required),
			email: new FormControl(null, [Validators.required, Validators.email]),
			password: new FormControl(null, Validators.required),
			password2: new FormControl(null, Validators.required)
		}, { validators: this.sonIguales('password', 'password2') });
	}

	ngOnChanges(changes: SimpleChanges) {
		this.forma?.enable();
		// USER_ROLE -> id_company: null
		if (changes.assistantEdit.currentValue?.id_role === 'USER_ROLE') {
			this.forma.controls['rol'].disable();
			this.forma.controls['email'].disable();
		} else {
			if (changes.assistantEdit.currentValue?.id_company._id) {
				this.getSkills(changes.assistantEdit.currentValue.id_company._id)
			}
		}


		if (changes.assistantEdit.currentValue?.id_company?._id) {
			this.forma?.patchValue({ idCompany: changes.assistantEdit.currentValue.id_company._id });
		}

		this.forma?.patchValue({
			rol: changes.assistantEdit.currentValue.id_role,
			email: changes.assistantEdit.currentValue.tx_email,
			nombre: changes.assistantEdit.currentValue.tx_name,
			password: '******',
			password2: '******'
		})

		this.selStrSkills = changes.assistantEdit?.currentValue?.id_skills;
	}

	getSkills(idCompany: string) {
		this.userService.readSkillsCompany(idCompany).subscribe((data: SkillsResponse) => {
			this.skills = data.skills;
		})
	}

	// validators
	sonIguales(campo1: string, campo2: string) {
		return (group: FormGroup) => {
			const pass1 = group.controls[campo1].value;
			const pass2 = group.controls[campo2].value;
			if (pass1 === pass2) {
				return null;
			}
			return {
				password: 'Las contraseñas deben ser iguales'
			};
		};
	}


	setNewSkill(skill: any): void {

	}

	createAssistant(formDirective: FormGroupDirective) {

		if (!this.selStrSkills || this.selStrSkills.length === 0) {
			this.snack.open('Seleccione al menos un skill', 'ACEPTAR', { duration: 5000 });
			return;
		}

		if (this.forma.invalid) {
			if (this.forma.errors?.password) {
				this.snack.open(this.forma.errors.password, 'ACEPTAR', { duration: 5000 });
			}
			return;
		}

		const assistant: any = {
			// para acceder a los datos de un control disabled puedo traerlos desde forma.controls 
			// o con el método this.forma.getRawValue()
			id_role: this.forma.controls.rol.value,
			id_company: this.forma.value.idCompany,
			tx_name: this.forma.value.nombre,
			tx_email: this.forma.controls.email.value,
			tx_password: this.forma.value.password,
			id_skills: this.selStrSkills
		};

		if (this.assistantEdit) {
			assistant._id = this.assistantEdit._id;

			this.userService.updateAssistant(assistant).subscribe((data: AssistantResponse) => {
				this.assistantEdit = null;
				this.updateAssistants.emit(data.assistant._id);
				this.snack.open(data.msg, null, { duration: 5000 });
				this.forma.reset();
				formDirective.resetForm();
			}, (err: HttpErrorResponse) => {
				this.snack.open(err.error.msg, null, { duration: 5000 });
			})

		} else {

			this.userService.createAssistant(assistant).subscribe(
				(data: AssistantResponse) => {
					this.updateAssistants.emit(data.assistant._id);
					this.snack.open(data.msg, null, { duration: 5000 });
					this.forma.reset();
					formDirective.resetForm();
				}, (err: HttpErrorResponse) => {
					this.snack.open(err.error.msg, null, { duration: 5000 });
				}
			)
		}

	}

	manejaError = (err: AjaxError) => {
		return of<AjaxError>(err);
	}


	resetForm(formDirective: FormGroupDirective) {
		this.assistantEdit = null;
		this.forma.enable();
		this.forma.reset();
		formDirective.resetForm();
	}
}
