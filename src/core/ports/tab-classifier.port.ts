import { ClassificationResult } from '../domain/classifier.types';

export interface ITabClassifierPort {
  readonly engineName: string;
  isAvailable(): Promise<boolean>;
  classifyTab(title: string, url: string): Promise<ClassificationResult>;
  classifyBatch(
    items: readonly { title: string; url: string }[]
  ): Promise<readonly ClassificationResult[]>;
}
