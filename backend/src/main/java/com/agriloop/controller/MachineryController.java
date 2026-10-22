package com.agriloop.controller;

import com.agriloop.model.AppUser;
import com.agriloop.model.Machinery;
import com.agriloop.repo.MachineryRepository;
import com.agriloop.repo.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/machinery")
public class MachineryController {

    private final MachineryRepository repository;
    private final UserRepository users;

    public MachineryController(
            MachineryRepository repository,
            UserRepository users
    ) {
        this.repository = repository;
        this.users = users;
    }

    @GetMapping
    public List<Machinery> all(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location
    ) {
        return repository.findAll().stream()
                .filter(machine -> search == null
                        || (safe(machine.getName())
                        + " " + safe(machine.getDescription())
                        + " " + safe(machine.getType()))
                        .toLowerCase()
                        .contains(search.toLowerCase()))
                .filter(machine -> type == null
                        || type.isBlank()
                        || type.equalsIgnoreCase("All types")
                        || safe(machine.getType()).equalsIgnoreCase(type))
                .filter(machine -> location == null
                        || location.isBlank()
                        || safe(machine.getLocation())
                        .toLowerCase()
                        .contains(location.toLowerCase()))
                .toList();
    }

    @GetMapping("/{id}")
    @NonNull
    public Machinery one(@PathVariable @NonNull Long id) {
        return Objects.requireNonNull(repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    @ResponseStatus(HttpStatus.CREATED)
    public Machinery create(
            @RequestBody Machinery machine,
            Authentication authentication
    ) {
        if (machine.getName() == null || machine.getName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Machinery name is required"
            );
        }

        if (machine.getRate() == null || machine.getRate().signum() < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rate must be zero or more"
            );
        }

        AppUser user = current(authentication);
        machine.setOwnerUserId(user.getId());
        machine.setOwnerName(user.getName());
        machine.setOwnerPhone(user.getPhone());
        machine.setVerified(false);
        if (machine.getRateUnit() == null || machine.getRateUnit().isBlank()) {
            machine.setRateUnit("day");
        }

        return repository.save(machine);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public Machinery update(
            @PathVariable @NonNull Long id,
            @RequestBody Machinery input,
            Authentication authentication
    ) {
        Machinery machine = one(id);
        AppUser user = current(authentication);

        if (!user.getRole().equals("ADMIN")
                && !user.getId().equals(machine.getOwnerUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only edit your own listings"
            );
        }

        machine.setName(input.getName());
        machine.setType(input.getType());
        machine.setLocation(input.getLocation());
        machine.setDescription(input.getDescription());
        machine.setRate(input.getRate());
        machine.setRateUnit(input.getRateUnit());
        machine.setImageUrl(input.getImageUrl());
        machine.setOperatorAvailable(input.isOperatorAvailable());
        machine.setAvailable(input.isAvailable());
        machine.setMaintenanceDue(input.isMaintenanceDue());

        if (user.getRole().equals("ADMIN")) {
            machine.setVerified(input.isVerified());
        }

        return repository.save(machine);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable @NonNull Long id,
            Authentication authentication
    ) {
        Machinery machine = one(id);
        AppUser user = current(authentication);

        if (!user.getRole().equals("ADMIN")
                && !user.getId().equals(machine.getOwnerUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only delete your own listings"
            );
        }

        repository.delete(machine);
    }

    private AppUser current(Authentication authentication) {
        return users.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
