# 🎓 FFCS Registration System

Welcome to the **FFCS Registration System**! This project is a modern, full-stack web application for managing student course registrations and admin approvals, built with Flask, MySQL, and a beautiful frontend.

---

## 🚀 Features
- Student registration with subject, time slot, and teacher selection
- Admin panel for approving/rejecting registrations
- MySQL database for persistent storage
- RESTful API endpoints for all operations
- Responsive, modern UI

---

## 🛠️ Setup Instructions

1. **Clone the repository**
2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Set up your `.env` file:**
   ```env
   PASSWD=your_mysql_password
   ```
4. **Ensure MySQL is running and a database named `ffcs` exists.**
5. **Run the Flask server:**
   ```bash
   python Server/main.py
   ```
6. **Open `Frontend/index.html` in your browser (served via Flask or any static server).**

---

## 🌐 API Endpoints

### ➕ Register a Student
`POST /register`
- **Body:**
  ```json
  {
    "id": 123456789,
    "student": "Alice",
    "subjects": ["Mathematics", "Physics"],
    "timeSlot": "10:05 AM - 11:35 AM",
    "teacher": "Prof. Johnson",
    "status": "pending",
    "timestamp": "7/13/2025, 9:54:05 PM"
  }
  ```
- **Response:** `{ "success": true }`

### 📋 Get All Registrations
`GET /registrations`
- **Response:**
  ```json
  [
    {
      "id": 123456789,
      "student": "Alice",
      "subjects": ["Mathematics", "Physics"],
      "time_slot": "10:05 AM - 11:35 AM",
      "teacher": "Prof. Johnson",
      "status": "pending",
      "timestamp": "7/13/2025, 9:54:05 PM"
    },
    ...
  ]
  ```

### ✅ Update Registration Status
`POST /registration/status`
- **Body:**
  ```json
  { "id": 123456789, "status": "approved" }
  ```
- **Response:** `{ "success": true }`

---

## 🗄️ MySQL CRUD Example Queries

### Create Table
```sql
CREATE TABLE IF NOT EXISTS registrations (
    id BIGINT PRIMARY KEY,
    student VARCHAR(255),
    subjects TEXT,
    time_slot VARCHAR(255),
    teacher VARCHAR(255),
    status VARCHAR(50),
    timestamp VARCHAR(255)
);
```

### Insert (Create)
```sql
INSERT INTO registrations (id, student, subjects, time_slot, teacher, status, timestamp)
VALUES (123456789, 'Alice', 'Mathematics,Physics', '10:05 AM - 11:35 AM', 'Prof. Johnson', 'pending', '7/13/2025, 9:54:05 PM');
```

### Select (Read)
```sql
SELECT * FROM registrations;
```

### Update
```sql
UPDATE registrations SET status='approved' WHERE id=123456789;
```

### Delete
```sql
DELETE FROM registrations WHERE id=123456789;
```

---

## ✨ Screenshots

> _Add screenshots of your UI here for extra flair!_

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
This project is licensed under the MIT License.

---

> Made with ❤️ for the Software Engineering Project
