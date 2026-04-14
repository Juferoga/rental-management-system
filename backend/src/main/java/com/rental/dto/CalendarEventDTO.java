package com.rental.dto;

import java.time.LocalDate;

public class CalendarEventDTO {
    public LocalDate date;
    public String title;
    public String type;
    public String status;

    public CalendarEventDTO() {
    }

    public CalendarEventDTO(LocalDate date, String title, String type, String status) {
        this.date = date;
        this.title = title;
        this.type = type;
        this.status = status;
    }
}
