import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { getConfig } from '../src/config';

const config = getConfig();

async function exportSchema() {
  try {
    console.log('Exporting database schema...');

    const { HOST, PORT, USER, PASSWORD, DATABASE, SCHEMA } = config.db;

    const pgDumpCommand = `PGPASSWORD="${PASSWORD}" pg_dump \
      -h ${HOST} \
      -p ${PORT} \
      -U ${USER} \
      -d ${DATABASE} \
      --schema=${SCHEMA} \
      --schema-only \
      --no-owner \
      --no-privileges \
      --no-comments`;

    const schemaOutput = execSync(pgDumpCommand, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    });

    const outputPath = join(__dirname, '../db/schema-export.sql');
    writeFileSync(outputPath, schemaOutput);

    console.log(`✅ Schema exported successfully to: ${outputPath}`);
    console.log(`Schema: ${SCHEMA}`);
    console.log(`Database: ${DATABASE}`);
  } catch (error) {
    console.error('❌ Failed to export schema:', error);
    process.exit(1);
  }
}

exportSchema();
