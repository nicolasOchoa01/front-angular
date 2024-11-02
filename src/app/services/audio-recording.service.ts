import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as RecordRTC from 'recordrtc';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


export interface RecordedBlob{
  blob: Blob;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class AudioRecordingService {
  sendTranscribeToServer(fileId: any) {
    throw new Error('Method not implemented.');
  }
  saveTranscription(fileId: any) {
    throw new Error('Method not implemented.');
  }
  downloadTranscription(fileId: any) {
    throw new Error('Method not implemented.');
  }
  private recorder: any;
  private startTime = 0;
  private interval = 0;
  private stream: MediaStream | null = null;

  private recordedBlob = new Subject<RecordedBlob>();
  private recordingTime = new Subject<string>();
  private recordedFailed = new Subject<string>();
  private recordedCompleted = new Subject<boolean>();

  constructor(private httpClient: HttpClient) { }


  notifyRecordingCompleted() {
    this.recordedCompleted.next(true);
  }

  getRecordedCompleted(): Observable<boolean> {
    return this.recordedCompleted.asObservable();
  }

  startRecording(){
    if(!this.recorder){
      this.recordingTime.next('0:00');
      navigator.mediaDevices.getUserMedia({audio: true})
      .then(stream => {
        this.stream = stream;
        this.record();
      })
      .catch(() => {
        this.recordedFailed.next('')
      });
    }
  }

  private record(){
    if(this.stream) {
      this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
        type: 'audio',
        mimeType: 'audio/wav',
      });

      this.recorder.record();
    }
    this.startTimer();
  }

  private startTimer(){
    this.interval = window.setInterval(() => {
      this.startTime ++;
      this.recordingTime.next(this.timeFormat());
    }, 1000);
  }

  private timeFormat(): string {
    const minutes = Math.floor(this.startTime / 60);
    const seconds = this.startTime - (minutes * 60);
    return minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stop((blob: Blob) => {
        const title = encodeURIComponent('audio_' + new Date().getTime() + '.wav')
        console.log(title)
        this.recordedBlob.next({blob, title});
        // console.log( this.recordedBlob.next({blob, title}))
        // console.log(blob)
        this.notifyRecordingCompleted();
        this.stopMedia();
      }, () => {
        this.stopMedia();
        this.recordedFailed.next('');
      });
    }
  }

  private stopMedia(){
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = 0;

      if (this.stream) {
        //objeto MediaStreamTrack
        //console.log(this.recordedBlob.getBlob())
        // console.log(this.stream.getAudioTracks())
        // console.log(typeof(this.stream))
        this.stream.getAudioTracks().forEach(track => track.stop());
        this.stream = null;
      }
    }
  }

  deleteRecording(){
    if (!this.recorder){
      console.log("entro")
      this.recordingTime.next('0:00');
    }
  }

  sendAudioToServer(blob: Blob, title: string): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', blob);
    formData.append('title', title)

    const token = localStorage.getItem('authToken');
    const auth = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    //console.log(formData)
    // const data = {
    //   blob: recordedBlob,
    //   title: title,
    //   //aca no llega el stream que se genera cuando se ejecuta stopMedia
    //   stream: this.stream?.getAudioTracks()
    // }

    //stream esta nulo
    // console.log(data.stream)
    // console.log(recordedBlob);
                                                           // agregado del token en el header
    return this.httpClient.post<any>(environment.apiUrlBack + 'upload', formData, { headers: auth });
  }

  transcribeAudio(fileId: string): Observable<any> {
    const body = { file_id: fileId };
    return this.httpClient.post<any>(environment.apiUrlBack + 'transcribe', body);
  }

  abortRecording(){
    this.stopMedia();
  }

  getRecordedBlob(): Observable<RecordedBlob> {
    return this.recordedBlob.asObservable();
  }

  getRecordingTime(): Observable<string> {
    return this.recordingTime.asObservable();
  }

  getRecordedFailed(): Observable<string> {
    return this.recordedFailed.asObservable();
  }
}
