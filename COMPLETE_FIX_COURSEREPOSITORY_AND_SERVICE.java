// ===================================================================================
// COMPLETE FIX FOR COURSE REPOSITORY AND SERVICE
// Copy these into your backend files
// ===================================================================================

// ===================================================================================
// 1. UPDATE CourseRepository.java
// Replace your existing findByStudentsId method with this:
// ===================================================================================

/*
// In: src/main/java/com/elearnhub/teacher_service/repository/CourseRepository.java

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    @EntityGraph(attributePaths = "students")
    List<Course> findByTeacherId(Long teacherId);
    
    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.students WHERE c.teacherId = :teacherId")
    List<Course> findByTeacherIdWithStudents(@Param("teacherId") Long teacherId);
    
    // ✅ FIXED: Changed method name to avoid conflicts
    @EntityGraph(attributePaths = "students")
    @Query("SELECT DISTINCT c FROM Course c INNER JOIN c.students s WHERE s.id = :studentId")
    List<Course> findCoursesByStudentId(@Param("studentId") Long studentId);
}
*/

// ===================================================================================
// 2. ADD TO CourseService.java
// Add this NEW method to your existing CourseService class:
// ===================================================================================

/*
// In: src/main/java/com/elearnhub/teacher_service/service/CourseService.java

@Service
@Transactional
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    // ... your existing methods ...

    // ✅ NEW: Add this method for student classes
    public List<Course> getCoursesByStudentId(Long studentId) {
        // Use the repository method with the new name
        List<Course> courses = courseRepository.findCoursesByStudentId(studentId);
        
        // Initialize students if null (defensive programming)
        if (courses != null) {
            for (Course course : courses) {
                if (course.getStudents() == null) {
                    course.setStudents(new ArrayList<>());
                }
            }
        }
        
        return courses;
    }

    // ... rest of your existing methods ...
}
*/

// ===================================================================================
// SUMMARY OF CHANGES:
// ===================================================================================
// 1. CourseRepository: Change method name from findByStudentsId → findCoursesByStudentId
// 2. CourseService: Add getCoursesByStudentId() method
// 3. Rebuild project (Maven: mvn clean compile)
// 4. Error should be resolved!
// ===================================================================================

