package com.rental.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class OwnerDebtDetailDTO {
    public String id;
    public Integer ownerId;
    public String type;
    public String description;
    public BigDecimal totalAmount;
    public BigDecimal pendingAmount;
    public LocalDate cutoffDate;
    public LocalDate dueDate;
    public String status;
    public Integer creditCardId;
}
