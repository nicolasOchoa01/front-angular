import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AudioRecordingService, RecordedBlob } from 'src/app/services/audio-recording.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  usernameControl = this.fb.control('', [Validators.required]);
  audioBlob: Blob | null = null;
  audioUrl: SafeUrl | null = null;
  isRecording = false;


  mensaje: string | null = null; // Nueva variable para almacenar la oración
  

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private audioService: AudioRecordingService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.audioService.getRecordedBlob().subscribe((recorded: RecordedBlob) => {
      this.audioBlob = recorded.blob;
      this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.audioBlob));
    });
  }

  startRecording() {
    this.isRecording = true;
    this.audioService.startRecording();
  }

  stopRecording() {
    this.isRecording = false;
    this.audioService.stopRecording();
  }

  // ----------------------------- FUNCIONES PARA EL COMUNICARSE --------------------------------------
  register() {
    if (!this.usernameControl.valid || !this.audioBlob) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    this.authService.registerUser(this.usernameControl.value, this.audioBlob).subscribe(
      response => {
        if (response.mensaje)
        {
          this.mensaje = response.mensaje; // Almacenarlo para mostrar en el HTML
          console.log(this.mensaje);
          this.router.navigate(['/inicio']);
          
        } else {
          console.log("Ocurrio un error inesperado");
        }
      },
      error => {
        if (error.status === 400 && error.error.mensaje === 'ya existe un usuario registrado con ese nombre en el sistema') {
          alert("El nombre de usuario ya está en uso. Por favor, elige otro.");
        } else {
          alert("Error en el registro: " + error.message);
        }
      }
    );
  }
  
}

