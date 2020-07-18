import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Desktop, DesktopResponse } from '../../../../interfaces/desktop.interface';

@Component({
	selector: 'app-desktop-create-form',
	templateUrl: './desktop-create-form.component.html',
	styleUrls: ['./desktop-create-form.component.css']
})
export class DesktopCreateFormComponent implements OnInit {
	@Output() desktopCreated: EventEmitter<Desktop> = new EventEmitter();
	forma: FormGroup;
	constructor(
		private userService: UserService,
		private snack: MatSnackBar
	) { }

	ngOnInit(): void {
		this.forma = new FormGroup({
			idDesktop: new FormControl(null, Validators.required),
			idType: new FormControl(null)
		});
	}

	createDesktop() {
		console.log(this.forma);
		if (this.forma.invalid) {
			return;
		}

		const desktop: Desktop = {
			id_company: this.userService.usuario._id,
			id_desktop: this.forma.value.idDesktop,
			fc_from: null,
			fc_to: null,
			__v: null,
			_id: null
		};

		this.userService.createDesktop(desktop).subscribe((data: DesktopResponse) => {
			console.log(data);
			this.desktopCreated.emit(data.desktop);
			this.snack.open(data.msg, null, { duration: 5000 });
		},
			(err: any) => {
				this.snack.open(err.error.msg, null, { duration: 5000 });
			}
		)
	}

}