package com.stagepassport.backend.controller;

import com.stagepassport.backend.dto.catalog.BillingOptionResponse;
import com.stagepassport.backend.dto.catalog.CatalogNameRequest;
import com.stagepassport.backend.dto.catalog.CatalogReplaceRequest;
import com.stagepassport.backend.dto.catalog.CatalogReplaceResponse;
import com.stagepassport.backend.dto.catalog.CatalogResponse;
import com.stagepassport.backend.dto.catalog.CatalogSyncRowRequest;
import com.stagepassport.backend.dto.catalog.GenreOptionResponse;
import com.stagepassport.backend.dto.catalog.SubGenreOptionResponse;
import com.stagepassport.backend.dto.catalog.SubGenreRequest;
import com.stagepassport.backend.dto.catalog.TagOptionResponse;
import com.stagepassport.backend.dto.catalog.VenueOptionResponse;
import com.stagepassport.backend.dto.catalog.VenueRequest;
import com.stagepassport.backend.security.FirebaseAuthenticationToken;
import com.stagepassport.backend.service.CatalogService;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PostMapping("/api/catalog/billings")
    public BillingOptionResponse createBilling(Authentication authentication, @RequestBody CatalogNameRequest request) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        return catalogService.createBilling(firebaseAuth.getUid(), request.name());
    }

    @PostMapping("/api/catalog/tags")
    public TagOptionResponse createTag(Authentication authentication, @RequestBody CatalogNameRequest request) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        return catalogService.createTag(firebaseAuth.getUid(), request.name());
    }

    @PostMapping("/api/catalog/genres")
    public GenreOptionResponse createGenre(Authentication authentication, @RequestBody CatalogNameRequest request) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        return catalogService.createGenre(firebaseAuth.getUid(), request.name());
    }

    @PostMapping("/api/catalog/venues")
    public VenueOptionResponse createVenue(Authentication authentication, @RequestBody VenueRequest request) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        return catalogService.createVenue(firebaseAuth.getUid(), request);
    }

    @PostMapping("/api/catalog/subgenres")
    public SubGenreOptionResponse createSubGenre(Authentication authentication, @RequestBody SubGenreRequest request) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        return catalogService.createSubGenre(firebaseAuth.getUid(), request);
    }

    @PostMapping("/api/catalog/sync")
    public CatalogResponse syncCatalog(Authentication authentication, @RequestBody List<CatalogSyncRowRequest> rows) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        return catalogService.syncCatalogForUser(firebaseAuth.getUid(), rows);
    }

    @DeleteMapping("/api/catalog/venues/{id}")
    public void deleteVenue(Authentication authentication, @PathVariable String id) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        catalogService.deleteVenue(firebaseAuth.getUid(), id);
    }

    @DeleteMapping("/api/catalog/billings/{id}")
    public void deleteBilling(Authentication authentication, @PathVariable String id) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        catalogService.deleteBilling(firebaseAuth.getUid(), id);
    }

    @DeleteMapping("/api/catalog/tags/{id}")
    public void deleteTag(Authentication authentication, @PathVariable String id) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        catalogService.deleteTag(firebaseAuth.getUid(), id);
    }

    @DeleteMapping("/api/catalog/genres/{id}")
    public void deleteGenre(Authentication authentication, @PathVariable String id) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        catalogService.deleteGenre(firebaseAuth.getUid(), id);
    }

    @DeleteMapping("/api/catalog/subgenres/{id}")
    public void deleteSubGenre(Authentication authentication, @PathVariable String id) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        catalogService.deleteSubGenre(firebaseAuth.getUid(), id);
    }

    @PutMapping("/api/catalog/replace")
    public CatalogReplaceResponse replaceCatalogValue(Authentication authentication, @RequestBody CatalogReplaceRequest request) throws Exception {
        FirebaseAuthenticationToken firebaseAuth = (FirebaseAuthenticationToken) authentication;
        return catalogService.replaceCatalogValue(firebaseAuth.getUid(), request);
    }
}