package student_api.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import student_api.dto.ApiResponse;
import student_api.dto.StudentRequestDto;
import student_api.dto.StudentResponseDto;
import student_api.service.StudentService;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public ResponseEntity<List<StudentResponseDto>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponseDto> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<StudentResponseDto>> searchStudents(@RequestParam(name = "query", required = false) String query) {
        return ResponseEntity.ok(studentService.searchStudents(query));
    }

    @PostMapping
    public ResponseEntity<StudentResponseDto> addStudent(@Valid @RequestBody StudentRequestDto requestDto) {
        StudentResponseDto created = studentService.createStudent(requestDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponseDto> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequestDto requestDto) {
        StudentResponseDto updated = studentService.updateStudent(id, requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Student deleted successfully with ID: " + id));
    }
}
