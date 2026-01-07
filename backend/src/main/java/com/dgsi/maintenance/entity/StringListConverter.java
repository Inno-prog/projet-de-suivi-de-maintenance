package com.dgsi.maintenance.entity;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {

    private static final String SPLIT_CHAR = ",";

    @Override
    public String convertToDatabaseColumn(List<String> stringList) {
        return stringList != null ? String.join(SPLIT_CHAR, stringList) : "";
    }

    @Override
    public List<String> convertToEntityAttribute(String string) {
        if (string == null || string.trim().isEmpty()) {
            return new ArrayList<>();
        }

        // Handle JSON array format ["item1", "item2"]
        if (string.startsWith("[") && string.endsWith("]")) {
            try {
                // Simple JSON array parsing - remove brackets and quotes
                string = string.substring(1, string.length() - 1);
                if (string.trim().isEmpty()) {
                    return new ArrayList<>();
                }
                // Split by comma and clean up quotes and spaces
                return Arrays.stream(string.split(","))
                    .map(s -> s.trim().replaceAll("^\"|\"$", ""))
                    .filter(s -> !s.isEmpty())
                    .collect(java.util.stream.Collectors.toList());
            } catch (Exception e) {
                // Fall back to simple splitting
                return Arrays.asList(string.split(SPLIT_CHAR));
            }
        }

        // Remove PostgreSQL array syntax (curly braces)
        if (string.startsWith("{") && string.endsWith("}")) {
            string = string.substring(1, string.length() - 1);
        }

        return Arrays.asList(string.split(SPLIT_CHAR));
    }
}
