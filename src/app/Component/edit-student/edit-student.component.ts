
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StudentServiceService } from '../../service/student-service.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-student-reg',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './edit-student.component.html',
   styleUrls: ['./edit-student.component.css']
})
export class EditStudentComponent implements OnInit{
  educationForm: FormGroup;
  educationLevels = ['10th', '12th', 'UG', 'PG'];
  marksheetLevels = ['10th', '12th', 'UG', 'PG'];
  showPreview = false;
  draftData: any = {};
   studentId: number = 0;
  marksheetPreviews: string[] = [];
  selectedImage: string | null = null;
  fileNames: string[] = []; 



  constructor(private fb: FormBuilder, 
        private route: ActivatedRoute,   //Retrieves parameters from the URL
    private studentService: StudentServiceService,
    private router:Router) {
      this.educationForm = this.fb.group({
        firstName: [null, [Validators.required, this.noWhitespaceValidator]],
        lastName: [null, [Validators.required, this.noWhitespaceValidator]],
        gender: [null, Validators.required],
        address: [null, [Validators.required, this.noWhitespaceValidator]],
        education: this.fb.array([]),
        marksheets: this.fb.array([])
      });
      

    this.addEducation();
    this.addMarksheet();

    
  }



  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      console.log("Route Parameter ID:", idParam); 
  
      if (idParam && !isNaN(Number(idParam))) {
        this.studentId = Number(idParam);
        console.log("Final Parsed ID:", this.studentId);
        this.loadStudentData();
      } else {
        console.error("Invalid or Undefined Student ID:", idParam);
        this.studentId = 0; // Default to prevent API call
      }
    });
  }
  
  get education() {
    return this.educationForm.get('education') as FormArray;
  }
  
  get marksheets() {
    return this.educationForm.get('marksheets') as FormArray;
  }

  noWhitespaceValidator(control: any) {
    if (control.value && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }
  

  loadStudentData(): void {
    if (this.studentId > 0) {
        this.studentService.getStudentById(this.studentId).subscribe(
            (studentData: any) => {
                if (studentData) {
                    console.log("Before Patching Data:", studentData);

                    this.educationForm.patchValue({
                        firstName: studentData.firstName,
                        lastName: studentData.lastName,
                        gender: studentData.gender,
                        address: studentData.address
                    });

                    this.education.clear();
                    if (studentData.education?.length) {
                        studentData.education.forEach((edu: any) => {
                            this.education.push(this.fb.group({
                                institution: [edu.institution, Validators.required],
                                percentage: [edu.percentage, Validators.required],
                                passingYear: [edu.passingYear, Validators.required]
                            }));
                        });
                    } else {
                        this.addEducation(); 
                    }

                    this.marksheets.clear();
                    if (studentData.marksheets?.length) {
                        studentData.marksheets.forEach((mark: any) => {
                            this.marksheets.push(this.fb.group({
                                file: [mark.file],
                                preview: [mark.preview]
                            }));
                        });
                    } else {
                        this.addMarksheet();
                    }

                    this.draftData = { ...studentData }; 
                    console.log("After Patching:", this.educationForm.value);
                } else {
                    console.warn("No student data found!");
                }
            },
            error => {
                console.error("Error loading student data:", error);
            }
        );
    } else {
        console.warn("Invalid student ID, skipping API call.");
    }
}


  addEducation() {
    if (this.education.length < this.educationLevels.length) {
      this.education.push(this.fb.group({
        institution: [null, [Validators.required, this.noWhitespaceValidator]],
        percentage: [null, [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
        passingYear: [null, [Validators.required, Validators.pattern(/^[0-9]{4}$/)]]
      }));
      
  
      this.marksheets.push(this.fb.group({ file: null, preview: '' }));
    } else {
      console.log("You have already added all education levels.");
    }
  }
  
  removeEducation(index: number) {
    if (index !== 0) {
      this.education.removeAt(index);
      this.marksheets.removeAt(index); 
    }
  }
  
  addMarksheet() {
    if (this.marksheets.length < this.educationForm.value.education.length) {
      this.marksheets.push(this.fb.group({ file: null, preview: '' }));
    } else {
      alert("You have already added all required marksheets.");
    }
  }
  


  removeMarksheet(index: number) {
    if (index !== 0) {
      this.marksheets.removeAt(index); 
      this.marksheetPreviews.splice(index, 1); 
      this.education.removeAt(index); 
    }
  }
  

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;
      const allowedTypes = ['image/jpeg', 'application/pdf'];

      if (allowedTypes.includes(fileType)) {

        if (!this.fileNames) this.fileNames = [];
        this.fileNames[index] = file.name;
        const reader = new FileReader();
        reader.onload = () => {
          this.marksheetPreviews[index] = reader.result as string;
        };
        reader.readAsDataURL(file);

      } else {
        alert('Only JPG,  and PDF files are allowed.');
        event.target.value = '';
      }
    }
  }


  onSubmit() {
    if (this.educationForm.valid) {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  
      if (fileInput && fileInput.files?.length) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
  
        this.studentService.uploadFile(formData).subscribe(
          (uploadResponse: any) => {
            console.log('File uploaded:', uploadResponse);
  
           
            const updatedEducation = this.educationForm.value.education.map((edu: any, index: number) => ({
              ...edu,
              educationLevel: edu.educationLevel || this.draftData.education[index]?.educationLevel, 
              marksheets: uploadResponse.folderName + '/' + uploadResponse.fileName
            }));
  
           
            const updatedStudent = {
              ...this.draftData,
              firstName: this.educationForm.value.firstName,
              lastName: this.educationForm.value.lastName,
              gender: this.educationForm.value.gender,
              address: this.educationForm.value.address,
              education: updatedEducation
            };
  
            
            if (this.studentId > 0) {
              this.studentService.updateStudent(updatedStudent).subscribe(
                response => {
                  alert('Data updated successfully!');
                  this.router.navigate(['/dashboard']);
                },
                error => {
                  alert('Error occurred while updating data.');
                }
              );
            } else {
              this.studentService.saveStudent(updatedStudent).subscribe(
                response => {
                  alert('Data saved successfully!');
                  this.router.navigate(['/dashboard']);
                  this.showPreview = false;
                  this.educationForm.reset();
                },
                error => {
                  alert('Error occurred while saving data.');
                }
              );
            }
          },
          error => {
            alert('File upload failed.');
          }
        );
      } else {
        alert('Please upload a file before submitting.');
      }
    } else {
      alert('Please fill all required fields.');
    }
  }
  
}


