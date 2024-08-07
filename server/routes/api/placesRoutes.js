const express = require('express');
const { Client } = require('@googlemaps/google-maps-services-js');
const router = express.Router();

const client = new Client({});
const apiKey = 'AIzaSyC_3Bp0KcQBmN0C7-olv-LSC5bMVr9ZpgM';

router.get('/nearby', (req, res) => {
  const { location, radius, type } = req.query;

  client
    .placesNearby({
      params: {
        location,
        radius,
        type,
        key: apiKey,
      },
      timeout: 1000,
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.status(500).send(error.response.data.error_message);
    });
});

module.exports = router;
