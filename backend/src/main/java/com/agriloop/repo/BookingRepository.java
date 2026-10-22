package com.agriloop.repo;

import com.agriloop.model.RentalBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<RentalBooking, Long> {
    List<RentalBooking> findAllByOrderByIdDesc();
}
