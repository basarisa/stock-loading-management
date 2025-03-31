# Stock Tasks API

## Overview

Stock Tasks API is designed for managing stock tasks in a warehouse system. This API allows users to create, retrieve, and update stock tasks with different task types and validation rules.

## Technologies Used

- **Node.js** with **Express.js**
- **Supabase** (PostgreSQL) as the database
- **Swagger** for API documentation

## Installation

### Prerequisites

Make sure you have the following installed:

- Node.js (v16 or later)
- npm or yarn
- Supabase account and database setup

### Steps to Install

1. Clone the repository:
   ```sh
   git clone https://github.com/basarisa/stock-loading-management.git
   cd stock-loading-management
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up Supabase:
   - Go to [Supabase](https://supabase.com/) and create a new project.
   - In the **Database** section, navigate to "SQL Editor" and create a table for stock tasks with the following schema `database-schema.sql`: 
     ```sql
     CREATE TABLE stock_tasks (
       tasknumber TEXT PRIMARY KEY,
       createdby TEXT NOT NULL,
       assignedto TEXT NOT NULL,
       product TEXT NOT NULL,
       startedat TIMESTAMP,
       finishedat TIMESTAMP,
       type TEXT CHECK (type IN ('Regular Load', 'Urgent Load', 'Special Load')),
       status TEXT CHECK (status IN ('Created', 'In Progress', 'Done', 'Cancelled')),
       description TEXT,
       dimensions TEXT,
       weight TEXT,
       specialinstructions TEXT
     );
     ```
   - Get your **Supabase URL** and **Anon Key** from the project settings.

4. Set up environment variables: Create a `.env` file and add your Supabase credentials:
   ```env
   PORT=5001
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   ```
5. Start the server:
   ```sh
   npm run dev
   ```
   The server will run at `http://localhost:5001/api`.

## API Documentation

Swagger is integrated to provide API documentation.

### Access Swagger UI

Once the server is running, open your browser and navigate to:

```
http://localhost:5001/docs
```

## API Endpoints

### 1. Get All Stock Tasks

**Endpoint:** `GET /stock-tasks`

- Retrieves all stock tasks.
- **Response:**
  ```json
  [
    {
    "tasknumber": "TASK-001",
    "createdby": "John Doe",
    "assignedto": "Jane Smith",
    "product": "Laptop",
    "startedat": "2025-03-31T17:14:40.972",
    "finishedat": "2025-03-31T18:15:51.677",
    "type": "Regular Load",
    "status": "Done",
    "description": null,
    "dimensions": null,
    "weight": null,
    "specialinstructions": null
  }
  ]
  ```

### 2. Create a New Stock Task

**Endpoint:** `POST /stock-tasks`

- Creates a new stock task with specific validation rules.
- **Request Body:**
  ```json
  {
    "tasknumber": "TASK-002",
    "createdby": "Michael Green",
    "assignedto": "Sarah White",
    "product": "Refrigerator",
    "type": "Special Load",
    "description": null,
    "dimensions": "70x80x180 cm",
    "weight": "75 kg",
    "specialinstructions": "Requires two people to move"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Stock task created successfully!",
    "data": {  }
  }
  ```

### 3. Update a Stock Task

**Endpoint:** `PUT /stock-tasks/{taskNumber}`

- Updates the status and other details of a stock task.
- **Request Body:**
  ```json
  {
    "new_status": "Done",
    "description": "Checked and verified"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Stock Task updated successfully!",
    "data": { }
  }
  ```

## Update Stock Task Logic

The `updateStockTask` function updates an existing stock task based on the provided `taskNumber`. Below are the key validation rules applied:

### 1. Task Existence Check
- If the task number does not exist, the response will be:
  ```json
  {
    "message": "Stock Task not found"
  }
  ```

### 2. Status Validation
- Only tasks of type `Regular Load` can be cancelled by the requester.

### 3. Urgent Load Validation
- If the task type is `Urgent Load`, a description is required; otherwise, an error is returned.
- If the task type is not `Urgent Load`, descriptions are not allowed.

### 4. Special Load Validation
- If the task type is `Special Load`, it must include `dimensions`, `weight`, and `special instructions`.
- If the task type is not `Special Load`, these fields should not be provided.

### 5. Status-Based Updates
- If the status is updated to `Done`, the system automatically sets a `finishedAt` timestamp.

## License

This project is licensed under the MIT License.

