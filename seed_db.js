const bcrypt = require("bcryptjs");
const db = require("./config/db");

const seedDatabase = async () => {
  try {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await db.query(`
      INSERT IGNORE INTO departments (id, name) VALUES
      (1, 'Computer Technology and Information Systems (CTIS)'),
      (2, 'Computer Engineering (CS)'),
      (3, 'Industrial Engineering (IE)'),
      (4, 'Management (MAN)')
    `);

    await db.query(`
      INSERT IGNORE INTO sectors (id, name) VALUES
      (1, 'Software'),
      (2, 'Defense'),
      (3, 'Banking'),
      (4, 'Retail')
    `);

    await db.query(
      `INSERT IGNORE INTO admins (email, password) VALUES (?, ?)`,
      ["admin@bilkent.edu.tr", hashedPassword]
    );

    await db.query(
      `INSERT IGNORE INTO companies (id, company_name, rep_name, email, password, interview_language, description, quota, min_cgpa) VALUES
      (1, 'ASELSAN', 'Ahmet Yilmaz', 'hr@aselsan.com.tr', ?, 'Turkish', 'Savunma sanayii ve yazilim teknolojileri.', 2, 2.80),
      (2, 'Garanti BBVA Teknoloji', 'Selin Kaya', 'talent@garantibbva.com.tr', ?, 'English', 'Bankacilik ve finansal yazilim cozumleri.', 2, 2.50)`,
      [hashedPassword, hashedPassword]
    );

    await db.query(`
      INSERT IGNORE INTO company_sectors (company_id, sector_id) VALUES
      (1, 1), (1, 2),
      (2, 1), (2, 3)
    `);
    await db.query(`
      INSERT IGNORE INTO company_departments (company_id, department_id) VALUES
      (1, 1), (1, 2),
      (2, 1), (2, 3)
    `);

    await db.query(
      `INSERT IGNORE INTO students (id, name, surname, email, password, department_id, cgpa, interview_language, evaluation_score) VALUES
      ('22401018', 'Aishanur', 'Zalova', 'aishanur.zalova@ug.bilkent.edu.tr', ?, 1, 3.45, 'English', 92),
      ('22402692', 'Beyza', 'Ulupinar', 'beyza.lupinar@ug.bilkent.edu.tr', ?, 1, 3.30, 'English', 88),
      ('22401019', 'Leyla', 'Huseynzade', 'leyla.huseynzade@ug.bilkent.edu.tr', ?, 2, 2.95, 'Turkish', 85)`,
      [hashedPassword, hashedPassword, hashedPassword]
    );

    await db.query(`
      INSERT IGNORE INTO student_sectors (student_id, sector_id) VALUES
      ('22401018', 1), ('22401018', 2),
      ('22402692', 1), ('22402692', 3),
      ('22401019', 2), ('22401019', 4)
    `);

    console.log("Seed succeded, password for all: 123456");
    process.exit(0);
  } catch (error) {
    console.error("Seed gave error:", error);
    process.exit(1);
  }
};

seedDatabase();