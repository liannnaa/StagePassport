package com.stagepassport.backend.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.stagepassport.backend.dto.PerformanceResponse;
import org.springframework.stereotype.Repository;

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

        ApiFuture<QuerySnapshot> future = performancesRef.get();
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

    private List<String> getStringList(QueryDocumentSnapshot doc, String fieldName) {
        Object value = doc.get(fieldName);

        if (!(value instanceof List<?> rawList)) {
            return List.of();
        }

        return rawList.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .toList();
    }
}