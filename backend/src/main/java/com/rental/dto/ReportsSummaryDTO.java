package com.rental.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ReportsSummaryDTO {
    public List<OccupancyRatePointDTO> occupancyRates = new ArrayList<>();
    public List<IncomeExpensePointDTO> incomeVsExpenses = new ArrayList<>();
    public DebtStatusDTO debtStatus = new DebtStatusDTO();
    public LocalDate generatedAt = LocalDate.now();

    public static class OccupancyRatePointDTO {
        public int month;
        public int occupiedZones;
        public int totalZones;
        public BigDecimal occupancyRate;

        public OccupancyRatePointDTO() {
        }

        public OccupancyRatePointDTO(int month, int occupiedZones, int totalZones, BigDecimal occupancyRate) {
            this.month = month;
            this.occupiedZones = occupiedZones;
            this.totalZones = totalZones;
            this.occupancyRate = occupancyRate;
        }
    }

    public static class IncomeExpensePointDTO {
        public int month;
        public BigDecimal income;
        public BigDecimal expenses;

        public IncomeExpensePointDTO() {
        }

        public IncomeExpensePointDTO(int month, BigDecimal income, BigDecimal expenses) {
            this.month = month;
            this.income = income;
            this.expenses = expenses;
        }
    }

    public static class DebtStatusDTO {
        public BigDecimal settled = BigDecimal.ZERO;
        public BigDecimal pending = BigDecimal.ZERO;
        public BigDecimal overdue = BigDecimal.ZERO;
        public BigDecimal total = BigDecimal.ZERO;
        public BigDecimal collectionRate = BigDecimal.ZERO;

        public DebtStatusDTO() {
        }

        public DebtStatusDTO(BigDecimal settled, BigDecimal pending, BigDecimal overdue, BigDecimal total, BigDecimal collectionRate) {
            this.settled = settled;
            this.pending = pending;
            this.overdue = overdue;
            this.total = total;
            this.collectionRate = collectionRate;
        }
    }
}
