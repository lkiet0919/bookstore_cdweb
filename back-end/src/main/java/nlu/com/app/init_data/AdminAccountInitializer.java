package nlu.com.app.init_data;

import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import nlu.com.app.constant.UserRole;
import nlu.com.app.entity.User;
import nlu.com.app.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminAccountInitializer {

  private static final String ADMIN_USERNAME = "admin";
  private static final String ADMIN_PASSWORD = "admin123";
  private static final String ADMIN_EMAIL = "admin@bookstore.local";

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Bean
  public CommandLineRunner seedAdminAccount() {
    return args -> {
      var existing = userRepository.findByUsername(ADMIN_USERNAME);
      if (existing.isPresent()) {
        User user = existing.get();
        if (user.getRole() != UserRole.ADMIN) {
          user.setRole(UserRole.ADMIN);
          user.setUserRole(UserRole.ADMIN.name());
          userRepository.save(user);
        }
        return;
      }

      User admin = User.builder()
          .username(ADMIN_USERNAME)
          .password(passwordEncoder.encode(ADMIN_PASSWORD))
          .email(ADMIN_EMAIL)
          .role(UserRole.ADMIN)
          .userRole(UserRole.ADMIN.name())
          .created_date(LocalDate.now())
          .build();

      userRepository.save(admin);
    };
  }
}
