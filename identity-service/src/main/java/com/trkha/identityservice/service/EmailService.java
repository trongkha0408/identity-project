package com.trkha.identityservice.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService {

    JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Xác minh tài khoản - Identity Service");
        message.setText("Mã xác minh của bạn là: " + code + "\nMã có hiệu lực trong 15 phút.");
        mailSender.send(message);
        log.info("Sent verification email to {}", toEmail);
    }

    public void sendResetPasswordEmail(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Reset mật khẩu - Identity Service");
        message.setText("Mã reset mật khẩu của bạn là: " + code + "\nMã có hiệu lực trong 15 phút.");
        mailSender.send(message);
        log.info("Sent reset password email to {}", toEmail);
    }
}