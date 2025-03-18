

import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { StudentServiceService } from '../../service/student-service.service';
import { Router } from '@angular/router';
import { ScrollerModule } from 'primeng/scroller';
import {  DropdownModule } from 'primeng/dropdown';
import * as XLSX from 'xlsx';



@Component({
  selector: 'app-studentdashboard',
  standalone: true,  
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    ConfirmDialogModule,
    ScrollerModule,
   DropdownModule,
  ],
  providers: [ConfirmationService, MessageService],  
  templateUrl: './studentdashboard.component.html',
  styleUrls: ['./studentdashboard.component.css'],
})
export class StudentdashboardComponent implements OnInit {
  students: any[] = [];
  filteredStudents: any[] = [];
  totalRecords = 0;
  loading = false;
  currentPage = 0;
  rowsPerPage = 10;

  bufferSize = 10;
  editDialog = false;
  selectedStudent: any = {};

  // Filter Variables
  selectedGender: string = '';
  selectedEducation: string = '';

  genderOptions = [
    { label: 'Filter By Gender', value: '' },
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' }
  ];

   educationOptions: { label: string, value: string }[] = [];  // Empty initially

  // educationOptions: { label: string, value: string }[] = [
  //   { label: 'All', value: '' },
  //   { label: '10th', value: '10th' },
  //   { label: '12th', value: '12th' },
  //   { label: 'UG', value: 'UG' },
  //   { label: "PG", value: "PG" },
    
  // ];
  
  constructor(
    private studentService: StudentServiceService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadStudents(this.currentPage);
   // this.generateEducationOptions();  // Ensure dropdown has default values

  }

  loadStudents(page: number) {
    if (this.loading) return; 
    this.loading = true; 

    console.log("Loading students for page:", page);

    this.studentService.getStudents(page, this.rowsPerPage).subscribe({
      next: (response: any) => {
        console.log("API Response:", response);

        if (response && Array.isArray(response.students)) {
          this.students = [...this.students, ...response.students]; 
          this.totalRecords = response.totalRecords || 0; 
          
          // Generate unique education options
          this.generateEducationOptions();
          
          // Apply filters after data is loaded
          this.applyFilters();
        } else {
          console.error("Unexpected API Response Format:", response);
        }

        this.loading = false; 
      },
      error: (error) => {
        console.error("Error fetching students:", error);
        this.loading = false; 
      }
    });
  }

    @HostListener('window:scroll', [])
  onScroll() {
   
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      this.loadMoreData();
    }
  }

  loadMoreData() {
    
    if (this.students.length < this.totalRecords && !this.loading) {
      this.currentPage++; 
      this.loadStudents(this.currentPage); 
    }
  }


  generateEducationOptions() {
    let predefinedEducation = new Set<string>(['10th', '12th', 'UG', 'PG']);

    if (this.students && this.students.length > 0) {
        this.students.forEach(student => {
            if (student.education) {
                student.education.forEach((edu: any) => {
                    if (edu.educationLevel) {
                        predefinedEducation.add(edu.educationLevel);
                    }
                });
            }
        });
    }

    
    this.educationOptions = [
        { label: 'Education Filter', value: '' },  
        ...Array.from(predefinedEducation).map(level => ({ label: level, value: level }))
    ];

   
    this.educationOptions = [...this.educationOptions];  
}


//   generateEducationOptions() {
//     let uniqueEducation = new Set<string>();
    
//     this.students.forEach(student => {
//       if (student.education) {
//         student.education.forEach((edu: any) => {
//           if (edu.educationLevel) {
//             uniqueEducation.add(edu.educationLevel);
//           }
//         });
//       }
//     });

//     // Convert Set to Array and sort
//     this.educationOptions = Array.from(uniqueEducation).map(level => ({ label: level, value: level }));
// }



  editStudent(student: any) {
    console.log("Editing Student:", student);  
    console.log("Student ID:", student.id);    
  
    this.selectedStudent = { ...student };
    this.editDialog = true;
    
 
    if (student.id) {
      this.router.navigate([`editUser`, student.id]);  
    } else {
      console.error("Invalid student ID, cannot navigate!");
    }
  }
  
  

  updateStudent(student: any) {
    this.studentService.updateStudent(student).subscribe(
      () => {
        this.loadStudents(this.currentPage); 
        this.editDialog = false;  
      },
      (error) => {
        console.error('Error updating student:', error);
      }
    );
  }
  

  
  confirmDelete(student: any) {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.deleteStudent(student.id).subscribe(
        () => {
          // Remove the deleted student from the array immediately
          this.students = this.students.filter(s => s.id !== student.id);
          
          // Update the filteredStudents list to reflect the change
          this.filteredStudents = this.filteredStudents.filter(s => s.id !== student.id);
  
          // Reduce the total count of records
          this.totalRecords -= 1;
  
          console.log("Student deleted successfully.");
        },
        (error) => {
          console.error('Error deleting student:', error);
        }
      );
    }
  }
  
  
  
  


  applyFilters() {
    this.filteredStudents = this.students.filter(student => {
      let genderMatch = this.selectedGender ? student.gender === this.selectedGender : true;
      let educationMatch = this.selectedEducation
        ? student.education.some((edu: any) => edu.educationLevel === this.selectedEducation)
        : true;
      
      return genderMatch && educationMatch;
    });
  }

  exportToExcel() {
    
    const exportData = this.filteredStudents.map(student => {
      const educationInfo = student.education.map((edu: any) => {
        return {
          educationLevel: edu.educationLevel || '',
          institution: edu.institution || '',
          percentage: edu.percentage || '',
          passingYear: edu.passingYear || '',
          marksheetName: edu.marksheets ? edu.marksheets.split('/').pop() : '' // Extract marksheet file name
        };
      });
  
      return {
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        gender: student.gender || '',
        address: student.address || '',
        education: educationInfo.map((info: { educationLevel: string, institution: string, percentage: string, passingYear: string, marksheetName: string }) => 
          `Level: ${info.educationLevel}, Institute: ${info.institution}, Percentage: ${info.percentage}, Passing Year: ${info.passingYear}`).join('; '),
        marksheet: educationInfo.map((info: { marksheetName: string }) => info.marksheetName).join('; ') // Join all marksheet names if more than one
      };
    });
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
  
    XLSX.writeFile(wb, 'filtered_students.xlsx');
  }
  
}
