package com.stagepassport.backend.service;

import com.stagepassport.backend.dto.catalog.BillingOptionResponse;
import com.stagepassport.backend.dto.catalog.CatalogResponse;
import com.stagepassport.backend.dto.catalog.CatalogSyncRowRequest;
import com.stagepassport.backend.dto.catalog.GenreOptionResponse;
import com.stagepassport.backend.dto.catalog.SubGenreOptionResponse;
import com.stagepassport.backend.dto.catalog.SubGenreRequest;
import com.stagepassport.backend.dto.catalog.TagOptionResponse;
import com.stagepassport.backend.dto.catalog.VenueOptionResponse;
import com.stagepassport.backend.dto.catalog.VenueRequest;
import com.stagepassport.backend.repository.CatalogRepository;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class CatalogService {

    private final CatalogRepository catalogRepository;

    public CatalogService(CatalogRepository catalogRepository) {
        this.catalogRepository = catalogRepository;
    }

    public CatalogResponse getCatalogForUser(String uid) throws Exception {
        return catalogRepository.findByUserId(uid);
    }

    public BillingOptionResponse createBilling(String uid, String name) throws Exception {
        return catalogRepository.insertBilling(uid, name);
    }

    public TagOptionResponse createTag(String uid, String name) throws Exception {
        return catalogRepository.insertTag(uid, name);
    }

    public GenreOptionResponse createGenre(String uid, String name) throws Exception {
        return catalogRepository.insertGenre(uid, name);
    }

    public VenueOptionResponse createVenue(String uid, VenueRequest request) throws Exception {
        return catalogRepository.insertVenue(uid, request);
    }

    public SubGenreOptionResponse createSubGenre(String uid, SubGenreRequest request) throws Exception {
        return catalogRepository.insertSubGenre(uid, request);
    }

    public CatalogResponse syncCatalogForUser(String uid, List<CatalogSyncRowRequest> rows) throws Exception {
        return catalogRepository.syncCatalog(uid, rows);
    }
}