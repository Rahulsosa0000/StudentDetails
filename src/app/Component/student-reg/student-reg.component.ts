import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StudentServiceService } from '../../service/student-service.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ImageModule } from 'primeng/image';
@Component({
  selector: 'app-student-reg',
  imports: [ReactiveFormsModule,CommonModule,ImageModule],
  templateUrl: './student-reg.component.html',
  styleUrl: './student-reg.component.css'
})
export class StudentRegComponent {
  educationForm: FormGroup;
  educationLevels = ['10th', '12th', 'UG', 'PG'];
  marksheetLevels = ['10th', '12th', 'UG', 'PG'];
  showPreview = false;
  draftData: any = {};
  marksheetPreviews: string[] = [];
  fileNames: string[] = []; 
  translateX = 0;
  selectedImage: string | null = null;
  zoomLevel: number = 1;
  rotation: number = 0;
  


  constructor(private fb: FormBuilder, private studentService: StudentServiceService,private router:Router) {
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
      this.marksheets.removeAt(index); // Corresponding marksheet remove
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
      this.marksheets.removeAt(index); // Remove corresponding marksheet
      this.marksheetPreviews.splice(index, 1); // Remove marksheet preview
      this.education.removeAt(index); // Remove corresponding education
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

  openImageModal(imageSrc: string) {
    this.selectedImage = imageSrc;
    this.zoomLevel = 1;
    this.rotation = 0;
  }
  

  closeImageModal() {
    this.selectedImage = null;
  }

  
  zoomIn() {
    this.zoomLevel += 0.1;
  }
  
  zoomOut() {
    if (this.zoomLevel > 0.5) {
      this.zoomLevel -= 0.1;
    }
  }
  
  rotateLeft() {
    this.rotation -= 90;
  }
  
  rotateRight() {
    this.rotation += 90;
  }
  
  zoomImage(event: WheelEvent) {
    event.preventDefault();
    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }
  


previewDetails() {
  if (this.educationForm.valid) {
    const formData = this.educationForm.value;
    formData.education.forEach((edu: any, index: number) => {
      edu.educationLevel = this.educationLevels[index];
    });

    formData.marksheets = this.marksheetPreviews.map((preview, index) => ({
      preview,
      type: this.marksheetLevels[index],
    }));

    this.draftData = formData;
    this.showPreview = true;
  } else {
    alert('Please fill all required fields.');
  }
}
  

  onSubmit() {
  if (this.educationForm.valid) {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    if (fileInput && fileInput.files?.length) {
      const formData = new FormData(); //It uses the same format a form would use if the encoding 
                                       // type were set to "multipart/form-data".
      formData.append('file', fileInput.files[0]);

      // Step 1: Upload file first
      this.studentService.uploadFile(formData).subscribe(
        (uploadResponse: any) => {
          console.log('File uploaded:', uploadResponse);

          // Step 2: Store folder and zipped file path in education[].marksheets
          this.draftData.education = this.educationForm.value.education.map((edu: any, index: number) => ({
            ...edu, // Spread operator
            marksheets: uploadResponse.folderName + '/' + uploadResponse.fileName // Store image 
          }));

      
          this.studentService.saveStudent(this.draftData).subscribe(
            response => {
              console.log('Student saved successfully:', response);
              alert('Data saved successfully!');
              this.router.navigate(['/dashboard']);
              this.showPreview = false;
              this.educationForm.reset();
            },
            error => {
              console.error('Error saving student:', error);
              alert('Error occurred while saving data.');
            }
          );
        },
        error => {
          console.error('Error uploading file:', error);
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

  

  editDraft() {
    this.showPreview = false;
  }
}
