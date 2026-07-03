# Architecture

Stage Passport is a full-stack concert tracking platform for saving, organizing, and revisiting live music history. The system combines a React Native mobile app with a Spring Boot backend, Firebase authentication, and a relational database designed around performances, artists, venues, concerts, genres, tags, and user-specific history.

## Goals

Stage Passport is designed to support:

* Fast performance creation and editing
* Searchable personal concert history
* Artist, venue, genre, and tag organization
* Secure user-specific data access
* Scalable backend APIs for future analytics, recommendations, and integrations
* Long-term expansion across iOS, Android, web, and additional music services

## High-Level System

```text
React Native Mobile App
        |
        v
Spring Boot REST API
        |
        v
Relational Database

Firebase Authentication
        |
        v
Spring Security Auth Filter
```

## Mobile Application

The mobile app is built with React Native and TypeScript. It provides the primary user experience for creating performances, browsing concert history, searching catalog data, and viewing artist or venue-specific history.

The mobile layer is responsible for:

* User-facing screens and navigation
* Local UI state management
* Calling backend REST APIs
* Passing Firebase identity tokens to protected endpoints
* Displaying grouped concerts, artist history, search results, and user statistics

## Backend API

The backend is built with Java and Spring Boot. It exposes REST endpoints for performance management, user archive data, catalog operations, grouping, filtering, and statistics.

The backend follows a layered structure:

```text
Controller Layer
        |
        v
Service Layer
        |
        v
Repository Layer
        |
        v
Database
```

### Controller Layer

Controllers handle HTTP requests, validate request structure, and delegate business logic to services.

### Service Layer

Services own the core application behavior, including:

* Performance creation and updates
* Concert grouping
* Artist and venue history
* Search and filtering
* Catalog synchronization
* User-specific statistics
* Data normalization and validation

### Repository Layer

Repositories isolate persistence logic and provide a clean boundary between business logic and database access.

## Authentication

Authentication is handled through Firebase. The client obtains a Firebase ID token and sends it with API requests. The backend validates the token through a Spring Security filter before allowing access to protected user data.

```text
User signs in
        |
        v
Firebase issues ID token
        |
        v
Mobile app sends token to API
        |
        v
Spring Security validates token
        |
        v
Request is mapped to authenticated user
```

This keeps user identity management separate from application business logic while allowing the backend to enforce authorization consistently.

## Data Model

The data model is centered around performances. A performance represents a user-recorded live music memory and connects artists, venues, dates, billing, genres, tags, and concert grouping metadata.

Core entities include:

* Users
* Performances
* Artists
* Venues
* Concerts
* Genres
* Sub-genres
* Tags
* User-specific statistics
* Relationship tables for many-to-many associations

## Synchronization Strategy

Stage Passport is designed to support efficient synchronization between mobile and backend data. Current and planned synchronization improvements include:

* Batched writes
* Delta-based updates
* Memoized views
* Background catalog refreshes
* Parallel refresh operations
* Future background job processing

These patterns reduce unnecessary network and database work while keeping the user archive responsive as the dataset grows.

## Planned Architecture Improvements

Planned platform improvements include:

* PostgreSQL as the primary production data store
* Background jobs for catalog synchronization
* Event-driven architecture using Kafka or Google Pub/Sub
* Duplicate entity detection and merging
* Dedicated development and staging databases
* Expanded automated testing and CI/CD
* Improved observability and performance benchmarking

These roadmap items are based on the Stage Passport Trello backlog, including planned work around PostgreSQL, background synchronization, event-driven architecture, duplicate merging, offline support, search, notifications, and catalog improvements.
