package com.rental.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CreditsSummaryDTO {
    public List<CreditItemDTO> creditCards = new ArrayList<>();
    public List<CreditItemDTO> loans = new ArrayList<>();
    public List<CreditItemDTO> others = new ArrayList<>();

    public static class CreditItemDTO {
        public String id;
        public String description;
        public BigDecimal pendingAmount;
        public String status;

        public CreditItemDTO() {
        }

        public CreditItemDTO(String id, String description, BigDecimal pendingAmount, String status) {
            this.id = id;
            this.description = description;
            this.pendingAmount = pendingAmount;
            this.status = status;
        }
    }
}
