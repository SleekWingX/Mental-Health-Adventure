// server/server.js (or similar file)
require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const { authMiddleware } = require('./utils/auth');
const placesRoutes = require('./routes/api/placesRoutes');
const bodyParser = require('body-parser');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const { AuthenticationError } = require('./utils/auth');
const Stripe = require('stripe');

const PORT = process.env.PORT || 3001;
const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.log(err);
    return err;
  },
});

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static assets
app.use('/images', express.static(path.join(__dirname, '../client/images')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// API Routes
app.use('/api/places', placesRoutes);

// Stripe Payment Route
app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start Apollo Server
const startApolloServer = async () => {
  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: authMiddleware,
    })
  );

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

startApolloServer();
