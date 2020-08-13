import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../../services/websocket.service';
import { TicketsService } from '../../../services/tickets.service';
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TicketResponse } from '../../../interfaces/ticket.interface';
import { UserService } from '../../../services/user.service';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-screen',
	templateUrl: './screen.component.html',
	styleUrls: ['./screen.component.css']
})
export class ScreenComponent implements OnInit {
	dni: number;
	loading = false;
	coming: boolean = false;
	publicMode: boolean = false;
	scores = new Map();
	constructor(
		private wsService: WebsocketService,
		public ticketsService: TicketsService,
		private userService: UserService,
		private snack: MatSnackBar,
		private router: Router
	) { }

	ngOnInit(): void {

		this.coming = false;
		const body = document.getElementsByTagName('body')[0];
		body.classList.remove('container');

		if (!this.userService.user) {

			if (!this.ticketsService.companyData) {
				this.router.navigate(['/public']);
				this.snack.open('Por favor ingrese una empresa primero!', null, { duration: 5000 });
			}

			this.publicMode = true;
		}

		this.ticketsService.getTickets();

	}

	toggle(chat): void {
		chat.toggle();
	}

	enCamino(): void {
		this.coming = true;
		let idSocketDesk = this.ticketsService.myTicket.id_socket_desk;
		this.wsService.emit('cliente-en-camino', idSocketDesk);
	}

	cancelTicket(): void {
		this.snack.open('Desea cancelar el turno?', 'SI, CANCELAR', { duration: 10000 }).afterDismissed().subscribe((data: MatSnackBarDismiss) => {
			if (data.dismissedByAction) {
				let idTicket = this.ticketsService.myTicket._id;
				this.ticketsService.cancelTicket(idTicket).subscribe((data: TicketResponse) => {
					if (data.ok) {
						this.snack.open(data.msg, 'ACEPTAR', { duration: 2000 });
						this.ticketsService.clearPublicSession();
						this.router.navigate(['/public']);
					}
				});
			}
		});
	}

	setScore(idTicket: string, cdScore: number): void {
		this.scores.set(idTicket, cdScore);

		if (this.ticketsService.allMytickets.length === this.scores.size) {
			let dataScores: Score[] = [];
			
			this.scores.forEach(function(valor, llave, mapaOrigen) {
				dataScores.push({id_ticket: llave, cd_score: valor});
			});


			this.ticketsService.sendScores(dataScores).subscribe((d)=>{
				console.log(d)
			})
			
			const Toast = Swal.mixin({
				toast: true,
				position: 'center',
				showConfirmButton: false,
				timer: 3000,
				timerProgressBar: true,
				onOpen: (toast) => {
				  toast.addEventListener('mouseenter', Swal.stopTimer)
				  toast.addEventListener('mouseleave', Swal.resumeTimer)
				}
			  })
			  
			  Toast.fire({
				icon: 'success',
				title: '¡Gracias!'
			  }).then(data => {
				if (data.isDismissed) {
					this.ticketsService.clearPublicSession();
				}
			})





		}
	}


}

interface Score {
	id_ticket: string,
	cd_score: number
}

