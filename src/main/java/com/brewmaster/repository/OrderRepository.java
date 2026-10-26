package com.brewmaster.repository;

import com.brewmaster.entity.Order;
import com.brewmaster.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByDeletedFalse();

    List<Order> findByStatusAndDeletedFalse(com.brewmaster.enums.OrderStatus status);

    long countByDeletedFalse();

    long countByStatusAndDeletedFalse(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) " +
            "FROM Order o " +
            "WHERE o.status = :status AND o.deleted = false")
    BigDecimal sumTotalAmountByStatusAndDeletedFalse(OrderStatus status);
}