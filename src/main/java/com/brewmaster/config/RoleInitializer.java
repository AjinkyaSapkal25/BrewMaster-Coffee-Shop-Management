package com.brewmaster.config;

import com.brewmaster.entity.Role;
import com.brewmaster.enums.RoleType;
import com.brewmaster.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {

        createRole(RoleType.ROLE_ADMIN, "System Administrator");

        createRole(RoleType.ROLE_MANAGER, "Store Manager");

        createRole(RoleType.ROLE_CASHIER, "Handles Billing and Sales");

        createRole(RoleType.ROLE_BARISTA, "Prepares Coffee Orders");
    }

    private void createRole(RoleType roleType, String description) {

        if (!roleRepository.existsByRoleName(roleType)) {

            Role role = Role.builder()
                    .roleName(roleType)
                    .description(description)
                    .build();

            roleRepository.save(role);

            System.out.println(roleType + " created.");
        }
    }

}