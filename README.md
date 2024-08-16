# MovieFlex Server

The MovieFlex Server is the backend component of the MovieFlex application, built with Node.js and Express. It provides API endpoints for movie management, user authentication, and various other features needed by the MovieFlex frontend.

## Features

- **User Authentication**: JWT-based authentication for secure access.
- **Movie Management**: Endpoints for fetching movies, searching, filtering, and sorting.
- **Statistics**: Basic user statistics management.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed (version 14 or higher recommended).
- **MongoDB**: A MongoDB database instance is required. Set up a MongoDB cluster and obtain the connection string.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/movieflex-server.git
   cd movieflex-server
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory and add the following variables:

   ```plaintext
   MONGODB=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_jwt_secret
   PORT=5000
   ```

4. **Start the Server**

   ```bash
   npm start
   ```

   The server will be available at `http://localhost:5000`.

## API Endpoints

### Authentication

- **POST /jwt**
  - Generate a JWT token for a user.
  - **Request Body**: `{ "user": { ... } }`
  - **Response**: `{ "token": "your_jwt_token" }`

### User Management

- **GET /users**

  - Retrieve a list of users with optional search.
  - **Query Parameters**: `search` (string)
  - **Response**: Array of user objects

- **POST /users**
  - Register a new user.
  - **Request Body**: User object
  - **Response**: Result of the insert operation

### Movie Management

- **GET /top-movies**

  - Retrieve the top 10 movies sorted by rating.
  - **Response**: Array of movie objects

- **GET /all-movies**
  - Retrieve a paginated list of movies with filtering and sorting.
  - **Query Parameters**:
    - `page` (number)
    - `limit` (number)
    - `query` (string)
    - `category` (string)
    - `rating` (number)
    - `minPrice` (number)
    - `maxPrice` (number)
    - `sortBy` (string: `createdAtDesc`, `createdAtAsc`, `priceAsc`, `priceDesc`)
  - **Response**: Object with `movies` (array of movie objects), `totalPages`, and `currentPage`

## Error Handling

- **404 Not Found**: When accessing an invalid endpoint.
- **500 Internal Server Error**: For any server-side errors.

## Testing

To run tests, ensure you have the appropriate testing setup. Currently, the server does not include automated tests.

## Deployment

For deployment, consider using cloud services such as Heroku, AWS, or similar platforms. Make sure to set the environment variables in your deployment environment.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

1. **Fork the Repository**
2. **Create a New Branch**: `git checkout -b feature/your-feature`
3. **Commit Your Changes**: `git commit -am 'Add some feature'`
4. **Push to the Branch**: `git push origin feature/your-feature`
5. **Create a Pull Request**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**MovieFlex Server** - The backend for the MovieFlex application, providing robust API endpoints for movie and user management.
