const express = require('express')
const morgan = require('morgan')

const api = require('./api')
const sequelize = require('./lib/sequelize')

const app = express()
const port = process.env.PORT || 8000

// app.use(rateLimit);

// const ip_to_user = {};

// function rateLimit(req, res, next) {
//   user_ip = req.ip
//   cur_req_time = Date.now();
//   const initial_bucket_value = 5;

//   user_bucket_data = ip_to_user[user_ip];  // .tokens, .last

//   if (!user_bucket_data) {
//       ip_to_user[user_ip] = {
//           "tokens": initial_bucket_value,
//           "last": cur_req_time
//       }
//   }

//   elapsed = cur_req_time - user_bucket_data.last
//   user_bucket_data.last = cur_req_time

//   user_bucket_data.tokens += tokens_per_second * elapsed

//   if (user_bucket_data.tokens > max_tokens)
//       user_bucket_data.tokens = max_tokens

//   if (user_bucket_data.tokens > 0) {
//       handle_request_normally();
//       user_bucket_data.tokens--;
//   } else {
//       res.status(429).json("You are being rate limited");
//   }
// }

/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'))

app.use(express.json())
app.use(express.static('public'))

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api)

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  })
})

/*
 * This route will catch any errors thrown from our API endpoints and return
 * a response with a 500 status to the client.
 */
app.use('*', function (err, req, res, next) {
  console.error("== Error:", err)
  res.status(500).send({
      error: "Server error.  Please try again later."
  })
})

sequelize.sync().then(function () {
  app.listen(port, function () {
      console.log("== Server is listening on port:", port)
  })
})
