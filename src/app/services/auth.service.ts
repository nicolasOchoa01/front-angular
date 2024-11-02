//auth.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class AuthService 
{
  //----Modulos de instacia
  constructor(private http: HttpClient) {}
  //----Modulos de variables
  // En tu servicio de usuario
  //private apiUrl = 'http://localhost:3000'; // Cambia esto si tu API está en otro lugar
  private baseUrl = environment.apiUrlBack;


/*
||*******************************||
|| MODULOS FUNCIONES PARA FLASK  ||
||*******************************||
*/

  // Cambia el tipo de argumento a FormData
  // Método para registrar un usuario
  registerUser(username: string, audioBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', audioBlob, 'audio.wav');

    return this.http.post(`${this.baseUrl}register`, formData);
  }

  // Método para iniciar sesión con nombre de usuario y archivo de audio
  loginUsername(formData: FormData): Observable<any> {
    console.log(formData.get('username'))
    console.log(formData.get('audio'))
    return this.http.post(`${this.baseUrl}loggin-username`, formData);
  }

  // Método para iniciar sesión con contraseña (audio)
  loginPassword(username: string, audioBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('password', audioBlob); 
  //  formData.append('username', username); // Agregar el user_id directamente
    console.log(audioBlob);
    return this.http.post(`${this.baseUrl}loggin-password`, formData);
  }

  // // Método para subir el archivo de audio
  // uploadAudio(userId: string, audioBlob: Blob): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('audio', audioBlob, 'audio.wav');
  //   formData.append('user_id', userId); // Agregar el user_id directamente

  //   return this.http.post(`${this.baseUrl}/upload-audio/${userId}`, formData);
  // }


/*
||*******************************||
||  FIN DE FUNCIONES PARA FLASK  ||
||*******************************||
*/

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    // Puedes validar el token aquí, por ejemplo, verificando su existencia
    const token = localStorage.getItem('authToken');
    return !!token; // Retorna true si el token existe, false si no
  }

  // Método para cerrar sesión
  logout() {
    localStorage.removeItem('authToken');
  }

}