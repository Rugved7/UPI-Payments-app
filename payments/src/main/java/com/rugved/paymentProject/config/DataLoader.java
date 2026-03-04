package com.rugved.paymentProject.config;

import com.rugved.paymentProject.model.ERole;
import com.rugved.paymentProject.model.Role;
import com.rugved.paymentProject.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DataLoader {

    private final RoleRepository roleRepository;

    @Bean
    public CommandLineRunner loadData() {
        return args -> {
            if(roleRepository.findByName(ERole.ROLE_USER).isEmpty()){
                roleRepository.save(new Role(null,ERole.ROLE_USER));
            }
            if(roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()){
                roleRepository.save(new Role(null,ERole.ROLE_ADMIN));
            }
            if(roleRepository.findByName(ERole.ROLE_BANK_ADMIN).isEmpty()){
                roleRepository.save(new Role(null,ERole.ROLE_BANK_ADMIN));
            }
        };
    }
}
