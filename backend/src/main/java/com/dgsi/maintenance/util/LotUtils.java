package com.dgsi.maintenance.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utilities to normalize/display lot names.
 */
public class LotUtils {

    private static final Pattern DIGIT_PATTERN = Pattern.compile("(\\d+)");

    /**
     * Normalise un nom de lot pour affichage :
     * - Si un nombre est présent, retourne "Lot <nombre>".
     * - Sinon, enlève les mots 'lot' et les parenthèses puis retourne "Lot <reste>" si possible.
     * - Si tout échoue, retourne la chaîne d'origine trimée.
     */
    public static String normalizeLotName(String raw) {
        if (raw == null) return null;
        String s = raw.replaceAll("[()]", " ").trim();

        // Try to find a numeric identifier
        Matcher m = DIGIT_PATTERN.matcher(s);
        if (m.find()) {
            return "Lot " + m.group(1);
        }

        // Remove any occurrence of the word 'lot' (case-insensitive)
        s = s.replaceAll("(?i)\\blot\\b", "").trim();
        s = s.replaceAll("\\s+", " ");
        if (!s.isEmpty()) {
            // Capitalize first char
            String cap = s.substring(0, 1).toUpperCase() + (s.length() > 1 ? s.substring(1) : "");
            return "Lot " + cap;
        }

        return raw.trim();
    }
}
