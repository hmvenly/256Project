const db = require("./config/db");

const setupDatabase = async () => {
  try {
    // 1 Departments
    await db.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      )
    `);

    // 2 Sectors
    await db.query(`
      CREATE TABLE IF NOT EXISTS sectors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      )
    `);

    // 3 Admins
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);

    // 4 Students
    await db.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(20) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        department_id INT,
        cgpa DECIMAL(3,2) DEFAULT NULL,
        interview_language VARCHAR(50) DEFAULT 'English',
        cv_path VARCHAR(255) DEFAULT NULL,
        evaluation_score INT DEFAULT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      )
    `);

    // 5 Student Preferred Sectors
    await db.query(`
      CREATE TABLE IF NOT EXISTS student_sectors (
        student_id VARCHAR(20),
        sector_id INT,
        PRIMARY KEY (student_id, sector_id),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE
      )
    `);

    // 6 Companies n Representatives
    await db.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(150) NOT NULL,
        rep_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        interview_language VARCHAR(50) DEFAULT 'English',
        description TEXT,
        quota INT DEFAULT 0,
        min_cgpa DECIMAL(3,2) DEFAULT NULL
      )
    `);

    // 7 Company Preferred Sectors
    await db.query(`
      CREATE TABLE IF NOT EXISTS company_sectors (
        company_id INT,
        sector_id INT,
        PRIMARY KEY (company_id, sector_id),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE
      )
    `);

    // 8 Company Preferred Departments
    await db.query(`
      CREATE TABLE IF NOT EXISTS company_departments (
        company_id INT,
        department_id INT,
        PRIMARY KEY (company_id, department_id),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
      )
    `);

    // 9 Matches 
    await db.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(20) NOT NULL,
        company_id INT NOT NULL,
        is_finalized BOOLEAN DEFAULT FALSE,
        UNIQUE KEY unique_match (student_id, company_id),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    console.log("All YAMS tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Database setup error:", error);
    process.exit(1);
  }
};

setupDatabase();