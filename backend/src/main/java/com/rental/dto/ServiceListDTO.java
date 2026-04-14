package com.rental.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ServiceListDTO {
    public Integer id;
    public String zoneName;
    public String tenantName;
    public BigDecimal amount;
    public String status;
    public LocalDate date;

    public ServiceListDTO() {
    }

    public ServiceListDTO(Integer id, String zoneName, String tenantName, BigDecimal amount, String status, LocalDate date) {
        this.id = id;
        this.zoneName = zoneName;
        this.tenantName = tenantName;
        this.amount = amount;
        this.status = status;
        this.date = date;
    }
}
