package com.studreg.controller;


import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.studreg.model.Student;
import com.studreg.repo.StudentRepository;
import com.studreg.service.StudentService;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

	@Autowired
	private StudentService studentService;
	
	@Autowired
	private StudentRepository studentRepository;


	@PostMapping("/upload")
	public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
		try {
			// Generate a random folder name
			String randomFolderName = UUID.randomUUID().toString();
			Path folderPath = Paths.get("D:/Marksheet/" + randomFolderName);
			Files.createDirectories(folderPath); // Ensure the folder exists

			// Generate a random file name with the original extension
			String originalExtension = getFileExtension(file.getOriginalFilename());
			String randomFileName = UUID.randomUUID().toString() + originalExtension;
			Path zipFilePath = folderPath.resolve(randomFileName + ".zip");

			// Zip the file (but keep the original extension inside the ZIP)
			try (FileOutputStream fos = new FileOutputStream(zipFilePath.toFile());
					ZipOutputStream zipOut = new ZipOutputStream(fos);
					InputStream fis = file.getInputStream()) {

				ZipEntry zipEntry = new ZipEntry(randomFileName); // Keep the correct extension
				zipOut.putNextEntry(zipEntry);
				byte[] buffer = new byte[1024];
				int length;
				while ((length = fis.read(buffer)) >= 0) {
					zipOut.write(buffer, 0, length);
				}
				zipOut.closeEntry();
			}

			// Return only the original filename (not .zip) to store in the database
			Map<String, String> response = new HashMap<>();
			response.put("folderName", randomFolderName);
			response.put("fileName", randomFileName); // Store only the original filename (without .zip)

			return ResponseEntity.ok(response);
		} catch (IOException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Collections.singletonMap("error", "File upload failed"));
		}
	}

	// Helper method to get file extension
	private String getFileExtension(String fileName) {
		return fileName.lastIndexOf(".") != -1 ? fileName.substring(fileName.lastIndexOf(".")) : "";
	}

	@PostMapping("/save")
	public ResponseEntity<Student> saveStudent(@RequestBody Student student) {
		Student savedStudent = studentService.saveStudent(student);
		return ResponseEntity.ok(savedStudent);
	}
	
	@GetMapping("/getAll")
	public ResponseEntity<Map<String, Object>> getAllStudents(
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size) {

	    if (size < 1) size = 10;  //  Ensure page size is at least 1

	    Page<Student> studentPage = studentRepository.findAll(PageRequest.of(page, size));

	    Map<String, Object> response = new HashMap<>();
	    response.put("students", studentPage.getContent()); 
	    response.put("totalRecords", studentPage.getTotalElements());

	    return ResponseEntity.ok(response);
	}
	
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
	    if (!studentRepository.existsById(id)) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body("Student with ID " + id + " not found.");
	    }

	    studentRepository.deleteById(id);
	    return ResponseEntity.ok("Student deleted successfully");
	}

	
	@GetMapping("/{id}")
	public ResponseEntity<?> getStudentById(@PathVariable(required = false) String id) {
	    System.out.println("Received ID from API Request: " + id); //  Debugging Log

	    if (id == null || id.equals("undefined")) {
	        System.err.println("Invalid Student ID received: " + id);
	        return ResponseEntity.badRequest().body("Invalid student ID: NULL or Undefined");
	    }

	    try {
	        Long studentId = Long.parseLong(id);
	        Optional<Student> student = studentRepository.findById(studentId);
	        return student.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	    } catch (NumberFormatException e) {
	        System.err.println("Error converting Student ID: " + id);
	        return ResponseEntity.badRequest().body("Invalid student ID format");
	    }
	}


	
	@PutMapping("/{id}")
	public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
	    System.out.println("Updating Student ID: " + id); 

	    Optional<Student> optionalStudent = studentRepository.findById(id);
	    if (optionalStudent.isEmpty()) {
	        return ResponseEntity.notFound().build();
	    }

	    Student student = optionalStudent.get();
	    student.setFirstName(studentDetails.getFirstName());
	    student.setLastName(studentDetails.getLastName());
	    student.setAddress(studentDetails.getAddress());
	    student.setGender(studentDetails.getGender());
	    student.setEducation(studentDetails.getEducation());

	    Student updatedStudent = studentRepository.save(student);
	    return ResponseEntity.ok(updatedStudent);
	}



//	@GetMapping("/getAll")
//	public ResponseEntity<List<Student>> getAllStudents() {
//		List<Student> students = studentService.getAllStudents();
//		return ResponseEntity.ok(students);
//	}

	// ---------------- store in random file name

//  @PostMapping("/upload")
//  public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
//      try {
//          // Generate a random filename
//          String randomFileName = UUID.randomUUID().toString() + getFileExtension(file.getOriginalFilename());
//          Path uploadPath = Paths.get("D:/Marksheet/" + randomFileName);
//
//          // Compress and store the file
//          byte[] compressedBytes = compressFile(file.getBytes());
//          Files.write(uploadPath, compressedBytes);
//
//          Map<String, String> response = new HashMap<>();
//          response.put("fileName", randomFileName);
//          return ResponseEntity.ok(response);
//      } catch (IOException e) {
//          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                               .body(Collections.singletonMap("error", "File upload failed"));
//      }
//  }

//    @PostMapping("/save")
//    public ResponseEntity<Student> saveStudent(@RequestBody Student student) {
//        Student savedStudent = studentService.saveStudent(student);
//        return ResponseEntity.ok(savedStudent);
//    }
//
//      //----------------  store  in random file name 
//
////    private String getFileExtension(String fileName) {
////        return fileName.lastIndexOf(".") != -1 ? fileName.substring(fileName.lastIndexOf(".")) : "";
////    }
////
////    private byte[] compressFile(byte[] data) throws IOException {
////        ByteArrayOutputStream bos = new ByteArrayOutputStream();
////        try (GZIPOutputStream gzip = new GZIPOutputStream(bos)) {
////            gzip.write(data);
////        }
////        return bos.toByteArray();
////    }

}
