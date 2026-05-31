package com.stagepassport.backend.service;

import com.stagepassport.backend.dto.CatalogResponse;
import com.stagepassport.backend.repository.CatalogRepository;
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
}