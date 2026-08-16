import { AnalyticsCollector } from './collector/analytics.collector';
import { AnalyticsProcessor } from './processor/analytics.processor';
import { AnalyticsOverview } from './analytics.types';

export class AnalyticsService {
  static async getOverview(): Promise<AnalyticsOverview> {
    const rawMetrics = await AnalyticsCollector.collectOverview();
    return AnalyticsProcessor.processOverview(rawMetrics);
  }
}
