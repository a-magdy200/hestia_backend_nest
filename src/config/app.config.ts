export default () => ({
  appSecret: "secret",
    // process.env.APP_SECRET ||
    // 'PfT-Qd&7}zq7hzn6&2%cWeEb&X1*g,8d.XxR)v48+8N1DlWL|WrIHT55za9Pbj6V9C',
  saltRounds: process.env.SALT_ROUNDS
    ? parseInt(process.env.SALT_ROUNDS, 10)
    : 10,
});
