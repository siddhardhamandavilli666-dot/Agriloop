package com.agriloop.repo;

import com.agriloop.model.Machinery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MachineryRepository extends JpaRepository<Machinery, Long> {
    List<Machinery> findByAvailableTrueAndMaintenanceDueFalse();
}
