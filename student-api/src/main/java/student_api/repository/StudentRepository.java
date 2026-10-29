package student_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import student_api.model.Student;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    Optional<Student> findByStudentId(String studentId);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByStudentId(String studentId);

    boolean existsByStudentIdAndIdNot(String studentId, Long id);

    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.department) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.course) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(s.studentId IS NOT NULL AND LOWER(s.studentId) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Student> searchStudents(@Param("query") String query);
}
