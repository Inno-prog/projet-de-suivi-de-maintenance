package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE') or hasRole('AGENT_DGSI')")
    public ResponseEntity<List<SearchService.SearchResult>> search(@RequestParam("q") String query) {
        try {
            List<SearchService.SearchResult> results = searchService.search(query);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
