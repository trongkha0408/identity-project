package com.trkha.identityservice.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "username", unique = true,
            columnDefinition = "VARCHAR(255) COLLATE utf8mb4_unicode_ci")
    String username;

    String password;

    String firstName;

    String lastName;

    LocalDate dob;

    @Column(name = "email", unique = true)
    String email;

    @Column(name = "enabled", nullable = false)
    @Builder.Default
    Boolean enabled = true;

    @Column(name = "locked", nullable = false)
    @Builder.Default
    Boolean locked = false;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    Boolean emailVerified = false;

    @Column(name = "verification_code")
    String verificationCode;

    @Column(name = "verification_code_expiry")
    LocalDateTime verificationCodeExpiry;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @ManyToMany
    Set<Role> roles;

    @OneToMany(mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private Set<RefreshToken> refreshTokens;
}