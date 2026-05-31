package com.stagepassport.backend.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.stagepassport.backend.dto.catalog.BillingOptionResponse;
import com.stagepassport.backend.dto.catalog.CatalogResponse;
import com.stagepassport.backend.dto.catalog.CatalogSyncRowRequest;
import com.stagepassport.backend.dto.catalog.GenreOptionResponse;
import com.stagepassport.backend.dto.catalog.SubGenreOptionResponse;
import com.stagepassport.backend.dto.catalog.SubGenreRequest;
import com.stagepassport.backend.dto.catalog.TagOptionResponse;
import com.stagepassport.backend.dto.catalog.VenueOptionResponse;
import com.stagepassport.backend.dto.catalog.VenueRequest;

import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class CatalogRepository {

    public CatalogResponse findByUserId(String uid) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        return new CatalogResponse(
                loadVenues(db, uid),
                loadBillings(db, uid),
                loadTags(db, uid),
                loadGenres(db, uid),
                loadSubGenres(db, uid)
        );
    }

    private List<VenueOptionResponse> loadVenues(Firestore db, String uid) throws Exception {
        ApiFuture<QuerySnapshot> future = db.collection("users")
                .document(uid)
                .collection("venues")
                .orderBy("venueName", Query.Direction.ASCENDING)
                .get();

        List<VenueOptionResponse> items = new ArrayList<>();

        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            items.add(new VenueOptionResponse(
                    doc.getId(),
                    getString(doc, "venueName"),
                    getString(doc, "city"),
                    getString(doc, "normalizedKey")
            ));
        }

        return items;
    }

    private List<BillingOptionResponse> loadBillings(Firestore db, String uid) throws Exception {
        ApiFuture<QuerySnapshot> future = db.collection("users")
                .document(uid)
                .collection("billings")
                .orderBy("name", Query.Direction.ASCENDING)
                .get();

        List<BillingOptionResponse> items = new ArrayList<>();

        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            items.add(new BillingOptionResponse(
                    doc.getId(),
                    getString(doc, "name"),
                    getString(doc, "normalizedName")
            ));
        }

        return items;
    }

    private List<TagOptionResponse> loadTags(Firestore db, String uid) throws Exception {
        ApiFuture<QuerySnapshot> future = db.collection("users")
                .document(uid)
                .collection("tags")
                .orderBy("name", Query.Direction.ASCENDING)
                .get();

        List<TagOptionResponse> items = new ArrayList<>();

        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            items.add(new TagOptionResponse(
                    doc.getId(),
                    getString(doc, "name"),
                    getString(doc, "normalizedName")
            ));
        }

        return items;
    }

    private List<GenreOptionResponse> loadGenres(Firestore db, String uid) throws Exception {
        ApiFuture<QuerySnapshot> future = db.collection("users")
                .document(uid)
                .collection("genres")
                .orderBy("name", Query.Direction.ASCENDING)
                .get();

        List<GenreOptionResponse> items = new ArrayList<>();

        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            items.add(new GenreOptionResponse(
                    doc.getId(),
                    getString(doc, "name"),
                    getString(doc, "normalizedName")
            ));
        }

        return items;
    }

    private List<SubGenreOptionResponse> loadSubGenres(Firestore db, String uid) throws Exception {
        ApiFuture<QuerySnapshot> future = db.collection("users")
                .document(uid)
                .collection("subGenres")
                .orderBy("name", Query.Direction.ASCENDING)
                .get();

        List<SubGenreOptionResponse> items = new ArrayList<>();

        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            items.add(new SubGenreOptionResponse(
                    doc.getId(),
                    getString(doc, "genreId"),
                    getString(doc, "name"),
                    getString(doc, "normalizedKey")
            ));
        }

        return items;
    }

    private String getString(QueryDocumentSnapshot doc, String fieldName) {
        String value = doc.getString(fieldName);
        return value == null ? "" : value;
    }

    private String normalizeKey(String value) {
        if (value == null) return "";

        return value.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }

    private String buildVenueKey(String venueName, String city) {
        return normalizeKey(venueName) + "-" + normalizeKey(city);
    }

    private String buildSubGenreKey(String genreName, String subGenreName) {
        return normalizeKey(genreName) + "-" + normalizeKey(subGenreName);
    }

    public BillingOptionResponse insertBilling(String uid, String name) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        String trimmedName = name.trim();
        String normalizedName = normalizeKey(trimmedName);

        DocumentReference ref = db.collection("users")
                .document(uid)
                .collection("billings")
                .document(normalizedName);

        ref.set(Map.of(
                "name", trimmedName,
                "normalizedName", normalizedName,
                "createdAt", FieldValue.serverTimestamp(),
                "updatedAt", FieldValue.serverTimestamp()
        ), SetOptions.merge()).get();

        return new BillingOptionResponse(normalizedName, trimmedName, normalizedName);
    }

    public TagOptionResponse insertTag(String uid, String name) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        String trimmedName = name.trim();
        String normalizedName = normalizeKey(trimmedName);

        DocumentReference ref = db.collection("users")
                .document(uid)
                .collection("tags")
                .document(normalizedName);

        ref.set(Map.of(
                "name", trimmedName,
                "normalizedName", normalizedName,
                "createdAt", FieldValue.serverTimestamp(),
                "updatedAt", FieldValue.serverTimestamp()
        ), SetOptions.merge()).get();

        return new TagOptionResponse(normalizedName, trimmedName, normalizedName);
    }

    public GenreOptionResponse insertGenre(String uid, String name) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        String trimmedName = name.trim();
        String normalizedName = normalizeKey(trimmedName);

        DocumentReference ref = db.collection("users")
                .document(uid)
                .collection("genres")
                .document(normalizedName);

        ref.set(Map.of(
                "name", trimmedName,
                "normalizedName", normalizedName,
                "createdAt", FieldValue.serverTimestamp(),
                "updatedAt", FieldValue.serverTimestamp()
        ), SetOptions.merge()).get();

        return new GenreOptionResponse(normalizedName, trimmedName, normalizedName);
    }

    public VenueOptionResponse insertVenue(String uid, VenueRequest request) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        String venueName = request.venueName().trim();
        String city = request.city().trim();
        String normalizedKey = buildVenueKey(venueName, city);

        DocumentReference ref = db.collection("users")
                .document(uid)
                .collection("venues")
                .document(normalizedKey);

        ref.set(Map.of(
                "venueName", venueName,
                "city", city,
                "normalizedKey", normalizedKey,
                "createdAt", FieldValue.serverTimestamp(),
                "updatedAt", FieldValue.serverTimestamp()
        ), SetOptions.merge()).get();

        return new VenueOptionResponse(normalizedKey, venueName, city, normalizedKey);
    }

    public SubGenreOptionResponse insertSubGenre(String uid, SubGenreRequest request) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        String name = request.name().trim();
        String normalizedKey = buildSubGenreKey(request.genreName(), name);

        DocumentReference ref = db.collection("users")
                .document(uid)
                .collection("subGenres")
                .document(normalizedKey);

        ref.set(Map.of(
                "genreId", request.genreId(),
                "name", name,
                "normalizedKey", normalizedKey,
                "createdAt", FieldValue.serverTimestamp(),
                "updatedAt", FieldValue.serverTimestamp()
        ), SetOptions.merge()).get();

        return new SubGenreOptionResponse(normalizedKey, request.genreId(), name, normalizedKey);
    }

    public CatalogResponse syncCatalog(String uid, List<CatalogSyncRowRequest> rows) throws Exception {
        if (rows == null || rows.isEmpty()) {
                return findByUserId(uid);
        }

        for (CatalogSyncRowRequest row : rows) {
                if (hasText(row.venue()) && hasText(row.city())) {
                insertVenue(uid, new VenueRequest(row.venue(), row.city()));
                }

                GenreOptionResponse genre = null;

                if (hasText(row.genre())) {
                genre = insertGenre(uid, row.genre());
                }

                if (genre != null && hasText(row.subGenre())) {
                insertSubGenre(
                        uid,
                        new SubGenreRequest(
                                genre.id(),
                                genre.name(),
                                row.subGenre()
                        )
                );
                }

                if (hasText(row.billing())) {
                insertBilling(uid, row.billing());
                }

                if (row.tags() != null) {
                for (String tag : row.tags()) {
                        if (hasText(tag)) {
                        insertTag(uid, tag);
                        }
                }
                }
        }

        return findByUserId(uid);
        }

        private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}