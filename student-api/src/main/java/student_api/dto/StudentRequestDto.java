package student_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class StudentRequestDto {

    @Size(max = 50, message = "Student ID cannot exceed 50 characters")
    private String studentId;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @NotBlank(message = "Department is required")
    @Size(max = 100, message = "Department cannot exceed 100 characters")
    private String department;

    @NotBlank(message = "Course is required")
    @Size(max = 100, message = "Course cannot exceed 100 characters")
    private String course;

    @NotNull(message = "Year of study is required")
    @Min(value = 1, message = "Year of study must be between 1 and 6")
    @Max(value = 6, message = "Year of study must be between 1 and 6")
    private Integer yearOfStudy;

    public StudentRequestDto() {
    }

    public StudentRequestDto(String studentId, String name, String email, String department, String course, Integer yearOfStudy) {
        this.studentId = studentId;
        this.name = name;
        this.email = email;
        this.department = department;
        this.course = course;
        this.yearOfStudy = yearOfStudy;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public Integer getYearOfStudy() {
        return yearOfStudy;
    }

    public void setYearOfStudy(Integer yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
    }
}
