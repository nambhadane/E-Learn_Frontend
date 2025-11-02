package com.elearnhub.teacher_service.service;

import com.elearnhub.teacher_service.dto.UserDTO;
import com.elearnhub.teacher_service.entity.User;
import com.elearnhub.teacher_service.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists: " + user.getUsername());
        }
        
        // ❌ REMOVE THIS LINE - Password is already encoded in AuthController!
        // user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // ✅ Password is already encoded, just save it as-is
        User savedUser = userRepository.save(user);
        System.out.println("✅ User saved with ID: " + savedUser.getId() + " Role: " + savedUser.getRole());
        return savedUser;
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(user -> new UserDTO(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole()
                ))
                .collect(Collectors.toList());
    }

    public User updateUser(Long id, User user) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User updatedUser = existingUser.get();
            // Preserve username and role - these should NEVER change via updateUser
            String originalUsername = updatedUser.getUsername();
            String originalRole = updatedUser.getRole();
            
            // Only update email if provided (not null)
            if (user.getEmail() != null) {
                updatedUser.setEmail(user.getEmail());
            }
            // Only update name if provided (not null)
            if (user.getName() != null) {
                updatedUser.setName(user.getName());
            }
            // Only update password if provided and not empty
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                updatedUser.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            
            // Explicitly preserve username and role (prevent accidental changes)
            updatedUser.setUsername(originalUsername);
            updatedUser.setRole(originalRole);
            
            return userRepository.save(updatedUser);
        }
        throw new RuntimeException("User not found with id: " + id);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        // Debug: Log password format to verify encoding
        String passwordPrefix = user.getPassword() != null && user.getPassword().length() > 10
            ? user.getPassword().substring(0, Math.min(30, user.getPassword().length()))
            : "null or too short";
        
        System.out.println("🔍 Authenticated user: " + user.getUsername() + " | Role: " + user.getRole());
        System.out.println("🔐 Password prefix in DB: " + passwordPrefix + "...");
        System.out.println("🔐 Password length: " + (user.getPassword() != null ? user.getPassword().length() : 0));
        System.out.println("🔐 Is BCrypt format: " + (user.getPassword() != null && user.getPassword().startsWith("$2")));
        
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }
    
    // Helper method to reset/update password for a user (for admin use)
    public boolean resetPassword(String username, String newPlainPassword) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return false;
        }
        User user = userOptional.get();
        String encodedPassword = passwordEncoder.encode(newPlainPassword);
        user.setPassword(encodedPassword);
        userRepository.save(user);
        System.out.println("✅ Password reset for user: " + username);
        System.out.println("🔐 New encoded password: " + encodedPassword.substring(0, Math.min(30, encodedPassword.length())) + "...");
        return true;
    }
    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    // ✅ Add this method - used by CourseController to get User from username
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}

