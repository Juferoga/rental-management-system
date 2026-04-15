package com.rental.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    public List<PaymentDetailDTO> payments = new ArrayList<>();

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

    public static class PaymentDetailDTO {
        public Integer id;
        public String estado;
        public String tipoPago;
        public BigDecimal montoEsperado;
        public BigDecimal montoPagado;
        public LocalDate fechaPago;

        public PaymentDetailDTO() {
        }

        public PaymentDetailDTO(
                Integer id,
                String estado,
                String tipoPago,
                BigDecimal montoEsperado,
                BigDecimal montoPagado,
                LocalDate fechaPago
        ) {
            this.id = id;
            this.estado = estado;
            this.tipoPago = tipoPago;
            this.montoEsperado = montoEsperado;
            this.montoPagado = montoPagado;
            this.fechaPago = fechaPago;
        }
    }
}
