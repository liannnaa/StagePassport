# Stage Passport

Track every show you've ever attended.

Stage Passport is a full-stack concert tracking platform that helps live music fans build a searchable archive of performances, artists, venues, and concerts. Available on the App Store, Stage Passport combines a native mobile experience with a scalable backend designed to support rich catalog management, fast search, and long-term data growth.

**App Store:** https://apps.apple.com/us/app/stage-passport/id6762957272

---

## Features

- Track concerts, festivals, and live performances
- Organize performances by concert, artist, venue, city, or date
- View artist history and performance statistics
- Create custom genres, sub-genres, venues, and tags
- Fast search across your entire archive
- Automatic grouping of related performances
- Secure authentication and cloud synchronization
- Built for long-term scalability as collections grow

---

## Tech Stack

### Mobile

- React Native
- Expo
- TypeScript

### Backend

- Java
- Spring Boot
- Spring Security
- REST APIs
- Firebase Authentication

### Database

- PostgreSQL
- Normalized relational schema

### Infrastructure

- Docker
- Gradle
- GitHub
- Firebase

---

## Architecture

```
React Native (Expo)
        │
        ▼
Spring Boot REST API
        │
        ▼
 PostgreSQL Database
        │
        ▼
 Firebase Authentication
```

The backend follows a layered architecture consisting of controllers, services, repositories, and domain models. Authentication is handled through Firebase while business logic and persistence are managed by Spring Boot.

---

## Highlights

### REST API

The backend exposes REST endpoints supporting:

- Performance management
- Artist history
- Venue history
- Search
- User statistics
- Catalog management
- Authentication

### Database

Stage Passport uses a normalized relational schema containing ten core tables modeling:

- Users
- Performances
- Concerts
- Artists
- Venues
- Genres
- Sub-genres
- Tags
- Relationships
- Statistics

This enables efficient querying while supporting future feature expansion.

### Performance

Several backend optimizations were implemented including:

- Delta synchronization
- Memoized statistics
- Parallel refresh operations
- Batched database writes
- Repository abstractions

---

## Repository Structure

```
backend/
mobile/
```

---

## Future Roadmap

- Concert recommendations
- Upcoming concert integration
- Social sharing
- Artist discovery
- Import from music services
- Analytics dashboard
- Web application

---

## License

This project is licensed under the MIT License.

---

## Author

Lianna Poblete

- LinkedIn: https://www.linkedin.com/in/liannapoblete
- GitHub: https://github.com/liannnaa
