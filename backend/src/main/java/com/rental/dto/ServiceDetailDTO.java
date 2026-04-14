package com.rental.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ServiceDetailDTO {
    public String address;
    public BigDecimal totalValue;
    public List<ServiceRowDTO> services = new ArrayList<>();

    public static class ServiceRowDTO {
        public String responsible;
        public BigDecimal value;
        public String type;
        public String status;
        public boolean isShared;
        public String marker;

        public ServiceRowDTO() {
        }

        public ServiceRowDTO(String responsible, BigDecimal value, String type, String status, boolean isShared, String marker) {
            this.responsible = responsible;
            this.value = value;
            this.type = type;
            this.status = status;
            this.isShared = isShared;
            this.marker = marker;
        }
    }
}
