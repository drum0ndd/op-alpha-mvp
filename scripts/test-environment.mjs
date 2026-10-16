// Public, disposable test credentials. Never read the development .env here.
export const TEST_DATABASE_URL = 'postgresql://opalpha_test:opalpha_test_only@127.0.0.1:5433/opalpha_test?schema=public';
export function assertTestDatabase(value) {
  if (value !== TEST_DATABASE_URL) throw new Error('Testes exigem o banco descartável opalpha_test em 127.0.0.1:5433.');
}
