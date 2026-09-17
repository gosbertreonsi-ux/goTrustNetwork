import 'dotenv/config'; // 🟢 Load env files
import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function runNetworkAnalytics() {
    console.log("📊 Fetching live financial metrics anonymized...");
    try {
        const res = await pool.query(`
            SELECT COUNT(*) as total_transactions, COALESCE(SUM(amount_cents), 0) as total_volume_cents, COALESCE(SUM(network_fee_cents), 0) as total_revenue_cents FROM transactions;
        `);
        const data = res.rows[0];

        console.log("\n==================================================");
        console.log(`📈  goTrust NETWORK SECURE REPORT  📈`);
        console.log("==================================================");
        console.log(`👥 Total Transactions Forged : ${data.total_transactions}`);
        console.log(`💸 Total Volume Processed    : $${(parseInt(data.total_volume_cents) / 100).toFixed(2)}`);
        console.log(`💰 Accumulated Net Revenue   : $${(parseInt(data.total_revenue_cents) / 100).toFixed(2)}`);
        console.log("==================================================");
    } catch (error) {
        console.error("❌ Analytics Failure:", error);
    } finally {
        await pool.end();
    }
}
runNetworkAnalytics();
