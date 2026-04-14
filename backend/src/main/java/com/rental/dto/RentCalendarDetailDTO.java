package com.rental.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class RentCalendarDetailDTO {
    public Integer zoneId;
    public String zoneName;
    public Integer year;
    public Integer month;
    public String tenantName;
    public BigDecimal rentValue;
    public String status;
    public String statusIcon;
    public List<MonthSummaryDTO> months = new ArrayList<>();

    public static class MonthSummaryDTO {
        public Integer year;
        public Integer month;
        public String status;
        public String statusIcon;

        public MonthSummaryDTO() {
        }

        public MonthSummaryDTO(Integer year, Integer month, String status, String statusIcon) {
            this.year = year;
            this.month = month;
            this.status = status;
            this.statusIcon = statusIcon;
        }
    }
}
