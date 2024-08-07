require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const { authMiddleware } = require('./utils/auth');
const placesRoutes = require('./routes/api/placesRoutes');
const authRoutes = require('./routes/api/authRoutes');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const { AuthenticationError } = require('./utils/auth');

const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.log(err);
    return err;
  },
});

// Middleware
app.use(helmet());
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
app.use('/api/auth', authRoutes);

// Start Apollo Server
const startApolloServer = async () => {
  await server.start();

  app.use('/graphql', expressMiddleware(server, {
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      if (token) {
        try {
          const { data } = jwt.verify(token.split(' ').pop().trim(), process.env.JWT_SECRET, { maxAge: '2h' });
          return { user: data };
        } catch (err) {
          console.error('Invalid token');
          throw new AuthenticationError();
        }
      }
      return {};
    }
  }));

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

// Call the async function to start the server
startApolloServer();

