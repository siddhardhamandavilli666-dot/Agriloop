# 🌱 AgriLoop – Farm Machinery Rental Platform

AgriLoop is a web-based farm machinery rental platform that connects farmers with machinery owners. It helps farmers access agricultural equipment through rental bookings while enabling machinery owners to manage their equipment and rental requests.

The application provides authentication, role-based access, machinery listings, and booking management, with support for English and Telugu.

## ✨ Features

- **User Authentication:** User registration and login with secure password handling.
- **Role-Based Access:** Separate access for farmers and machinery owners.
- **Machinery Listings:** Browse available agricultural machinery.
- **Rental Bookings:** Submit and manage machinery rental requests.
- **Booking Management:** Update and track booking statuses.
- **Bilingual Interface:** Switch between English and Telugu.
- **Responsive UI:** Bootstrap-based interface for desktop and mobile devices.
- **Database Integration:** MySQL database for persistent data storage.
- **REST API:** Spring Boot backend for application operations.
- **JWT Security:** Token-based authentication for protected endpoints.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite |
| UI | Bootstrap |
| Backend | Java, Spring Boot |
| Security | Spring Security, JWT |
| Database | MySQL |
| API Communication | REST API |
| Language Support | English, Telugu |

## 📁 Project Structure

The project should follow your actual repository structure. A suggested organization is:

```text
AgriLoop/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── .env.example
│
├── database/
│   └── agriloop.sql
│
├── .gitignore
└── README.md
```

*Note: Adjust this structure to match the folders and filenames that actually exist in your project.*

## ⚙️ Prerequisites

Install the following software before running AgriLoop:

- Node.js and npm
- Java Development Kit (JDK), compatible with your Spring Boot configuration
- Maven, or use the project's Maven Wrapper
- MySQL Server
- Visual Studio Code or another code editor

## 🚀 Installation and Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd AgriLoop
```

Replace the repository URL with your actual GitHub repository URL.

### 2. Configure the MySQL Database

Start MySQL and create the database:

```sql
CREATE DATABASE agriloop;
```

If your project includes a SQL setup script, import it using MySQL Workbench or the MySQL command line.

```bash
mysql -u YOUR_MYSQL_USERNAME -p agriloop < database/agriloop.sql
```

Replace the username and SQL file path with the values used in your project.

### 3. Configure Backend Environment Variables

Configure the database connection and JWT secret using your existing Spring Boot configuration.

Example environment variables:

```env
DB_URL=jdbc:mysql://localhost:3306/agriloop
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters
```

Ensure your `application.properties` or `application.yml` actually reads these variables. The names above are examples and must match your configuration.
Spring Boot does not load `.env` files by default, so provide these as environment variables to the backend process. The backend requires `JWT_SECRET`; never expose it in frontend configuration.

Never commit real passwords or JWT secrets to GitHub.

### 4. Run the Backend

Open a terminal in the backend directory:

```bash
cd backend
```

Run the application using Maven:

```bash
mvn spring-boot:run
```

If your project uses the Maven Wrapper, run the appropriate wrapper command instead.

The example frontend configuration assumes the backend is available at:

```text
http://localhost:8080
```

### 5. Configure and Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory if your API client uses `VITE_API_URL`:

```env
VITE_API_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

Format the frontend source:

```bash
npm run format
```

Open the local URL printed by Vite in your browser, commonly:

```text
http://localhost:5173
```

## 🔐 Authentication and Authorization

AgriLoop uses JWT-based authentication and role-based authorization.

- **Farmer:** Can browse machinery and request rentals, subject to the application's configured permissions.
- **Machinery Owner:** Can manage machinery and handle rental bookings, subject to the application's configured permissions.
- **Protected APIs:** Require valid authentication where configured.
- **Public Registration:** Allows users to create supported account types.
- **Password Security:** Passwords should be stored using a secure password-hashing mechanism.

Administrative accounts and additional permissions should be configured according to the backend security rules.

## 🌐 Language Support

AgriLoop supports English and Telugu.

Users can switch languages through the language toggle in the interface. All user-facing text should use the application's translation system to ensure the selected language is applied consistently.

## 🧪 Testing

Run the backend tests:

```bash
cd backend
mvn test
```

Build the frontend:

```bash
cd frontend
npm run build
```

Test the following workflows manually:

1. Register a new farmer account.
2. Register a new machinery-owner account.
3. Sign in with valid credentials.
4. Verify that incorrect credentials display an appropriate error message.
5. Browse available machinery.
6. Create and manage rental bookings according to role permissions.
7. Verify protected endpoints reject unauthorized requests.
8. Switch between English and Telugu.
9. Restart the application and verify database records persist.

## 🔒 Security Notes

- Never upload `.env` files containing secrets.
- Use strong JWT signing secrets.
- Validate request data on the backend.
- Enforce authorization on the server, not only in the frontend.
- Use HTTPS when deploying publicly.
- Restrict database access to trusted services.
- Keep dependencies updated.

## 🚧 Future Enhancements

Potential enhancements include:

- Advanced machinery search and filtering.
- Availability calendars.
- Booking notifications.
- Rental history and dashboards.
- Reviews and ratings.
- Online payments.
- Location-based machinery discovery.

These are planned possibilities, not claims that the features are already implemented.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run the available tests.
5. Submit a pull request with a clear description.

## 📄 License

Choose and add an appropriate open-source license before distributing this project publicly.

---

**AgriLoop — Better access. Stronger farms. Shared growth.**