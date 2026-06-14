package com.stagepassport.backend.service;

import com.stagepassport.backend.dto.catalog.CatalogResponse;
import com.stagepassport.backend.dto.catalog.CatalogSyncRowRequest;
import com.stagepassport.backend.dto.performance.ArtistGenreSyncRequest;
import com.stagepassport.backend.dto.performance.ArtistGenreSyncResponse;
import com.stagepassport.backend.dto.performance.FullPerformanceBatchRequest;
import com.stagepassport.backend.dto.performance.FullPerformanceBatchResponse;
import com.stagepassport.backend.dto.performance.PerformanceRequest;
import com.stagepassport.backend.dto.performance.PerformanceResponse;
import com.stagepassport.backend.dto.performance.PerformanceUpdateRequest;
import com.stagepassport.backend.repository.CatalogRepository;
import com.stagepassport.backend.repository.PerformanceRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PerformanceService {

    private final PerformanceRepository performanceRepository;
    private final CatalogRepository catalogRepository;

    public PerformanceService(
            PerformanceRepository performanceRepository,
            CatalogRepository catalogRepository
    ) {
        this.performanceRepository = performanceRepository;
        this.catalogRepository = catalogRepository;
    }

    public List<PerformanceResponse> getPerformancesForUser(String uid) throws Exception {
        return performanceRepository.findByUserId(uid);
    }

    public PerformanceResponse createPerformanceForUser(String uid, PerformanceRequest request) throws Exception {
        return performanceRepository.insert(uid, request);
    }

    public List<PerformanceResponse> createPerformancesForUser(String uid, List<PerformanceRequest> requests) throws Exception {
        return performanceRepository.insertMany(uid, requests);
    }

    public void updatePerformanceForUser(String uid, String performanceId, PerformanceRequest request) throws Exception {
        performanceRepository.update(uid, performanceId, request);
    }

    public void deletePerformanceForUser(String uid, String performanceId) throws Exception {
        performanceRepository.delete(uid, performanceId);
    }

    public List<PerformanceResponse> updatePerformancesForUser(String uid, List<PerformanceUpdateRequest> updates) throws Exception {
        return performanceRepository.updateMany(uid, updates);
    }

    public void deletePerformancesForUser(String uid, List<String> performanceIds) throws Exception {
        performanceRepository.deleteMany(uid, performanceIds);
    }

    public ArtistGenreSyncResponse syncGenresByArtist(
            String uid,
            ArtistGenreSyncRequest request
    ) throws Exception {
        String genre = request.genre() == null ? "" : request.genre().trim();
        String subGenre = request.subGenre() == null ? "" : request.subGenre().trim();

        List<PerformanceResponse> updatedPerformances =
                performanceRepository.updateGenresByArtist(
                        uid,
                        request.artistName(),
                        genre,
                        subGenre
                );

        CatalogResponse catalog = catalogRepository.syncCatalog(
                uid,
                List.of(new CatalogSyncRowRequest(
                        "",
                        "",
                        genre,
                        subGenre,
                        "",
                        List.of()
                ))
        );

        return new ArtistGenreSyncResponse(updatedPerformances, catalog);
    }

    public FullPerformanceBatchResponse createBatchFull(
            String uid,
            FullPerformanceBatchRequest request
    ) throws Exception {
        List<PerformanceResponse> created =
                performanceRepository.insertMany(uid, request.performances());

        List<PerformanceResponse> updated = new ArrayList<>();

        if (request.syncArtistGenres()) {
            for (PerformanceRequest performance : request.performances()) {
                updated.addAll(
                        performanceRepository.updateGenresByArtist(
                                uid,
                                performance.artist(),
                                performance.genre(),
                                performance.subGenre()
                        )
                );
            }
        }

        List<CatalogSyncRowRequest> catalogRows = request.performances()
                .stream()
                .map(row -> new CatalogSyncRowRequest(
                        row.venue(),
                        row.city(),
                        row.genre(),
                        row.subGenre(),
                        row.billing(),
                        row.tags()
                ))
                .toList();

        CatalogResponse catalog =
                catalogRepository.syncCatalog(uid, catalogRows);

        return new FullPerformanceBatchResponse(
                created,
                updated,
                catalog
        );
    }
}