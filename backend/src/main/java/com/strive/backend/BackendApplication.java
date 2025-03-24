package com.strive.backend;

import com.strive.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner updatePasswords(@Autowired AuthService authService) {
		return args -> {
			// Update any plaintext passwords to BCrypt hashes
			authService.updatePasswordEncoding();
		};
	}
}
