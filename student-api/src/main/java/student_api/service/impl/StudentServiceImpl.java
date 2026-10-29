package student_api.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import student_api.dto.StudentRequestDto;
import student_api.dto.StudentResponseDto;
import student_api.exception.DuplicateResourceException;
import student_api.exception.ResourceNotFoundException;
import student_api.model.Student;
import student_api.repository.StudentRepository;
import student_api.service.StudentService;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository repository;
    private final Random random = new Random();

    public StudentServiceImpl(StudentRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDto> getAllStudents() {
        return repository.findAll()
                .stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDto getStudentById(Long id) {
        Student student = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        return mapToResponseDto(student);
    }

    @Override
    public StudentResponseDto createStudent(StudentRequestDto requestDto) {
        String email = requestDto.getEmail().trim().toLowerCase();
        if (repository.existsByEmail(email)) {
            throw new DuplicateResourceException("A student with email '" + email + "' already exists");
        }

        String studentId = requestDto.getStudentId();
        if (studentId != null && !studentId.trim().isEmpty()) {
            studentId = studentId.trim();
            if (repository.existsByStudentId(studentId)) {
                throw new DuplicateResourceException("A student with ID '" + studentId + "' already exists");
            }
        } else {
            studentId = generateStudentId();
        }

        Student student = new Student();
        student.setStudentId(studentId);
        student.setName(requestDto.getName().trim());
        student.setEmail(email);
        student.setDepartment(requestDto.getDepartment().trim());
        student.setCourse(requestDto.getCourse().trim());
        student.setYearOfStudy(requestDto.getYearOfStudy());

        Student savedStudent = repository.save(student);
        return mapToResponseDto(savedStudent);
    }

    @Override
    public StudentResponseDto updateStudent(Long id, StudentRequestDto requestDto) {
        Student student = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        String email = requestDto.getEmail().trim().toLowerCase();
        if (repository.existsByEmailAndIdNot(email, id)) {
            throw new DuplicateResourceException("A student with email '" + email + "' already exists");
        }

        String studentId = requestDto.getStudentId();
        if (studentId != null && !studentId.trim().isEmpty()) {
            studentId = studentId.trim();
            if (repository.existsByStudentIdAndIdNot(studentId, id)) {
                throw new DuplicateResourceException("A student with ID '" + studentId + "' already exists");
            }
            student.setStudentId(studentId);
        }

        student.setName(requestDto.getName().trim());
        student.setEmail(email);
        student.setDepartment(requestDto.getDepartment().trim());
        student.setCourse(requestDto.getCourse().trim());
        student.setYearOfStudy(requestDto.getYearOfStudy());

        Student updatedStudent = repository.save(student);
        return mapToResponseDto(updatedStudent);
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        repository.delete(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDto> searchStudents(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllStudents();
        }

        String trimmedQuery = query.trim();
        Map<Long, Student> resultMap = new LinkedHashMap<>();

        // If numeric, check if matches database primary key ID
        if (trimmedQuery.matches("^\\d+$")) {
            try {
                Long id = Long.parseLong(trimmedQuery);
                repository.findById(id).ifPresent(s -> resultMap.put(s.getId(), s));
            } catch (NumberFormatException ignored) {
            }
        }

        // Query by name, email, department, course, or studentId
        List<Student> textMatches = repository.searchStudents(trimmedQuery);
        for (Student s : textMatches) {
            resultMap.put(s.getId(), s);
        }

        return resultMap.values()
                .stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    private StudentResponseDto mapToResponseDto(Student student) {
        return new StudentResponseDto(
                student.getId(),
                student.getStudentId() != null ? student.getStudentId() : "STU-" + student.getId(),
                student.getName(),
                student.getEmail(),
                student.getDepartment(),
                student.getCourse(),
                student.getYearOfStudy()
        );
    }

    private String generateStudentId() {
        String generated;
        do {
            int num = 1000 + random.nextInt(9000);
            generated = "STU-" + num;
        } while (repository.existsByStudentId(generated));
        return generated;
    }
}
