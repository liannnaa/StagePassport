package com.stagepassport.backend.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.stagepassport.backend.dto.performance.PerformanceRequest;
import com.stagepassport.backend.dto.performance.PerformanceResponse;
import com.stagepassport.backend.dto.performance.PerformanceUpdateRequest;

import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;

import java.util.ArrayList;
import java.util.List;

@Repository
public class PerformanceRepository {

    public List<PerformanceResponse> findByUserId(String uid) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        CollectionReference performancesRef = db
                .collection("users")
                .document(uid)
                .collection("performances");

        ApiFuture<QuerySnapshot> future = performancesRef
            .orderBy("dateSortKey", Query.Direction.DESCENDING)
            .get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<PerformanceResponse> performances = new ArrayList<>();

        for (QueryDocumentSnapshot doc : documents) {
            performances.add(new PerformanceResponse(
                    doc.getId(),
                    doc.getString("artist"),
                    doc.getString("billing"),
                    doc.getString("city"),
                    doc.getString("date"),
                    doc.getString("genre"),
                    doc.getString("showId"),
                    doc.getString("showName"),
                    doc.getString("subGenre"),
                    getStringList(doc, "tags"),
                    doc.getString("venue")
            ));
        }

        return performances;
    }

    private List<String> getStringList(DocumentSnapshot doc, String fieldName) {
        Object value = doc.get(fieldName);

        if (!(value instanceof List<?> rawList)) {
            return List.of();
        }

        return rawList.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .toList();
    }

    public PerformanceResponse insert(String uid, PerformanceRequest request) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        DocumentReference ref = db
                .collection("users")
                .document(uid)
                .collection("performances")
                .document();

        Map<String, Object> data = new HashMap<>();
        data.put("artist", request.artist());
        data.put("venue", request.venue());
        data.put("city", request.city());
        data.put("date", request.date());
        data.put("billing", request.billing());
        data.put("tags", request.tags() == null ? List.of() : request.tags());
        data.put("genre", request.genre());
        data.put("subGenre", request.subGenre());
        data.put("showName", request.showName());
        data.put("showId", request.showId());
        data.put("artistNormalized", normalizeText(request.artist()));
        data.put("dateSortKey", toDateSortKey(request.date()));
        data.put("createdAt", FieldValue.serverTimestamp());
        data.put("updatedAt", FieldValue.serverTimestamp());

        ref.set(data).get();

        return new PerformanceResponse(
            ref.getId(),
            request.artist(),
            request.billing(),
            request.city(),
            request.date(),
            request.genre(),
            request.showId(),
            request.showName(),
            request.subGenre(),
            request.tags() == null ? List.of() : request.tags(),
            request.venue()
        );
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private String toDateSortKey(String date) {
        if (date == null) return "";

        String trimmedDate = date.trim();
        String[] parts = trimmedDate.split("-");

        if (parts.length == 3) {
            String month = parts[0];
            String day = parts[1];
            String year = parts[2];
            String fullYear = year.length() == 2 ? "20" + year : year;

            return fullYear + "-"
                    + month.formatted("%2s").replace(' ', '0') + "-"
                    + day.formatted("%2s").replace(' ', '0');
        }

        return trimmedDate;
    }

    public List<PerformanceResponse> insertMany(String uid, List<PerformanceRequest> requests) throws Exception {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }

        Firestore db = FirestoreClient.getFirestore();

        CollectionReference performancesRef = db
                .collection("users")
                .document(uid)
                .collection("performances");

        WriteBatch batch = db.batch();

        List<PerformanceResponse> createdPerformances = new ArrayList<>();

        for (PerformanceRequest request : requests) {
            DocumentReference ref = performancesRef.document();

            Map<String, Object> data = new HashMap<>();
            data.put("artist", request.artist());
            data.put("venue", request.venue());
            data.put("city", request.city());
            data.put("date", request.date());
            data.put("billing", request.billing());
            data.put("tags", request.tags() == null ? List.of() : request.tags());
            data.put("genre", request.genre());
            data.put("subGenre", request.subGenre());
            data.put("showName", request.showName());
            data.put("showId", request.showId());
            data.put("artistNormalized", normalizeText(request.artist()));
            data.put("dateSortKey", toDateSortKey(request.date()));
            data.put("createdAt", FieldValue.serverTimestamp());
            data.put("updatedAt", FieldValue.serverTimestamp());

            batch.set(ref, data);

            createdPerformances.add(new PerformanceResponse(
                    ref.getId(),
                    request.artist(),
                    request.billing(),
                    request.city(),
                    request.date(),
                    request.genre(),
                    request.showId(),
                    request.showName(),
                    request.subGenre(),
                    request.tags() == null ? List.of() : request.tags(),
                    request.venue()
            ));
        }

        batch.commit().get();

        return createdPerformances;
    }

    public void update(String uid, String performanceId, PerformanceRequest request) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        DocumentReference ref = db
                .collection("users")
                .document(uid)
                .collection("performances")
                .document(performanceId);

        Map<String, Object> data = new HashMap<>();
        data.put("artist", request.artist());
        data.put("venue", request.venue());
        data.put("city", request.city());
        data.put("date", request.date());
        data.put("billing", request.billing());
        data.put("tags", request.tags() == null ? List.of() : request.tags());
        data.put("genre", request.genre());
        data.put("subGenre", request.subGenre());
        data.put("showName", request.showName());
        data.put("showId", request.showId());
        data.put("artistNormalized", normalizeText(request.artist()));
        data.put("dateSortKey", toDateSortKey(request.date()));
        data.put("updatedAt", FieldValue.serverTimestamp());

        ref.update(data).get();
    }

    public void delete(String uid, String performanceId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        db.collection("users")
                .document(uid)
                .collection("performances")
                .document(performanceId)
                .delete()
                .get();
    }

    public List<PerformanceResponse> updateMany(String uid, List<PerformanceUpdateRequest> updates) throws Exception {
        if (updates == null || updates.isEmpty()) {
            return List.of();
        }

        Firestore db = FirestoreClient.getFirestore();

        CollectionReference performancesRef = db
                .collection("users")
                .document(uid)
                .collection("performances");

        WriteBatch batch = db.batch();

        List<PerformanceResponse> updatedPerformances = new ArrayList<>();

        for (PerformanceUpdateRequest update : updates) {
            PerformanceRequest request = update.performance();

            DocumentReference ref = performancesRef.document(update.id());

            Map<String, Object> data = new HashMap<>();
            data.put("artist", request.artist());
            data.put("venue", request.venue());
            data.put("city", request.city());
            data.put("date", request.date());
            data.put("billing", request.billing());
            data.put("tags", request.tags() == null ? List.of() : request.tags());
            data.put("genre", request.genre());
            data.put("subGenre", request.subGenre());
            data.put("showName", request.showName());
            data.put("showId", request.showId());
            data.put("artistNormalized", normalizeText(request.artist()));
            data.put("dateSortKey", toDateSortKey(request.date()));
            data.put("updatedAt", FieldValue.serverTimestamp());

            batch.update(ref, data);

            updatedPerformances.add(new PerformanceResponse(
                    update.id(),
                    request.artist(),
                    request.billing(),
                    request.city(),
                    request.date(),
                    request.genre(),
                    request.showId(),
                    request.showName(),
                    request.subGenre(),
                    request.tags() == null ? List.of() : request.tags(),
                    request.venue()
            ));
        }

        batch.commit().get();

        return updatedPerformances;
    }

    public void deleteMany(String uid, List<String> performanceIds) throws Exception {
        if (performanceIds == null || performanceIds.isEmpty()) {
            return;
        }

        Firestore db = FirestoreClient.getFirestore();

        CollectionReference performancesRef = db
                .collection("users")
                .document(uid)
                .collection("performances");

        WriteBatch batch = db.batch();

        for (String performanceId : performanceIds) {
            batch.delete(performancesRef.document(performanceId));
        }

        batch.commit().get();
    }

    public List<PerformanceResponse> findByIds(String uid, List<String> ids) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        List<PerformanceResponse> results = new ArrayList<>();

        for (String id : ids) {
            DocumentSnapshot doc = db.collection("users")
                    .document(uid)
                    .collection("performances")
                    .document(id)
                    .get()
                    .get();

            if (!doc.exists()) continue;

            results.add(new PerformanceResponse(
                    doc.getId(),
                    doc.getString("artist"),
                    doc.getString("billing"),
                    doc.getString("city"),
                    doc.getString("date"),
                    doc.getString("genre"),
                    doc.getString("showId"),
                    doc.getString("showName"),
                    doc.getString("subGenre"),
                    getStringList(doc, "tags"),
                    doc.getString("venue")
            ));
        }

        return results;
    }

    public List<PerformanceResponse> updateGenresByArtist(
            String uid,
            String artistName,
            String genre,
            String subGenre
    ) throws Exception {
        String normalizedArtistName = normalizeText(artistName);

        if (normalizedArtistName.isBlank()) {
            return List.of();
        }

        Firestore db = FirestoreClient.getFirestore();

        CollectionReference performancesRef = db
                .collection("users")
                .document(uid)
                .collection("performances");

        QuerySnapshot snapshot = performancesRef
                .whereEqualTo("artistNormalized", normalizedArtistName)
                .get()
                .get();

        if (snapshot.isEmpty()) {
            return List.of();
        }

        WriteBatch batch = db.batch();
        List<PerformanceResponse> updatedPerformances = new ArrayList<>();

        for (QueryDocumentSnapshot doc : snapshot.getDocuments()) {
            String currentGenre = doc.getString("genre") == null ? "" : doc.getString("genre");
            String currentSubGenre = doc.getString("subGenre") == null ? "" : doc.getString("subGenre");

            if (currentGenre.equals(genre) && currentSubGenre.equals(subGenre)) {
                continue;
            }

            batch.update(doc.getReference(), Map.of(
                    "genre", genre,
                    "subGenre", subGenre,
                    "updatedAt", FieldValue.serverTimestamp()
            ));

            updatedPerformances.add(new PerformanceResponse(
                    doc.getId(),
                    doc.getString("artist"),
                    doc.getString("billing"),
                    doc.getString("city"),
                    doc.getString("date"),
                    genre,
                    doc.getString("showId"),
                    doc.getString("showName"),
                    subGenre,
                    getStringList(doc, "tags"),
                    doc.getString("venue")
            ));
        }

        if (!updatedPerformances.isEmpty()) {
            batch.commit().get();
        }

        return updatedPerformances;
    }
}