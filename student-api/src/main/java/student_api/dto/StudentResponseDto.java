package student_api.dto;

public class StudentResponseDto {

    private Long id;
    private String studentId;
    private String name;
    private String email;
    private String department;
    private String course;
    private Integer yearOfStudy;

    public StudentResponseDto() {
    }

    public StudentResponseDto(Long id, String studentId, String name, String email, String department, String course, Integer yearOfStudy) {
        this.id = id;
        this.studentId = studentId;
        this.name = name;
        this.email = email;
        this.department = department;
        this.course = course;
        this.yearOfStudy = yearOfStudy;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
