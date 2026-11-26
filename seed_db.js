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
      ('22201001', 'Aishanur', 'Zalova', 'aishanur.zalova@ug.bilkent.edu.tr', ?, 1, 3.45, 'English', 92),
      ('22201002', 'Beyza', 'Demir', 'beyza.demir@ug.bilkent.edu.tr', ?, 1, 3.30, 'English', 88),
      ('22201003', 'Can', 'Ozturk', 'can.ozturk@ug.bilkent.edu.tr', ?, 2, 2.95, 'Turkish', 85)`,
      [hashedPassword, hashedPassword, hashedPassword]
    );

    await db.query(`
      INSERT IGNORE INTO student_sectors (student_id, sector_id) VALUES
      ('22201001', 1), ('22201001', 2),
      ('22201002', 1), ('22201002', 3),
      ('22201003', 2), ('22201003', 4)
    `);

    console.log("Seed islemi basariyla tamamlandi! Tum test hesaplari icin sifre: 123456");
    process.exit(0);
  } catch (error) {
    console.error("Seed sirasinda hata olustu:", error);
    process.exit(1);
  }
};

seedDatabase();