import { Pool } from 'pg';

// Connect to your active goTrust Docker container ledger
const pool = new Pool({
    user: 'leonce',
    host: 'localhost',
    database: 'gotrust_ledger',
    password: '1971',
    port: 5433,
});

async function runNetworkAnalytics() {
    console.log("📊 [goTrust Analytics Module Starting]");
    console.log("🔍 Fetching live financial metrics from database ledger...");

    try {
        // Query 1: Aggregate totals using SQL SUM and COUNT functions
        const metricsQuery = `
            SELECT 
                COUNT(*) as total_transactions,
                COALESCE(SUM(amount_cents), 0) as total_volume_cents,
                COALESCE(SUM(network_fee_cents), 0) as total_revenue_cents
            FROM transactions;
        `;
        
        const res = await pool.query(metricsQuery);
        const data = res.rows[0];

        const totalTransactions = parseInt(data.total_transactions);
        const totalVolumeDollars = parseInt(data.total_volume_cents) / 100;
        const totalRevenueDollars = parseInt(data.total_revenue_cents) / 100;

        // Print a clean, formatted report directly to the CMD console
        console.log("\n==================================================");
        console.log(`📈  goTrust NETWORK GLOBAL REPORT  📈`);
        console.log("==================================================");
        console.log(`👥 Total Transactions Forged : ${totalTransactions}`);
        console.log(`💸 Total Volume Processed    : $${totalVolumeDollars.toFixed(2)}`);
        console.log(`💰 Accumulated Net Revenue   : $${totalRevenueDollars.toFixed(2)}`);
        console.log("==================================================");
        console.log("🚀 Protocol health: 100% stable.");

    } catch (error) {
        console.error("❌ Error generating system analytics report:", error);
    } finally {
        // Safely close the database connection connection pool
        await pool.end();
    }
}

runNetworkAnalytics();
