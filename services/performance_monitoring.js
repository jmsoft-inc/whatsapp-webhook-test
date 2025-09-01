/**
 * Performance Monitoring Service
 * Tracks system performance metrics and provides insights
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      processingTimes: [],
      fileProcessings: 0,
      adminCommands: 0,
      startTime: Date.now()
    };
    this.maxProcessingTimes = 100; // Keep last 100 processing times
  }

  /**
   * Record a request
   */
  recordRequest() {
    this.metrics.requests++;
  }

  /**
   * Record an error
   */
  recordError() {
    this.metrics.errors++;
  }

  /**
   * Record processing time
   */
  recordProcessingTime(duration) {
    this.metrics.processingTimes.push(duration);
    
    // Keep only the last N processing times
    if (this.metrics.processingTimes.length > this.maxProcessingTimes) {
      this.metrics.processingTimes.shift();
    }
  }

  /**
   * Record file processing
   */
  recordFileProcessing() {
    this.metrics.fileProcessings++;
  }

  /**
   * Record admin command
   */
  recordAdminCommand() {
    this.metrics.adminCommands++;
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const uptime = Date.now() - this.metrics.startTime;
    const avgProcessingTime = this.metrics.processingTimes.length > 0 
      ? this.metrics.processingTimes.reduce((a, b) => a + b, 0) / this.metrics.processingTimes.length 
      : 0;
    
    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests * 100).toFixed(2) 
      : 0;

    return {
      uptime: Math.floor(uptime / 1000), // seconds
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: `${errorRate}%`,
      avgProcessingTime: `${avgProcessingTime.toFixed(2)}ms`,
      fileProcessings: this.metrics.fileProcessings,
      adminCommands: this.metrics.adminCommands,
      requestsPerMinute: this.metrics.requests > 0 
        ? ((this.metrics.requests / (uptime / 1000)) * 60).toFixed(2) 
        : 0
    };
  }

  /**
   * Create performance report for WhatsApp
   */
  createPerformanceReport() {
    const stats = this.getStats();
    
    return `📊 *Performance Report*

⏱️ *Uptime:* ${Math.floor(stats.uptime / 3600)}h ${Math.floor((stats.uptime % 3600) / 60)}m
📈 *Total Requests:* ${stats.requests}
❌ *Errors:* ${stats.errors} (${stats.errorRate})
⚡ *Avg Processing Time:* ${stats.avgProcessingTime}
📄 *Files Processed:* ${stats.fileProcessings}
🔧 *Admin Commands:* ${stats.adminCommands}
🚀 *Requests/Minute:* ${stats.requestsPerMinute}

${stats.errorRate > 5 ? '⚠️ *High error rate detected*' : '✅ *System performing well*'}`;
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      processingTimes: [],
      fileProcessings: 0,
      adminCommands: 0,
      startTime: Date.now()
    };
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor();

module.exports = {
  performanceMonitor,
  PerformanceMonitor
};
