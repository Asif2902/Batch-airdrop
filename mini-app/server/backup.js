const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');

const DATA_FILE = path.join(__dirname, 'data.json');
const BACKUP_DIR = path.join(__dirname, 'backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

exports.createBackup = () => {
  const date = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `data-${date}.json`);
  
  fs.copyFileSync(DATA_FILE, backupFile);
  
  // Keep only last 7 backups
  const backups = fs.readdirSync(BACKUP_DIR).sort();
  if (backups.length > 7) {
    fs.unlinkSync(path.join(BACKUP_DIR, backups[0]));
  }
};

// Schedule daily backups at 2 AM
schedule.scheduleJob('0 2 * * *', () => {
  exports.createBackup();
});