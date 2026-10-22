package com.agriloop.controller;

import com.agriloop.model.AppUser;
import com.agriloop.model.Machinery;
import com.agriloop.model.RentalBooking;
import com.agriloop.repo.BookingRepository;
import com.agriloop.repo.MachineryRepository;
import com.agriloop.repo.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository bookings;
    private final MachineryRepository machinery;
    private final UserRepository users;

    public BookingController(
            BookingRepository bookings,
            MachineryRepository machinery,
            UserRepository users
    ) {
        this.bookings = bookings;
        this.machinery = machinery;
        this.users = users;
    }

    @GetMapping
    public List<RentalBooking> all(Authentication authentication) {
        AppUser user = current(authentication);
        List<RentalBooking> allBookings = bookings.findAllByOrderByIdDesc();

        if (user.getRole().equals("ADMIN")) {
            return allBookings;
        }

        if (user.getRole().equals("OWNER")) {
            return allBookings.stream()
                    .filter(booking -> user.getId().equals(booking.getOwnerUserId()))
                    .toList();
        }

        return allBookings.stream()
                .filter(booking -> user.getId().equals(booking.getFarmerUserId()))
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
    @ResponseStatus(HttpStatus.CREATED)
    public RentalBooking create(
            @RequestBody RentalBooking booking,
            Authentication authentication
    ) {
        AppUser farmer = current(authentication);
        if (farmer.getPhone() == null || farmer.getPhone().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Add a phone number to your account before booking"
            );
        }

        Long machineryId = booking.getMachineryId();
        if (machineryId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Machinery is required"
            );
        }

        Machinery machine = machinery.findById(machineryId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Machinery not found"
                ));

        if (farmer.getId().equals(machine.getOwnerUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot book your own machinery"
            );
        }

        if (!machine.isAvailable() || machine.isMaintenanceDue()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Machinery is unavailable"
            );
        }

        if (booking.getStartDate() == null
                || booking.getEndDate() == null
                || booking.getEndDate().isBefore(booking.getStartDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter valid rental dates"
            );
        }

        booking.setFarmerUserId(farmer.getId());
        booking.setFarmerName(farmer.getName());
        booking.setFarmerPhone(farmer.getPhone());
        booking.setFarmerEmail(farmer.getEmail());
        booking.setMachineryName(machine.getName());

        Long ownerUserId = machine.getOwnerUserId();
        if (ownerUserId == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Machinery owner not found"
            );
        }

        booking.setOwnerUserId(ownerUserId);
        AppUser owner = users.findById(ownerUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Machinery owner not found"
                ));
        if (owner.getPhone() == null || owner.getPhone().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The machinery owner has no contact number on their account yet"
            );
        }

        booking.setOwnerName(owner.getName());
        booking.setOwnerPhone(owner.getPhone());
        booking.setOwnerEmail(owner.getEmail());

        long rentalDays = Math.max(
                1,
                ChronoUnit.DAYS.between(
                        booking.getStartDate(),
                        booking.getEndDate()
                ) + 1
        );
        booking.setEstimatedCost(
                machine.getRate().multiply(BigDecimal.valueOf(rentalDays))
        );
        booking.setStatus("PENDING");

        return bookings.save(booking);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public RentalBooking status(
            @PathVariable @NonNull Long id,
            @RequestParam String value,
            Authentication authentication
    ) {
        RentalBooking booking = bookings.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        AppUser user = current(authentication);

        if (!user.getRole().equals("ADMIN")
                && !user.getId().equals(booking.getOwnerUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only manage bookings for your machinery"
            );
        }

        String status = value.toUpperCase();
        if (!List.of("APPROVED", "REJECTED", "COMPLETED", "CANCELLED")
                .contains(status)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid status"
            );
        }

        if (status.equals("COMPLETED")
                && !booking.getStatus().equals("APPROVED")) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only approved bookings can be completed"
            );
        }

        booking.setStatus(status);
        return bookings.save(booking);
    }

    private AppUser current(Authentication authentication) {
        return users.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow();
    }
}
