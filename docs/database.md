# Database Design

Stage Passport uses a relational data model to represent live music history across users, performances, artists, venues, concerts, genres, sub-genres, and tags.

The database is designed to support flexible querying, normalized catalog data, and future expansion into analytics, recommendations, and integrations.

## Design Goals

The database is designed for:

* User-specific concert archives
* Searchable performance history
* Artist and venue history pages
* Concert grouping
* Custom genres, sub-genres, and tags
* Duplicate detection and future entity merging
* Efficient statistics generation
* Long-term support for recommendations and analytics

## Core Concept

The central entity is a performance.

A performance represents one artist appearance at a specific event or concert. Multiple performances can belong to the same concert or show grouping.

```text
User
 |
 v
Performance
 |-------- Artist
 |-------- Venue
 |-------- Concert / Show Group
 |-------- Genre
 |-------- Sub-genre
 |-------- Tags
```

This structure allows Stage Passport to answer questions like:

* How many times has a user seen an artist?
* Which venues has a user visited most?
* What genres does a user attend most often?
* Which artists played at the same concert?
* Which performances share a tag?
* What shows happened in a specific city or year?

## Main Entities

### Users

Stores user identity and profile-level metadata.

Users are authenticated through Firebase, while application-specific data is stored in the Stage Passport database.

### Performances

Stores individual live music records.

A performance can include:

* Artist
* Venue
* City
* Date
* Billing
* Genre
* Sub-genre
* Tags
* Concert grouping
* User ownership
* Created and updated timestamps

### Artists

Stores normalized artist records.

Artist records allow the app to group performance history across repeated appearances by the same artist.

### Venues

Stores normalized venue records.

Venue data supports venue history, city-based organization, and future location-aware features. The roadmap includes support for duplicate venue names across different cities.

### Concerts

Stores grouped show-level records.

A concert can contain multiple performances, which allows festivals, openers, headliners, and multi-artist events to stay connected.

### Genres and Sub-genres

Stores catalog-level music classification data.

Genres and sub-genres support filtering, organization, statistics, and future recommendation features.

### Tags

Stores custom user-defined labels.

Tags allow users to organize performances, artists, and concerts according to their own system. Planned improvements include bulk tagging and richer tag management.

## Relationship Patterns

Stage Passport uses normalized relationships instead of duplicating entity data across records.

Common relationship patterns include:

```text
User 1 → many Performances
Artist 1 → many Performances
Venue 1 → many Performances
Concert 1 → many Performances
Performance many → many Tags
Artist many → many Genres
```

This design keeps shared entities consistent while allowing user-specific history to grow independently.

## Why Relational Data

A relational model is a strong fit because Stage Passport data is highly connected.

Performances need to be queried by:

* User
* Artist
* Venue
* City
* Date
* Concert
* Genre
* Tag
* Search text

Using SQL makes it easier to express these relationships, enforce consistency, and support future analytics.

## Query Use Cases

The schema supports core app workflows such as:

* Fetching a user archive
* Grouping performances into concerts
* Viewing artist history
* Viewing venue history
* Searching performances
* Filtering by genre, city, tag, or date
* Generating user statistics
* Detecting duplicate artists, venues, or catalog entries

## Performance Considerations

The database design supports performance improvements through:

* Normalized catalog tables
* Indexed lookup fields
* Batched writes
* Delta-based synchronization
* Memoized statistics
* Background refresh jobs
* Repository-level query abstraction

These patterns help the app remain responsive as users add more concerts and catalog data grows.

## Future Improvements

Planned database improvements include:

* PostgreSQL as the primary production database
* Dedicated development database
* Duplicate entity detection and merging
* Better venue disambiguation across cities
* Background catalog synchronization
* Event-driven updates for statistics and recommendations
* More advanced analytics tables

These items reflect the current Stage Passport roadmap and Trello planning work.
