const EXPECTED_TELEMETRY_CODES = [
  'otlp_http',
  'otlp_grpc',
  'datadog',
  'xray',
  'google_trace',
  'azure_monitor',
];

const INTERNAL_CODES = ['opensearch', 'logging'];

function loadTelemetryProviders(nodeEnv: string) {
  jest.resetModules();
  process.env.NODE_ENV = nodeEnv;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const providers = require('../index');
  return providers.TELEMETRY_PROVIDER as {
    code: string;
    name: string;
    featureList: string[];
    configurations?: { name: string; type: string; label: string }[];
  }[];
}

describe('Telemetry providers registry', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('development list includes only supported telemetry providers', () => {
    const telemetryProviders = loadTelemetryProviders('development');
    const codes = telemetryProviders.map(p => p.code).sort();

    expect(codes).toEqual([...EXPECTED_TELEMETRY_CODES].sort());
    INTERNAL_CODES.forEach(code => {
      expect(codes).not.toContain(code);
    });
  });

  it('production list includes only supported telemetry providers', () => {
    const telemetryProviders = loadTelemetryProviders('production');
    const codes = telemetryProviders.map(p => p.code).sort();

    expect(codes).toEqual([...EXPECTED_TELEMETRY_CODES].sort());
    INTERNAL_CODES.forEach(code => {
      expect(codes).not.toContain(code);
    });
  });

  it('all telemetry providers carry telemetry feature and endpoint config', () => {
    const telemetryProviders = loadTelemetryProviders('development');

    telemetryProviders.forEach(provider => {
      expect(provider.featureList).toContain('telemetry');
      expect(provider.configurations).toBeDefined();
      expect(
        provider.configurations?.some(cfg => cfg.name === 'endpoint'),
      ).toBe(true);
    });
  });
});
