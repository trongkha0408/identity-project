package com.trkha.identityservice.repository;

import java.util.Optional;

import com.trkha.identityservice.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.trkha.identityservice.entity.RefreshToken;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, String> {

    Optional<RefreshToken> findByToken(String token);

    @Modifying

    @Transactional

    @Query("""

        UPDATE RefreshToken rt

        SET rt.revoked = true

        WHERE rt.user = :user

        AND rt.revoked = false

    """)

    void revokeAllByUser(@Param("user") User user);
}