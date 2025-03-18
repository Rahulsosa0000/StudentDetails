
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentServiceService {

  private baseUrl = 'http://localhost:8080/api/students'; //  Base URL

  constructor(private http: HttpClient) {}

  //  Save Student Data
  saveStudent(studentData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.baseUrl}/save`, studentData, { headers });
  }

   // File Upload API Call
   uploadFile(formData: FormData) {
    return this.http.post<{ fileName: string }>(`${this.baseUrl}/upload`, formData);
  }


  getStudents(pageIndex: number, pageSize: number): Observable<any> {
    const validPage = isNaN(pageIndex) ? "0" : pageIndex.toString(); 
    const validSize = isNaN(pageSize) ? "10" : pageSize.toString();   
  
    return this.http.get<any>(`${this.baseUrl}/getAll`, {
      params: { page: validPage, size: validSize }
    });
  }
  
  
  updateStudent(student: any): Observable<any> {
    console.log("Calling API to Update Student:", student); 
    console.log("API URL:", `${this.baseUrl}/${student.id}`); 
  
    return this.http.put<any>(`${this.baseUrl}/${student.id}`, student);
  }
  



  deleteStudent(studentId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${studentId}`, { responseType: 'text' });
  }
  
  getStudentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
  
  
}

