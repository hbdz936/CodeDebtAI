'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Metrics } from '@/components/dashboard/metrics';
import { AnalyticsSection } from '@/components/dashboard/analytics-section';
import { FlaggedFilesTable } from '@/components/dashboard/flagged-files-table';
import mockDashboardRaw from '@/data/dashboard-data.json';
import { DashboardTelemetry } from '@/types/dashboard';

// Framer Motion entry stagger animation definitions
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 85, 
      damping: 14 
    } 
  }
};

export default function Dashboard() {
  // Feed dashboard component elements dynamically from mock contract JSON.
  // When integrated in the next phase, this will retrieve data from backend APIs.
  const mockDashboardData = mockDashboardRaw as unknown as DashboardTelemetry;
  const { 
    health_score, 
    total_debt_score, 
    files_scanned, 
    severity_distribution, 
    summary, 
    files 
  } = mockDashboardData;

  // The total flagged files count equals the cumulative severity breakdown total (4+7+11+5 = 27)
  const flaggedFilesCount = severity_distribution.critical + 
                            severity_distribution.high + 
                            severity_distribution.medium + 
                            severity_distribution.low;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto w-full pb-8"
    >
      {/* 1. Metrics Cards Grid (4 columns) */}
      <motion.div variants={itemVariants}>
        <Metrics 
          healthScore={health_score}
          totalDebtScore={total_debt_score}
          flaggedFilesCount={flaggedFilesCount}
          filesScannedCount={files_scanned}
        />
      </motion.div>

      {/* 2. Analytics Section (Severity Donut Chart & Context Summary) */}
      <motion.div variants={itemVariants}>
        <AnalyticsSection 
          severityDistribution={severity_distribution}
          summary={summary}
        />
      </motion.div>

      {/* 3. Flagged Files Data Table */}
      <motion.div variants={itemVariants}>
        <FlaggedFilesTable files={files} />
      </motion.div>
    </motion.div>
  );
}
