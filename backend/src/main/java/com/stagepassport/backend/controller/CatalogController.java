package com.stagepassport.backend.controller;

import com.stagepassport.backend.dto.CatalogResponse;
import com.stagepassport.backend.security.FirebaseAuthenticationToken;
import com.stagepassport.backend.service.CatalogService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/api/catalog")
    public CatalogResponse getCatalog(Authentication authentication) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        return catalogService.getCatalogForUser(firebaseAuth.getUid());
    }
}