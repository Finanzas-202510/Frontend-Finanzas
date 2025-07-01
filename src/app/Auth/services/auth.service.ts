import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  constructor(private http: HttpClient) {

  }
  login(email: string, password: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}?email=${email}&password=${password}`)
      .pipe(
        map(users => {
          if (users.length > 0) {
            localStorage.setItem('user', JSON.stringify(users[0]));
            return true;
          }
          return false;
        })
      );
  }
  getCurrentUser(): any | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

}
