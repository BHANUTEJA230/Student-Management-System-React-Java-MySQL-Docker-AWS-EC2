package student_api.service;

import student_api.dto.StudentRequestDto;
import student_api.dto.StudentResponseDto;

import java.util.List;

public interface StudentService {

    List<StudentResponseDto> getAllStudents();

    StudentResponseDto getStudentById(Long id);

    StudentResponseDto createStudent(StudentRequestDto requestDto);

    StudentResponseDto updateStudent(Long id, StudentRequestDto requestDto);

    void deleteStudent(Long id);

    List<StudentResponseDto> searchStudents(String query);
}
