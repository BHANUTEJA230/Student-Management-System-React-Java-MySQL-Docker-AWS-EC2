package student_api;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import student_api.dto.StudentRequestDto;
import student_api.dto.StudentResponseDto;
import student_api.exception.DuplicateResourceException;
import student_api.exception.ResourceNotFoundException;
import student_api.model.Student;
import student_api.repository.StudentRepository;
import student_api.service.impl.StudentServiceImpl;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentServiceImpl studentService;

    private Student student;
    private StudentRequestDto requestDto;

    @BeforeEach
    void setUp() {
        student = new Student("STU-1001", "Jane Doe", "jane@example.com", "Computer Science", "B.Tech AIML", 3);
        student.setId(1L);

        requestDto = new StudentRequestDto("STU-1001", "Jane Doe", "jane@example.com", "Computer Science", "B.Tech AIML", 3);
    }

    @Test
    void shouldGetAllStudents() {
        when(studentRepository.findAll()).thenReturn(List.of(student));

        List<StudentResponseDto> result = studentService.getAllStudents();

        assertEquals(1, result.size());
        assertEquals("Jane Doe", result.get(0).getName());
        assertEquals("STU-1001", result.get(0).getStudentId());
    }

    @Test
    void shouldGetStudentById() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        StudentResponseDto result = studentService.getStudentById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("jane@example.com", result.getEmail());
    }

    @Test
    void shouldThrowExceptionWhenStudentNotFound() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> studentService.getStudentById(99L));
    }

    @Test
    void shouldCreateStudentSuccessfully() {
        when(studentRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(studentRepository.existsByStudentId("STU-1001")).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        StudentResponseDto created = studentService.createStudent(requestDto);

        assertNotNull(created);
        assertEquals("Jane Doe", created.getName());
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        when(studentRepository.existsByEmail("jane@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> studentService.createStudent(requestDto));
        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    void shouldDeleteStudent() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        doNothing().when(studentRepository).delete(student);

        studentService.deleteStudent(1L);

        verify(studentRepository, times(1)).delete(student);
    }

    @Test
    void shouldSearchStudentsByQuery() {
        when(studentRepository.searchStudents("Jane")).thenReturn(List.of(student));

        List<StudentResponseDto> results = studentService.searchStudents("Jane");

        assertEquals(1, results.size());
        assertEquals("Jane Doe", results.get(0).getName());
    }
}
