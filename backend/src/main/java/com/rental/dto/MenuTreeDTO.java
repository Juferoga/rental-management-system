package com.rental.dto;

import java.util.ArrayList;
import java.util.List;

public class MenuTreeDTO {
    public Integer houseId;
    public String name;
    public List<ZoneItemDTO> zones = new ArrayList<>();

    public MenuTreeDTO() {
    }

    public MenuTreeDTO(Integer houseId, String name) {
        this.houseId = houseId;
        this.name = name;
    }

    public static class ZoneItemDTO {
        public Integer zoneId;
        public String name;

        public ZoneItemDTO() {
        }

        public ZoneItemDTO(Integer zoneId, String name) {
            this.zoneId = zoneId;
            this.name = name;
        }
    }
}
