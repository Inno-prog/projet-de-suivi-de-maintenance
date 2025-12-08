package com.dgsi.maintenance.dto;

import java.util.List;
import java.util.Map;

public class ReportData {
    public String title;
    public String period;
    public String generatedBy;
    public String generatedAt; // format ISO ou texte
    public Map<String, Object> meta; // infos générales

    public List<Map<String,Object>> utilisateurs; // list of prestataires (Map pour flexibilité)
    public List<Map<String,Object>> contrats;
    public List<Map<String,Object>> prestations;
    public List<Map<String,Object>> ordres;
    public List<Map<String,Object>> items;
    public List<Map<String,Object>> evaluations;
    public List<Map<String,Object>> structures;

    // getters / setters ou fields publics (utilise ce qui convient à ton projet)
}