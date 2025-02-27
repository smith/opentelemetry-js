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

import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import * as assert from 'assert';
import type { status as GrpcStatus } from '@grpc/grpc-js';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import {
  hrTimeToMilliseconds,
  hrTimeToMicroseconds,
} from '@opentelemetry/core';
import {
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_NET_PEER_PORT,
  SEMATTRS_RPC_GRPC_STATUS_CODE,
} from '@opentelemetry/semantic-conventions';

export const grpcStatusCodeToOpenTelemetryStatusCode = (
  status: GrpcStatus
): SpanStatusCode => {
  if (status !== undefined && status === 0) {
    return SpanStatusCode.UNSET;
  }
  return SpanStatusCode.ERROR;
};

export const assertSpan = (
  component: string,
  span: ReadableSpan,
  kind: SpanKind,
  validations: {
    name: string;
    status: GrpcStatus;
    netPeerName?: string;
    netPeerPort?: number;
  }
) => {
  assert.strictEqual(span.spanContext().traceId.length, 32);
  assert.strictEqual(span.spanContext().spanId.length, 16);
  assert.strictEqual(span.kind, kind);

  assert.ok(span.endTime);
  assert.strictEqual(span.links.length, 0);

  assert.ok(
    hrTimeToMicroseconds(span.startTime) < hrTimeToMicroseconds(span.endTime)
  );
  assert.ok(hrTimeToMilliseconds(span.endTime) > 0);

  if (span.kind === SpanKind.SERVER) {
    assert.ok(span.spanContext());
  }

  if (
    span.kind === SpanKind.CLIENT &&
    validations.netPeerName !== undefined &&
    validations.netPeerPort !== undefined
  ) {
    assert.strictEqual(
      span.attributes[SEMATTRS_NET_PEER_NAME],
      validations.netPeerName
    );
    assert.strictEqual(
      span.attributes[SEMATTRS_NET_PEER_PORT],
      validations.netPeerPort
    );
  }

  // validations
  assert.strictEqual(span.name, validations.name);
  assert.strictEqual(
    span.status.code,
    grpcStatusCodeToOpenTelemetryStatusCode(validations.status)
  );
  assert.strictEqual(
    span.attributes[SEMATTRS_RPC_GRPC_STATUS_CODE],
    validations.status
  );
};

// Check if sourceSpan was propagated to targetSpan
export const assertPropagation = (
  incomingSpan: ReadableSpan,
  outgoingSpan: ReadableSpan
) => {
  const targetSpanContext = incomingSpan.spanContext();
  const sourceSpanContext = outgoingSpan.spanContext();
  assert.strictEqual(targetSpanContext.traceId, sourceSpanContext.traceId);
  assert.strictEqual(
    incomingSpan.parentSpanContext?.spanId,
    sourceSpanContext.spanId
  );
  assert.strictEqual(
    targetSpanContext.traceFlags,
    sourceSpanContext.traceFlags
  );
  assert.notStrictEqual(targetSpanContext.spanId, sourceSpanContext.spanId);
};
