import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service'; 
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AudioRecordingService, RecordedBlob } from 'src/app/services/audio-recording.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, OnDestroy {
  usernameControl = this.fb.control('', [Validators.required]);
  audioBlob: Blob | null = null;
  audioUrl: SafeUrl | null = null;
  isRecording = false;

  oracion: string | null = null; // Nueva variable para almacenar la oración
  private userId: string | null = null; // Nueva variable para almacenar el userId
  private message: string | null = null;
  
  private audioRecordingSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private audioRecordingService: AudioRecordingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse al observable para obtener el audio grabado
    this.audioRecordingSubscription = this.audioRecordingService.getRecordedBlob()
      .subscribe((recorded: RecordedBlob) => {
        this.audioBlob = recorded.blob;
        this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.audioBlob));
      });
  }

  ngOnDestroy(): void {
    this.audioRecordingSubscription?.unsubscribe();
  }

  startRecording(): void {
    this.isRecording = true;
    this.audioRecordingService.startRecording();
  }

  stopRecording(): void {
    this.isRecording = false;
    this.audioRecordingService.stopRecording();
  }

  navigateToRegister() {
    this.router.navigate(['/register']); // Asegúrate de que la ruta '/register' esté configurada en tu enrutador
  }

  // ----------------------------- FUNCIONES PARA EL COMUNICARSE --------------------------------------
  login(): void {
    if (!this.usernameControl.valid) {
      alert("Por favor, ingresa un nombre de usuario.");
      return;
    }

    const username = this.usernameControl.value  ?? '';

    // Crear un nuevo FormData
    const formData = new FormData();
    formData.append('username', username); // Añadir el nombre de usuario

    // Llamar al servicio de autenticación
    this.authService.loginUsername(formData).subscribe(
      (response:any) => {
        if (response.resultado) {
          this.message = response.mensaje;
          this.oracion = response.oracion; // Almacena la oración en la variable
        } else {
          alert("No se pudo obtener la oración.");
        }
      },
      (error:any) => {
        if(error.status === 400 && error.error && error.error.mensaje){
          this.message = error.error.mensaje;
          console.log(this.message);
          alert(this.message);
        } else{
          this.message = 'Ocurrió un error al intentar iniciar sesión.';
          alert(this.message);
        }
      }
    );
  }

  // Función para validar la voz
  validateVoice(): void {
    if (!this.audioBlob) {
      alert("Por favor, graba tu voz.");
      return;
    }

    const username = this.usernameControl.value ?? ''; // Usar el valor del control como userId

    this.authService.loginPassword(username, this.audioBlob).subscribe(
      (response: any) => {
        // Manejar la respuesta del backend
        if (response.resultado) {
          this.message = response.mensaje;
          localStorage.setItem('authToken', response.token);
          console.log(this.message);
          console.log("token: " + response.token);
          alert("Voz validada con éxito!");
          this.router.navigate(['/application']);
        } else {
          alert("Validación de voz fallida.");
        }
      },
      (error:any) => {
        if(error.status === 400 && error.error && error.error.mensaje){
          this.oracion = error.error.oracion;
          this.message = error.error.mensaje;
          console.log(this.oracion);
          console.log(this.message);
          alert(this.message);
        } else{
          console.error('Error al enviar el audio', error);
          this.message = 'Error en la autenticación. Intente de nuevo.';
          // Manejar errores
          alert("Error al validar la voz.");
        }
      }
    );
  }



}

