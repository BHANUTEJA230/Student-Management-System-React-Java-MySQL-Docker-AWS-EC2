package student_api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final long startTime = System.currentTimeMillis();

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Student Management System API");
        health.put("timestamp", LocalDateTime.now());
        health.put("uptimeMillis", System.currentTimeMillis() - startTime);
        return ResponseEntity.ok(health);
    }
}
