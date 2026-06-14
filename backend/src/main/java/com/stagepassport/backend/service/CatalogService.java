package com.stagepassport.backend.service;

import com.stagepassport.backend.dto.catalog.BillingOptionResponse;
import com.stagepassport.backend.dto.catalog.CatalogReplaceRequest;
import com.stagepassport.backend.dto.catalog.CatalogReplaceResponse;
import com.stagepassport.backend.dto.catalog.CatalogReplacementRequest;
import com.stagepassport.backend.dto.catalog.CatalogResponse;
import com.stagepassport.backend.dto.catalog.CatalogSyncRowRequest;
import com.stagepassport.backend.dto.catalog.GenreOptionResponse;
import com.stagepassport.backend.dto.catalog.SubGenreOptionResponse;
import com.stagepassport.backend.dto.catalog.SubGenreRequest;
import com.stagepassport.backend.dto.catalog.TagOptionResponse;
import com.stagepassport.backend.dto.catalog.VenueOptionResponse;
import com.stagepassport.backend.dto.catalog.VenueRequest;
import com.stagepassport.backend.dto.performance.PerformanceRequest;
import com.stagepassport.backend.dto.performance.PerformanceResponse;
import com.stagepassport.backend.dto.performance.PerformanceUpdateRequest;
import com.stagepassport.backend.repository.CatalogRepository;
import com.stagepassport.backend.repository.PerformanceRepository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class CatalogService {

    private final CatalogRepository catalogRepository;
    private final PerformanceRepository performanceRepository;

    public CatalogService(CatalogRepository catalogRepository, PerformanceRepository performanceRepository) {
        this.catalogRepository = catalogRepository;
        this.performanceRepository = performanceRepository;
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

    public void deleteVenue(String uid, String id) throws Exception {
        catalogRepository.deleteVenue(uid, id);
    }

    public void deleteBilling(String uid, String id) throws Exception {
        catalogRepository.deleteBilling(uid, id);
    }

    public void deleteTag(String uid, String id) throws Exception {
        catalogRepository.deleteTag(uid, id);
    }

    public void deleteGenre(String uid, String id) throws Exception {
        catalogRepository.deleteGenre(uid, id);
    }

    public void deleteSubGenre(String uid, String id) throws Exception {
        catalogRepository.deleteSubGenre(uid, id);
    }

    public CatalogReplaceResponse replaceCatalogValue(String uid, CatalogReplaceRequest request) throws Exception {
        List<PerformanceResponse> allPerformances = performanceRepository.findByUserId(uid);
        List<PerformanceUpdateRequest> updates = new ArrayList<>();
        List<CatalogSyncRowRequest> syncRows = new ArrayList<>();

        for (PerformanceResponse performance : allPerformances) {
            PerformanceRequest next = buildReplacementPerformance(performance, request);

            if (next == null) {
                continue;
            }

            updates.add(new PerformanceUpdateRequest(performance.id(), next));

            syncRows.add(new CatalogSyncRowRequest(
                    next.venue(),
                    next.city(),
                    next.genre(),
                    next.subGenre(),
                    next.billing(),
                    next.tags()
            ));
        }

        List<PerformanceResponse> updatedPerformances = performanceRepository.updateMany(uid, updates);
        CatalogResponse catalog = catalogRepository.syncCatalog(uid, syncRows);
        return new CatalogReplaceResponse(updatedPerformances, catalog);
    }

    private PerformanceRequest buildReplacementPerformance(PerformanceResponse performance, CatalogReplaceRequest request) {
        String type = request.type();
        CatalogReplacementRequest replacement = request.replacement();

        String billing = performance.billing();
        List<String> tags = performance.tags();
        String venue = performance.venue();
        String city = performance.city();
        String genre = performance.genre();
        String subGenre = performance.subGenre();

        boolean shouldUpdate = false;

        if ("billing".equals(type) && normalize(billing).equals(request.oldId())) {
            billing = safe(replacement.billing());
            shouldUpdate = true;
        }

        if ("tag".equals(type)) {
            List<String> nextTags = tags.stream()
                    .map(tag -> normalize(tag).equals(request.oldId())
                            ? safe(replacement.tag())
                            : tag)
                    .filter(tag -> !tag.isBlank())
                    .toList();

            if (!nextTags.equals(tags)) {
                tags = nextTags;
                shouldUpdate = true;
            }
        }

        if ("venue".equals(type) && normalize(venue + "-" + city).equals(request.oldId())) {
            venue = safe(replacement.venue());
            city = safe(replacement.city());
            shouldUpdate = true;
        }

        if ("genre".equals(type) && normalize(genre).equals(request.oldId())) {
            genre = safe(replacement.genre());
            subGenre = "";
            shouldUpdate = true;
        }

        if ("subGenre".equals(type) && normalize(subGenre).equals(normalize(request.oldId()))) {
            subGenre = safe(replacement.subGenre());
            shouldUpdate = true;
        }

        if (!shouldUpdate) {
            return null;
        }

        return new PerformanceRequest(
                performance.artist(),
                venue,
                city,
                performance.date(),
                billing,
                tags,
                genre,
                subGenre,
                performance.showName(),
                performance.showId()
        );
    }

    private String normalize(String value) {
        if (value == null) return "";
        return value.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}