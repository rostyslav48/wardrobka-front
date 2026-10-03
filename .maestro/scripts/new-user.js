// A fresh user per run, so flows never depend on stale seeded accounts.
const stamp = Date.now();
output.user = {
  email: 'qa-maestro-' + stamp + '@example.com',
  name: 'Maestro ' + stamp,
  password: 'Maestro-Pass-1!',
};
