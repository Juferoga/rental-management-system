package com.rental.dto;

public class GlobalSearchResult {
    public String id;
    public String type;
    public String label;
    public String route;

    public GlobalSearchResult() {
    }

    public GlobalSearchResult(String id, String type, String label, String route) {
        this.id = id;
        this.type = type;
        this.label = label;
        this.route = route;
    }
}
