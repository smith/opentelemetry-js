/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  BasicTracerProvider,
  SDKRegistrationConfig,
  TracerConfig,
} from '@opentelemetry/sdk-trace-base';
import { StackContextManager } from './StackContextManager';

/**
 * WebTracerConfig provides an interface for configuring a Web Tracer.
 */
export type WebTracerConfig = TracerConfig;

/**
 * This class represents a web tracer with {@link StackContextManager}
 */
export class WebTracerProvider extends BasicTracerProvider {
  /**
   * Constructs a new Tracer instance.
   * @param config Web Tracer config
   */
  constructor(config: WebTracerConfig = {}) {
    super(config);
  }

  /**
   * Register this TracerProvider for use with the OpenTelemetry API.
   * Undefined values may be replaced with defaults, and
   * null values will be skipped.
   *
   * @param config Configuration object for SDK registration
   */
  override register(config: SDKRegistrationConfig = {}): void {
    if (config.contextManager === undefined) {
      config.contextManager = new StackContextManager();
    }
    if (config.contextManager) {
      config.contextManager.enable();
    }

    super.register(config);
  }
}
