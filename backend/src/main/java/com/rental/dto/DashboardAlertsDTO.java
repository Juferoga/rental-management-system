package com.rental.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class DashboardAlertsDTO {
    public List<DebtAlertDTO> debts = new ArrayList<>();
    public List<RentAlertDTO> rents = new ArrayList<>();
    public EarningsChartDTO earnings = new EarningsChartDTO();
    public DebtsChartDTO debtsChart = new DebtsChartDTO();
    public ServicesSummaryDTO services = new ServicesSummaryDTO();

    public static class DebtAlertDTO {
        public String id;
        public String type;
        public Long referenceId;
        public String referenceType;
        public String description;
        public BigDecimal amount;
        public LocalDate dueDate;

        public DebtAlertDTO() {
        }

        public DebtAlertDTO(String id, String type, Long referenceId, String referenceType, String description, BigDecimal amount, LocalDate dueDate) {
            this.id = id;
            this.type = type;
            this.referenceId = referenceId;
            this.referenceType = referenceType;
            this.description = description;
            this.amount = amount;
            this.dueDate = dueDate;
        }
    }

    public static class RentAlertDTO {
        public String zoneId;
        public Long referenceId;
        public String referenceType;
        public String tenantName;
        public BigDecimal value;
        public LocalDate cutoffDate;

        public RentAlertDTO() {
        }

        public RentAlertDTO(String zoneId, Long referenceId, String referenceType, String tenantName, BigDecimal value, LocalDate cutoffDate) {
            this.zoneId = zoneId;
            this.referenceId = referenceId;
            this.referenceType = referenceType;
            this.tenantName = tenantName;
            this.value = value;
            this.cutoffDate = cutoffDate;
        }
    }

    public static class EarningsChartDTO {
        public BigDecimal collected = BigDecimal.ZERO;
        public BigDecimal pending = BigDecimal.ZERO;

        public EarningsChartDTO() {
        }

        public EarningsChartDTO(BigDecimal collected, BigDecimal pending) {
            this.collected = collected;
            this.pending = pending;
        }
    }

    public static class DebtsChartDTO {
        public BigDecimal paid = BigDecimal.ZERO;
        public BigDecimal unpaid = BigDecimal.ZERO;

        public DebtsChartDTO() {
        }

        public DebtsChartDTO(BigDecimal paid, BigDecimal unpaid) {
            this.paid = paid;
            this.unpaid = unpaid;
        }
    }

    public static class ServicesSummaryDTO {
        public BigDecimal total = BigDecimal.ZERO;
        public BigDecimal paid = BigDecimal.ZERO;
        public BigDecimal pending = BigDecimal.ZERO;

        public ServicesSummaryDTO() {
        }

        public ServicesSummaryDTO(BigDecimal total, BigDecimal paid, BigDecimal pending) {
            this.total = total;
            this.paid = paid;
            this.pending = pending;
        }
    }
}
