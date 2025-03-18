import { RouterModule, Routes } from '@angular/router';
import { StudentRegComponent } from './Component/student-reg/student-reg.component';
import { StudentdashboardComponent } from './Component/studentdashboard/studentdashboard.component';
import { NgModule } from '@angular/core';
import { EditStudentComponent } from './Component/edit-student/edit-student.component';

export const routes: Routes = [
  { path: '', redirectTo: 'studreg', pathMatch: 'full' },  //  Default route set
  { path: 'studreg', component: StudentRegComponent },
  { path: 'dashboard', component: StudentdashboardComponent },
  { path: 'editUser/:id', component: EditStudentComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
