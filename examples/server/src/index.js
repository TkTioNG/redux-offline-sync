import express from 'express';

const app = express();

app.use((req, _res, next) => {
  let timeoutFactor = 100;
  let timeoutBase = 100;
  if (req.query.slow) {
    timeoutFactor = 2000;
    timeoutBase = 2000;
  }
  return setTimeout(next, Math.random() * timeoutFactor + timeoutBase);
});

app.get('/succeed-always', (_req, res) => {
  res.status(200).send({ some: 'data OK' });
});

app.get('/succeed-sometimes', (_req, res) => {
  if (Math.random() < 0.5) {
    res.status(500).send({ error: 'server error' });
  } else {
    res.status(200).send({ some: 'data OK' });
  }
});

app.get('/fail-sometimes', (_req, res) => {
  if (Math.random() < 0.5) {
    res.status(500).send({ error: 'server error' });
  } else {
    res.status(400).send({ error: 'client error' });
  }
});

app.listen(4000);
