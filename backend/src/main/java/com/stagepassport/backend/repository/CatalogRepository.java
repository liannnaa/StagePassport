package com.stagepassport.backend.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.stagepassport.backend.dto.*;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

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
}